import axios from 'axios';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';

import { newsSources, palestineKeywords, prioritySources, additionalFeeds } from '../sources/sources.js';
import { config } from '../config/config.js';
import { logger, delay, sanitizeText, isValidUrl } from '../utils/logger.js';

export class NewsScraper {
    constructor() {
        this.rssParser = new Parser();
        this.axiosConfig = {
            timeout: config.scraping.timeout,
            headers: {
                'User-Agent': config.scraping.userAgent
            }
        };
    }

    async getLatestNews() {
        const allArticles = [];
        
        // First, scrape priority sources for latest news
        logger.info('Scraping priority sources for latest Palestine news...');
        for (const sourceKey of prioritySources) {
            if (newsSources[sourceKey]) {
                try {
                    const source = newsSources[sourceKey];
                    logger.info(`Scraping priority source: ${source.name}...`);
                    
                    const articles = await this.scrapeSource(source);
                    const recentPalestineArticles = this.filterRecentPalestineNews(articles);
                    
                    allArticles.push(...recentPalestineArticles);
                    logger.info(`Found ${recentPalestineArticles.length} recent Palestine articles from ${source.name}`);
                    
                    // Short delay between priority sources
                    await delay(1000);
                    
                } catch (error) {
                    logger.error(`Error scraping priority source ${sourceKey}:`, error.message);
                }
            }
        }

        // Then scrape additional feeds for breaking news
        logger.info('Scraping additional feeds for breaking news...');
        for (const feed of additionalFeeds) {
            try {
                logger.info(`Scraping additional feed: ${feed.name}...`);
                const articles = await this.scrapeAdditionalFeed(feed);
                const palestineArticles = this.filterRecentPalestineNews(articles);
                
                allArticles.push(...palestineArticles);
                logger.info(`Found ${palestineArticles.length} articles from ${feed.name}`);
                
                await delay(1000);
                
            } catch (error) {
                logger.error(`Error scraping additional feed ${feed.name}:`, error.message);
            }
        }
        
        // Finally, scrape remaining sources if we don't have enough articles
        if (allArticles.length < 10) {
            logger.info('Scraping remaining sources for more articles...');
            for (const [sourceKey, source] of Object.entries(newsSources)) {
                if (prioritySources.includes(sourceKey)) continue; // Already scraped
                
                try {
                    logger.info(`Scraping ${source.name}...`);
                    
                    const articles = await this.scrapeSource(source);
                    const palestineArticles = this.filterRecentPalestineNews(articles);
                    
                    allArticles.push(...palestineArticles);
                    logger.info(`Found ${palestineArticles.length} Palestine-related articles from ${source.name}`);
                    
                    // Rate limiting
                    await delay(config.scraping.requestDelay);
                    
                } catch (error) {
                    logger.error(`Error scraping ${source.name}:`, error.message);
                }
            }
        }
        
        // Remove duplicates and sort by date (newest first)
        const uniqueArticles = this.removeDuplicates(allArticles);
        const sortedArticles = uniqueArticles.sort((a, b) => {
            const dateA = new Date(a.publishedDate);
            const dateB = new Date(b.publishedDate);
            return dateB - dateA; // Newest first
        });

        logger.info(`Total unique articles found: ${sortedArticles.length}`);
        return sortedArticles.slice(0, 50); // Return top 50 most recent
    }

    async scrapeAdditionalFeed(feed) {
        try {
            const feedData = await this.rssParser.parseURL(feed.url);
            
            return feedData.items.map(item => ({
                title: sanitizeText(item.title),
                url: item.link,
                content: sanitizeText(item.contentSnippet || item.summary || ''),
                publishedDate: item.pubDate || item.isoDate || new Date().toISOString(),
                source: feed.name,
                sourceCredibility: 0.85, // Default for additional feeds
                isReputable: true,
                feedType: feed.type
            }));
            
        } catch (error) {
            logger.error(`Additional feed scraping failed for ${feed.name}:`, error.message);
            return [];
        }
    }

    async scrapeSource(source) {
        const articles = [];
        
        try {
            // Try RSS first (preferred method for latest news)
            if (source.rssUrl) {
                const rssArticles = await this.scrapeRSS(source);
                articles.push(...rssArticles);
            }
            
            // If RSS doesn't yield enough recent articles, try web scraping
            const recentArticles = articles.filter(article => this.isRecentArticle(article.publishedDate));
            if (recentArticles.length < 3) {
                logger.info(`Only ${recentArticles.length} recent articles from RSS, trying web scraping for ${source.name}`);
                const webArticles = await this.scrapeWebsite(source);
                articles.push(...webArticles);
            }
            
        } catch (error) {
            logger.error(`Error scraping source ${source.name}:`, error.message);
        }
        
        return articles;
    }

    async scrapeRSS(source) {
        try {
            logger.debug(`Fetching RSS from: ${source.rssUrl}`);
            const feed = await this.rssParser.parseURL(source.rssUrl);
            
            const articles = feed.items.map(item => ({
                title: sanitizeText(item.title),
                url: item.link,
                content: sanitizeText(item.contentSnippet || item.summary || item.content || ''),
                publishedDate: item.pubDate || item.isoDate || new Date().toISOString(),
                source: source.name,
                sourceCredibility: source.credibilityScore,
                isReputable: source.isReputable,
                perspective: source.perspective || 'neutral',
                bias: source.bias || 'center'
            }));

            logger.debug(`RSS scraped ${articles.length} articles from ${source.name}`);
            return articles;
            
        } catch (error) {
            logger.error(`RSS scraping failed for ${source.name}:`, error.message);
            return [];
        }
    }

    async scrapeWebsite(source) {
        try {
            logger.debug(`Web scraping: ${source.baseUrl}`);
            const response = await axios.get(source.baseUrl, this.axiosConfig);
            const $ = cheerio.load(response.data);
            const articles = [];
            
            // Look for article links with Palestine-related keywords
            $('a').each((i, elem) => {
                const href = $(elem).attr('href');
                const text = $(elem).text().trim();
                
                if (href && text && text.length > 20 && this.containsPalestineKeywords(text)) {
                    const fullUrl = href.startsWith('http') ? href : `${source.baseUrl}${href}`;
                    
                    if (isValidUrl(fullUrl) && !articles.some(a => a.url === fullUrl)) {
                        articles.push({
                            title: sanitizeText(text),
                            url: fullUrl,
                            content: '',
                            publishedDate: new Date().toISOString(),
                            source: source.name,
                            sourceCredibility: source.credibilityScore,
                            isReputable: source.isReputable,
                            scrapedFrom: 'website'
                        });
                    }
                }
            });
            
            logger.debug(`Web scraped ${articles.length} articles from ${source.name}`);
            return articles.slice(0, 10); // Limit to 10 articles per source
            
        } catch (error) {
            logger.error(`Website scraping failed for ${source.name}:`, error.message);
            return [];
        }
    }

    async scrapeArticleContent(url, source) {
        try {
            const response = await axios.get(url, this.axiosConfig);
            const $ = cheerio.load(response.data);
            
            // Extract content using source-specific selectors
            const title = $(source.selectors.title).first().text().trim();
            const content = $(source.selectors.content).text().trim();
            const date = $(source.selectors.date).first().attr('datetime') || 
                        $(source.selectors.date).first().text().trim();
            const author = $(source.selectors.author).first().text().trim();
            
            return {
                title: sanitizeText(title),
                content: sanitizeText(content),
                publishedDate: date,
                author: sanitizeText(author)
            };
            
        } catch (error) {
            logger.error(`Failed to scrape article content from ${url}:`, error.message);
            return null;
        }
    }

    filterRecentPalestineNews(articles) {
        return articles.filter(article => {
            // Must contain Palestine keywords
            const containsKeywords = this.containsPalestineKeywords(article.title) || 
                                   this.containsPalestineKeywords(article.content);
            
            // Must be recent (within last 72 hours for priority, 7 days for others)
            const isRecent = this.isRecentArticle(article.publishedDate);
            
            // Additional relevance scoring
            const relevanceScore = this.calculateRelevanceScore(article);
            
            return containsKeywords && isRecent && relevanceScore > 0.3;
        });
    }

    calculateRelevanceScore(article) {
        let score = 0;
        const text = `${article.title} ${article.content}`.toLowerCase();
        
        // High priority keywords get more points
        const highPriorityKeywords = [
            'gaza', 'israel', 'palestine', 'hamas', 'hostage', 'ceasefire',
            'humanitarian aid', 'war crimes', 'genocide', 'evacuation',
            'air strike', 'ground invasion', 'al-shifa', 'rafah', 'khan younis'
        ];
        
        const mediumPriorityKeywords = [
            'west bank', 'jerusalem', 'settler', 'idf', 'unrwa',
            'displacement', 'refugee', 'blockade', 'checkpoint'
        ];
        
        // Count keyword matches
        highPriorityKeywords.forEach(keyword => {
            if (text.includes(keyword)) score += 0.3;
        });
        
        mediumPriorityKeywords.forEach(keyword => {
            if (text.includes(keyword)) score += 0.2;
        });
        
        // Recent articles get bonus points
        if (this.isVeryRecentArticle(article.publishedDate)) score += 0.4;
        
        // High credibility sources get bonus
        if (article.sourceCredibility >= 0.9) score += 0.2;
        
        return Math.min(score, 1.0); // Cap at 1.0
    }

    isRecentArticle(publishedDate) {
        if (!publishedDate) return true; // Default to true for articles without dates
        
        const now = new Date();
        const articleDate = new Date(publishedDate);
        const hoursDiff = (now - articleDate) / (1000 * 60 * 60);
        
        return hoursDiff <= 168; // Within last 7 days
    }

    isVeryRecentArticle(publishedDate) {
        if (!publishedDate) return false;
        
        const now = new Date();
        const articleDate = new Date(publishedDate);
        const hoursDiff = (now - articleDate) / (1000 * 60 * 60);
        
        return hoursDiff <= 24; // Within last 24 hours
    }

    containsPalestineKeywords(text) {
        if (!text) return false;
        
        const lowercaseText = text.toLowerCase();
        return palestineKeywords.some(keyword => 
            lowercaseText.includes(keyword.toLowerCase())
        );
    }

    removeDuplicates(articles) {
        const seen = new Set();
        const duplicateMap = new Map();
        
        return articles.filter(article => {
            // Create multiple keys for duplicate detection
            const titleKey = this.normalizeTitle(article.title);
            const urlKey = article.url;
            
            // Check for exact duplicates
            if (seen.has(urlKey) || seen.has(titleKey)) {
                return false;
            }
            
            // Check for similar titles (fuzzy matching)
            for (const [existingTitle, existingArticle] of duplicateMap.entries()) {
                if (this.titlesSimilar(titleKey, existingTitle)) {
                    // Keep the one from more credible source or more recent
                    if (article.sourceCredibility > existingArticle.sourceCredibility ||
                        new Date(article.publishedDate) > new Date(existingArticle.publishedDate)) {
                        // Remove the old one and add the new one
                        seen.delete(existingArticle.url);
                        seen.delete(existingTitle);
                        duplicateMap.delete(existingTitle);
                        break;
                    } else {
                        return false; // Keep the existing one
                    }
                }
            }
            
            seen.add(urlKey);
            seen.add(titleKey);
            duplicateMap.set(titleKey, article);
            return true;
        });
    }

    normalizeTitle(title) {
        return title.toLowerCase()
            .replace(/[^\w\s]/g, '') // Remove punctuation
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();
    }

    titlesSimilar(title1, title2) {
        // Simple similarity check - if 80% of words match
        const words1 = title1.split(' ').filter(w => w.length > 3);
        const words2 = title2.split(' ').filter(w => w.length > 3);
        
        if (words1.length === 0 || words2.length === 0) return false;
        
        const intersection = words1.filter(word => words2.includes(word));
        const similarity = intersection.length / Math.max(words1.length, words2.length);
        
        return similarity > 0.8;
    }
}
