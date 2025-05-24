import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import dotenv from 'dotenv';

import { NewsScraper } from './scrapers/NewsScraper.js';
import { FactChecker } from './fact-checker/FactChecker.js';
import { SocialMediaPostGenerator } from './social-media/SocialMediaPostGenerator.js';
import { logger } from './utils/logger.js';
import { config } from './config/config.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize services
const newsScraper = new NewsScraper();
const factChecker = new FactChecker();
const socialMediaGenerator = new SocialMediaPostGenerator();

// Store for processed articles
let processedArticles = [];
let factCheckResults = [];

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/api/news', async (req, res) => {
    try {
        const articles = await newsScraper.getLatestNews();
        res.json({
            success: true,
            count: articles.length,
            articles: articles
        });
    } catch (error) {
        logger.error('Error fetching news:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch news articles'
        });
    }
});

app.get('/api/fact-check', (req, res) => {
    res.json({
        success: true,
        count: factCheckResults.length,
        results: factCheckResults.slice(-20) // Return last 20 results
    });
});

app.post('/api/analyze', async (req, res) => {
    try {
        const { url, title, content } = req.body;
        
        if (!content && !url) {
            return res.status(400).json({
                success: false,
                error: 'Either content or URL is required'
            });
        }

        const article = { url, title, content };
        const analysis = await factChecker.analyzeArticle(article);
        
        res.json({
            success: true,
            analysis: analysis
        });
    } catch (error) {
        logger.error('Error analyzing article:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze article'
        });
    }
});

// Generate social media post for a specific article
app.post('/api/generate-social-post', async (req, res) => {
    try {
        const { articleId, platform = 'twitter', tone = 'informative' } = req.body;
        
        if (!articleId) {
            return res.status(400).json({
                success: false,
                error: 'Article ID is required'
            });
        }

        // Find the article in fact check results
        const result = factCheckResults.find(r => 
            r.url === articleId || 
            r.articleUrl === articleId ||
            factCheckResults.indexOf(r).toString() === articleId
        );
        
        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'Article not found in fact-check results'
            });
        }

        const article = {
            title: result.articleTitle || result.title,
            source: result.articleSource || result.source,
            url: result.articleUrl || result.url,
            publishedAt: result.publishedAt
        };

        const socialPost = await socialMediaGenerator.generatePost(
            article, 
            result.analysis || result, 
            platform, 
            tone
        );
        
        res.json({
            success: true,
            socialPost: socialPost,
            article: article
        });
    } catch (error) {
        logger.error('Error generating social media post:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate social media post'
        });
    }
});

// Generate social media posts for multiple platforms
app.post('/api/generate-multiple-posts', async (req, res) => {
    try {
        const { 
            articleId, 
            platforms = ['twitter', 'facebook'], 
            tone = 'informative' 
        } = req.body;
        
        if (!articleId) {
            return res.status(400).json({
                success: false,
                error: 'Article ID is required'
            });
        }

        // Find the article in fact check results
        const result = factCheckResults.find(r => 
            r.url === articleId || 
            r.articleUrl === articleId ||
            factCheckResults.indexOf(r).toString() === articleId
        );
        
        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'Article not found in fact-check results'
            });
        }

        const article = {
            title: result.articleTitle || result.title,
            source: result.articleSource || result.source,
            url: result.articleUrl || result.url,
            publishedAt: result.publishedAt
        };

        const socialPosts = await socialMediaGenerator.generateMultiplePosts(
            article, 
            result.analysis || result, 
            platforms, 
            tone
        );
        
        res.json({
            success: true,
            socialPosts: socialPosts,
            article: article,
            platforms: platforms
        });
    } catch (error) {
        logger.error('Error generating multiple social media posts:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate social media posts'
        });
    }
});

// Get latest fact-checked articles suitable for social media posting
app.get('/api/social-ready-articles', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const minCredibility = parseFloat(req.query.minCredibility) || 0.3;
        
        // Filter articles that are suitable for social media posting
        const socialReadyArticles = factCheckResults
            .filter(result => {
                const credibility = result.analysis?.credibilityScore || result.credibilityScore || 0;
                return credibility >= minCredibility;
            })
            .slice(-limit)
            .map((result, index) => ({
                id: factCheckResults.length - limit + index,
                title: result.articleTitle || result.title,
                source: result.articleSource || result.source,
                url: result.articleUrl || result.url,
                credibilityScore: result.analysis?.credibilityScore || result.credibilityScore || 0,
                overallAssessment: result.analysis?.overallAssessment || result.overallAssessment || 'UNVERIFIED',
                processedAt: result.processedAt,
                keyFindings: result.analysis?.keyFindings || [],
                redFlags: result.analysis?.redFlags || []
            }));
        
        res.json({
            success: true,
            count: socialReadyArticles.length,
            articles: socialReadyArticles
        });
    } catch (error) {
        logger.error('Error fetching social-ready articles:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch social-ready articles'
        });
    }
});

// Get summary of latest fact-checked news
app.get('/api/news-summary', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        
        // Get the latest fact-checked articles
        const latestResults = factCheckResults.slice(-limit).reverse();
        
        // Calculate summary statistics
        const totalArticles = factCheckResults.length;
        const verifiedCount = factCheckResults.filter(r => 
            (r.analysis?.overallAssessment || r.overallAssessment) === 'VERIFIED'
        ).length;
        const disputedCount = factCheckResults.filter(r => 
            ['DISPUTED', 'MISLEADING'].includes(r.analysis?.overallAssessment || r.overallAssessment)
        ).length;
        const avgCredibility = factCheckResults.length > 0 ? 
            factCheckResults.reduce((sum, r) => sum + (r.analysis?.credibilityScore || r.credibilityScore || 0), 0) / factCheckResults.length 
            : 0;
        
        // Create summary for each article
        const summaryArticles = latestResults.map((result, index) => {
            const credibility = result.analysis?.credibilityScore || result.credibilityScore || 0;
            const assessment = result.analysis?.overallAssessment || result.overallAssessment || 'UNVERIFIED';
            const keyIssues = result.analysis?.redFlags || [];
            const keyFindings = result.analysis?.keyFindings || [];
            
            return {
                id: factCheckResults.length - index - 1,
                title: result.articleTitle || result.title,
                source: result.articleSource || result.source,
                url: result.articleUrl || result.url,
                credibilityScore: credibility,
                overallAssessment: assessment,
                processedAt: result.processedAt,
                summary: {
                    status: assessment,
                    credibilityLevel: credibility >= 0.7 ? 'HIGH' : credibility >= 0.4 ? 'MEDIUM' : 'LOW',
                    mainConcerns: keyIssues.slice(0, 2), // Top 2 concerns
                    verificationStatus: keyFindings.length > 0 ? 
                        `${keyFindings.filter(f => f.verification === 'VERIFIED').length}/${keyFindings.length} claims verified` 
                        : 'No detailed verification available',
                    riskLevel: assessment === 'MISLEADING' || credibility < 0.3 ? 'HIGH' :
                              assessment === 'DISPUTED' || credibility < 0.5 ? 'MEDIUM' : 'LOW'
                }
            };
        });
        
        res.json({
            success: true,
            summary: {
                totalAnalyzed: totalArticles,
                verifiedArticles: verifiedCount,
                disputedArticles: disputedCount,
                averageCredibility: Math.round(avgCredibility * 100),
                lastUpdated: factCheckResults.length > 0 ? factCheckResults[factCheckResults.length - 1].processedAt : null
            },
            latestArticles: summaryArticles,
            hasMore: factCheckResults.length > limit
        });
    } catch (error) {
        logger.error('Error generating news summary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate news summary'
        });
    }
});

// Background job to collect and analyze news
async function runFactCheckCycle() {
    try {
        logger.info('Starting fact-check cycle for latest Palestine news...');
        
        // Scrape latest news with improved filtering
        const articles = await newsScraper.getLatestNews();
        logger.info(`Scraped ${articles.length} recent Palestine articles`);
        
        if (articles.length === 0) {
            logger.warn('No recent Palestine articles found. Check RSS feeds and sources.');
            return;
        }

        // Process each article (limit to maxArticlesPerCycle)
        const articlesToProcess = articles.slice(0, config.factCheck.maxArticlesPerCycle);
        let processedCount = 0;
        
        for (const article of articlesToProcess) {
            try {
                // Check if already processed
                const alreadyProcessed = processedArticles.some(
                    processed => processed.url === article.url
                );
                
                if (!alreadyProcessed) {
                    logger.info(`Analyzing: "${article.title}" from ${article.source}`);
                    const analysis = await factChecker.analyzeArticle(article);
                    
                    factCheckResults.push({
                        ...article,
                        analysis,
                        processedAt: new Date().toISOString()
                    });
                    
                    processedArticles.push(article);
                    processedCount++;
                    
                    logger.info(`✅ Analyzed (${processedCount}/${articlesToProcess.length}): ${article.title.substring(0, 80)}...`);
                    
                    // Rate limiting - wait between requests
                    await new Promise(resolve => setTimeout(resolve, config.rateLimiting.geminiDelay));
                }
            } catch (error) {
                logger.error(`Error processing article: ${article.title}`, error);
            }
        }
        
        // Keep only recent results
        if (factCheckResults.length > 100) {
            factCheckResults = factCheckResults.slice(-100);
        }
        if (processedArticles.length > 200) {
            processedArticles = processedArticles.slice(-200);
        }
        
        logger.info(`✅ Fact-check cycle completed. Processed ${processedCount} new articles.`);
        logger.info(`📊 Total in database: ${factCheckResults.length} fact-checked articles`);
        
    } catch (error) {
        logger.error('Error in fact-check cycle:', error);
    }
}

// Add manual trigger endpoint
app.post('/api/trigger-fact-check', async (req, res) => {
    try {
        logger.info('Manual fact-check triggered via API');
        
        // Run fact-check cycle immediately
        await runFactCheckCycle();
        
        res.json({
            success: true,
            message: 'Fact-check cycle completed',
            articlesProcessed: factCheckResults.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error in manual fact-check:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to run fact-check cycle'
        });
    }
});

// Schedule fact-checking using config interval
const scheduleInterval = config.factCheck.intervalHours;
cron.schedule(`0 */${scheduleInterval} * * *`, runFactCheckCycle);

// Start server
app.listen(PORT, () => {
    logger.info(`🚀 Palestine News Fact-Checker Agent running on port ${PORT}`);
    logger.info(`⏰ Scheduled fact-checking every ${scheduleInterval} hours`);
    logger.info(`📱 Web interface: http://localhost:${PORT}`);
    logger.info(`🔍 API endpoints: http://localhost:${PORT}/api/news`);
    
    // Run initial fact-check cycle after a short delay
    logger.info('🔄 Starting initial fact-check cycle in 10 seconds...');
    setTimeout(runFactCheckCycle, 10000);
});

export default app;
