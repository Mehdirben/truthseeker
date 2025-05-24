import { TwitterApi } from 'twitter-api-v2';
import schedule from 'node-schedule';
import { logger } from '../utils/logger.js';
import { config } from '../config/config.js';

export class TwitterAutoPoster {
    constructor() {
        this.twitterClient = null;
        this.postQueue = [];
        this.dailyPostCount = 0;
        this.lastPostDate = new Date().toDateString();
        this.maxPostsPerDay = parseInt(process.env.AUTO_POST_MAX_PER_DAY) || 5;
        this.minCredibilityScore = parseFloat(process.env.AUTO_POST_MIN_CREDIBILITY) || 0.7;
        
        this.initializeTwitterClient();
        this.setupScheduler();
    }

    initializeTwitterClient() {
        try {
            // Try OAuth 2.0 first (easier setup)
            const bearerToken = process.env.TWITTER_BEARER_TOKEN;
            const clientId = process.env.TWITTER_CLIENT_ID;
            const clientSecret = process.env.TWITTER_CLIENT_SECRET;
            
            // Method 1: OAuth 2.0 Bearer Token (for app-only auth - read only)
            if (bearerToken) {
                logger.info('🔧 Trying Twitter OAuth 2.0 Bearer Token...');
                this.twitterClient = new TwitterApi(bearerToken);
                logger.info('✅ Twitter OAuth 2.0 Bearer Token initialized (read-only)');
                return;
            }
            
            // Method 2: OAuth 2.0 Client Credentials (for user context - read/write)
            if (clientId && clientSecret) {
                logger.info('🔧 Trying Twitter OAuth 2.0 Client Credentials...');
                this.twitterClient = new TwitterApi({
                    clientId: clientId,
                    clientSecret: clientSecret,
                });
                logger.info('✅ Twitter OAuth 2.0 Client Credentials initialized');
                return;
            }
            
            // Method 3: OAuth 1.0a (traditional method)
            const apiKey = process.env.TWITTER_API_KEY;
            const apiSecret = process.env.TWITTER_API_SECRET;
            const accessToken = process.env.TWITTER_ACCESS_TOKEN;
            const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

            if (apiKey && apiSecret && accessToken && accessTokenSecret) {
                logger.info('🔧 Trying Twitter OAuth 1.0a...');
                this.twitterClient = new TwitterApi({
                    appKey: apiKey,
                    appSecret: apiSecret,
                    accessToken: accessToken,
                    accessSecret: accessTokenSecret,
                });
                logger.info('✅ Twitter OAuth 1.0a initialized');
                return;
            }

            logger.warn('❌ No Twitter API credentials configured. Auto-posting disabled.');
            logger.info('💡 Add one of these to your .env file:');
            logger.info('   Option 1 (OAuth 2.0): TWITTER_BEARER_TOKEN');
            logger.info('   Option 2 (OAuth 2.0): TWITTER_CLIENT_ID + TWITTER_CLIENT_SECRET');
            logger.info('   Option 3 (OAuth 1.0a): TWITTER_API_KEY + TWITTER_API_SECRET + TWITTER_ACCESS_TOKEN + TWITTER_ACCESS_TOKEN_SECRET');

        } catch (error) {
            logger.error('Failed to initialize Twitter API client:', error);
        }
    }

    setupScheduler() {
        // Post every 4 hours during active hours (8 AM to 8 PM)
        const postingHours = [8, 12, 16, 20];
        
        postingHours.forEach(hour => {
            schedule.scheduleJob(`0 ${hour} * * *`, () => {
                this.processPostQueue();
            });
        });

        logger.info('📅 Twitter auto-posting scheduler initialized');
    }

    async addToQueue(article, analysis) {
        try {
            // Check credibility threshold
            const credibilityScore = analysis.credibilityScore || 0;
            if (credibilityScore < this.minCredibilityScore) {
                logger.debug(`Skipping article with low credibility: ${credibilityScore}`);
                return false;
            }

            // Check if article already queued
            const existsInQueue = this.postQueue.some(item => item.article.url === article.url);
            if (existsInQueue) {
                logger.debug(`Article already in queue: ${article.title}`);
                return false;
            }

            // Generate tweet content
            const tweetContent = await this.generateTweetContent(article, analysis);
            
            const queueItem = {
                article,
                analysis,
                tweetContent,
                priority: this.calculatePriority(article, analysis),
                addedAt: new Date().toISOString()
            };

            this.postQueue.push(queueItem);
            
            // Sort by priority (higher priority first)
            this.postQueue.sort((a, b) => b.priority - a.priority);
            
            // Keep only top 20 items in queue
            if (this.postQueue.length > 20) {
                this.postQueue = this.postQueue.slice(0, 20);
            }

            logger.info(`📤 Added to Twitter queue: "${article.title}" (Priority: ${queueItem.priority})`);
            return true;

        } catch (error) {
            logger.error('Error adding article to Twitter queue:', error);
            return false;
        }
    }

    calculatePriority(article, analysis) {
        let priority = 0;

        // Base credibility score
        priority += (analysis.credibilityScore || 0) * 50;

        // High priority keywords
        const highPriorityKeywords = [
            'gaza', 'hostage', 'ceasefire', 'airstrike', 'civilians',
            'humanitarian', 'urgent', 'breaking', 'killed', 'wounded'
        ];

        const title = article.title.toLowerCase();
        highPriorityKeywords.forEach(keyword => {
            if (title.includes(keyword)) priority += 10;
        });

        // Recent articles get higher priority
        const articleDate = new Date(article.publishedDate);
        const hoursOld = (new Date() - articleDate) / (1000 * 60 * 60);
        if (hoursOld < 6) priority += 20;
        else if (hoursOld < 24) priority += 10;

        // Verified articles get bonus
        if (analysis.overallAssessment === 'VERIFIED') priority += 15;

        return Math.round(priority);
    }

    async generateTweetContent(article, analysis) {
        try {
            const credibilityScore = Math.round((analysis.credibilityScore || 0) * 100);
            const assessment = analysis.overallAssessment || 'UNVERIFIED';
            
            let tweet = '';
            let warningEmoji = '';
            let warningText = '';

            // Add warning based on credibility
            if (assessment === 'MISLEADING' || credibilityScore < 30) {
                warningEmoji = '🚨';
                warningText = 'VERIFY: ';
            } else if (assessment === 'DISPUTED' || credibilityScore < 50) {
                warningEmoji = '⚠️';
                warningText = 'CAUTION: ';
            } else if (credibilityScore >= 80) {
                warningEmoji = '✅';
                warningText = 'VERIFIED: ';
            } else {
                warningEmoji = '📋';
                warningText = '';
            }

            // Truncate title if too long
            let title = article.title;
            const maxTitleLength = 200 - warningText.length - 50; // Leave space for metadata
            if (title.length > maxTitleLength) {
                title = title.substring(0, maxTitleLength) + '...';
            }

            // Build tweet
            tweet = `${warningEmoji} ${warningText}${title}\n\n`;
            
            // Add credibility info
            tweet += `🔍 Credibility: ${credibilityScore}% (${assessment})\n`;
            
            // Add source
            tweet += `📰 Source: ${article.source}\n\n`;

            // Add relevant hashtags
            const hashtags = this.generateHashtags(article, analysis);
            tweet += hashtags.join(' ');

            // Add URL (Twitter auto-shortens)
            tweet += `\n\n🔗 ${article.url}`;

            // Ensure tweet is under 280 characters
            if (tweet.length > 280) {
                // Remove some hashtags if needed
                const basicTweet = `${warningEmoji} ${warningText}${title}\n\n🔍 ${credibilityScore}%\n📰 ${article.source}\n\n🔗 ${article.url}`;
                if (basicTweet.length <= 280) {
                    tweet = basicTweet;
                } else {
                    // Further truncate title
                    const availableLength = 280 - (tweet.length - title.length);
                    title = title.substring(0, availableLength - 3) + '...';
                    tweet = `${warningEmoji} ${warningText}${title}\n\n🔍 ${credibilityScore}%\n🔗 ${article.url}`;
                }
            }

            return tweet;

        } catch (error) {
            logger.error('Error generating tweet content:', error);
            return `📰 ${article.title}\n🔗 ${article.url}`;
        }
    }

    generateHashtags(article, analysis) {
        const hashtags = [];
        const title = article.title.toLowerCase();

        // Core Palestine/Gaza hashtags
        if (title.includes('gaza')) hashtags.push('#Gaza');
        if (title.includes('palestine')) hashtags.push('#Palestine');
        if (title.includes('israel')) hashtags.push('#Israel');

        // Situation-specific hashtags
        if (title.includes('ceasefire')) hashtags.push('#Ceasefire');
        if (title.includes('hostage')) hashtags.push('#Hostages');
        if (title.includes('aid') || title.includes('humanitarian')) hashtags.push('#HumanitarianAid');
        if (title.includes('hospital') || title.includes('medical')) hashtags.push('#HealthCare');

        // Always include fact-checking hashtags
        hashtags.push('#FactCheck');
        
        if (analysis.overallAssessment === 'VERIFIED') {
            hashtags.push('#Verified');
        } else if (analysis.credibilityScore < 0.5) {
            hashtags.push('#VerifyBeforeSharing');
        }

        // Limit to 4 hashtags to save space
        return hashtags.slice(0, 4);
    }

    async processPostQueue() {
        if (!this.twitterClient) {
            logger.warn('Twitter client not initialized. Skipping post queue processing.');
            return;
        }

        // Reset daily count if new day
        const today = new Date().toDateString();
        if (today !== this.lastPostDate) {
            this.dailyPostCount = 0;
            this.lastPostDate = today;
        }

        // Check daily limit
        if (this.dailyPostCount >= this.maxPostsPerDay) {
            logger.info(`Daily Twitter post limit reached (${this.maxPostsPerDay}). Skipping.`);
            return;
        }

        if (this.postQueue.length === 0) {
            logger.info('No articles in Twitter post queue.');
            return;
        }

        try {
            // Get highest priority article
            const queueItem = this.postQueue.shift();
            
            logger.info(`📤 Posting to Twitter: "${queueItem.article.title}"`);
            
            // Post tweet
            const result = await this.twitterClient.v2.tweet(queueItem.tweetContent);
            
            this.dailyPostCount++;
            
            logger.info(`✅ Successfully posted to Twitter! Tweet ID: ${result.data.id}`);
            logger.info(`📊 Daily posts: ${this.dailyPostCount}/${this.maxPostsPerDay}`);

            return {
                success: true,
                tweetId: result.data.id,
                content: queueItem.tweetContent
            };

        } catch (error) {
            logger.error('Error posting to Twitter:', error);
            
            // If rate limited, wait and try again later
            if (error.code === 429) {
                logger.warn('Twitter rate limit reached. Will retry later.');
            } else if (error.code === 403) {
                logger.error('🚨 Twitter API 403 Error - Check your app permissions!');
                logger.error('💡 Make sure your app has "Read and write" permissions');
            }
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    async postImmediate(article, analysis) {
        if (!this.twitterClient) {
            throw new Error('Twitter client not initialized');
        }

        const tweetContent = await this.generateTweetContent(article, analysis);
        
        try {
            const result = await this.twitterClient.v2.tweet(tweetContent);
            
            logger.info(`✅ Immediate tweet posted! ID: ${result.data.id}`);
            
            return {
                success: true,
                tweetId: result.data.id,
                content: tweetContent
            };
            
        } catch (error) {
            logger.error('Error posting immediate tweet:', error);
            throw error;
        }
    }

    getQueueStatus() {
        return {
            queueLength: this.postQueue.length,
            dailyPostCount: this.dailyPostCount,
            maxPostsPerDay: this.maxPostsPerDay,
            remainingToday: this.maxPostsPerDay - this.dailyPostCount,
            nextScheduledPost: this.getNextScheduledTime()
        };
    }

    getNextScheduledTime() {
        const now = new Date();
        const postingHours = [8, 12, 16, 20];
        
        for (const hour of postingHours) {
            const nextPost = new Date();
            nextPost.setHours(hour, 0, 0, 0);
            
            if (nextPost > now) {
                return nextPost.toISOString();
            }
        }
        
        // Next day's first post
        const nextPost = new Date();
        nextPost.setDate(nextPost.getDate() + 1);
        nextPost.setHours(8, 0, 0, 0);
        return nextPost.toISOString();
    }

    // Manual controls
    async clearQueue() {
        this.postQueue = [];
        logger.info('🗑️ Twitter post queue cleared');
    }

    async pausePosting() {
        // Cancel all scheduled jobs
        schedule.gracefulShutdown();
        logger.info('⏸️ Twitter auto-posting paused');
    }

    isConfigured() {
        return this.twitterClient !== null;
    }
} 