import axios from 'axios';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';

import { newsSources, palestineKeywords } from '../sources/sources.js';
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
        
        for (const [sourceKey, source] of Object.entries(newsSources)) {
            try {
                logger.info(`Scraping ${source.name}...`);
                
                const articles = await this.scrapeSource(source);
                const palestineArticles = this.filterPalestineNews(articles);
                
                allArticles.push(...palestineArticles);
                logger.info(`Found ${palestineArticles.length} Palestine-related articles from ${source.name}`);
                
                // Rate limiting
                await delay(config.scraping.requestDelay);
                
            } catch (error) {
                logger.error(`Error scraping ${source.name}:`, error.message);
            }
        }
        
        // Remove duplicates and sort by date
        const uniqueArticles = this.removeDuplicates(allArticles);
        return uniqueArticles.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
    }

    async scrapeSource(source) {
        const articles = [];
        
        try {
            // Try RSS first
            if (source.rssUrl) {
                const rssArticles = await this.scrapeRSS(source);
                articles.push(...rssArticles);
            }
            
            // If RSS doesn't yield enough articles, try web scraping
            if (articles.length < 5) {
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
            const feed = await this.rssParser.parseURL(source.rssUrl);
            
            return feed.items.map(item => ({
                title: sanitizeText(item.title),
                url: item.link,
                content: sanitizeText(item.contentSnippet || item.summary || ''),
                publishedDate: item.pubDate || item.isoDate,
                source: source.name,
                sourceCredibility: source.credibilityScore,
                isReputable: source.isReputable
            }));
            
        } catch (error) {
            logger.error(`RSS scraping failed for ${source.name}:`, error.message);
            return [];
        }
    }

    async scrapeWebsite(source) {
        try {
            const response = await axios.get(source.baseUrl, this.axiosConfig);
            const $ = cheerio.load(response.data);
            const articles = [];
            
            // Look for article links
            $('a').each((i, elem) => {
                const href = $(elem).attr('href');
                const text = $(elem).text().trim();
                
                if (href && text && this.containsPalestineKeywords(text)) {
                    const fullUrl = href.startsWith('http') ? href : `${source.baseUrl}${href}`;
                    
                    if (isValidUrl(fullUrl)) {
                        articles.push({
                            title: sanitizeText(text),
                            url: fullUrl,
                            content: '',
                            publishedDate: new Date().toISOString(),
                            source: source.name,
                            sourceCredibility: source.credibilityScore,
                            isReputable: source.isReputable
                        });
                    }
                }
            });
            
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

    filterPalestineNews(articles) {
        return articles.filter(article => 
            this.containsPalestineKeywords(article.title) || 
            this.containsPalestineKeywords(article.content)
        );
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
        return articles.filter(article => {
            const key = `${article.title}-${article.source}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
}
