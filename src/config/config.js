import dotenv from 'dotenv';

dotenv.config();

export const config = {
    gemini: {
        apiKey: process.env.GEMINI_API_KEY,
        model: 'gemini-2.0-flash'
    },
    
    scraping: {
        userAgent: process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        timeout: 10000,
        maxRetries: 3,
        requestDelay: 1000
    },
    
    rateLimiting: {
        maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 60,
        geminiDelay: 2000 // Delay between Gemini API calls
    },
    
    factCheck: {
        intervalHours: parseInt(process.env.FACT_CHECK_INTERVAL_HOURS) || 2,
        maxArticlesPerCycle: parseInt(process.env.MAX_ARTICLES_PER_CYCLE) || 30,
        credibilityThreshold: parseFloat(process.env.CREDIBILITY_THRESHOLD) || 0.7,
        maxRecentHours: 72,
        prioritySourcesFirst: true
    },

    // Social media configuration
    socialMedia: {
        autoPost: {
            enabled: process.env.AUTO_POST_ENABLED === 'true',
            platforms: (process.env.AUTO_POST_PLATFORMS || 'twitter').split(','),
            minCredibilityScore: parseFloat(process.env.AUTO_POST_MIN_CREDIBILITY) || 0.7,
            maxPostsPerDay: parseInt(process.env.AUTO_POST_MAX_PER_DAY) || 5,
            intervalHours: parseInt(process.env.AUTO_POST_INTERVAL_HOURS) || 2
        }
    }
};
