#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔧 Setting up environment configuration for Twitter OAuth 1.0a...\n');

const envContent = `# Gemini AI API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Twitter API Configuration (OAuth 1.0a - Required for posting)
# Get these from https://developer.twitter.com/en/portal/dashboard
# IMPORTANT: Make sure your app has "Read and write" permissions!
TWITTER_API_KEY=your_twitter_api_key_here
TWITTER_API_SECRET=your_twitter_api_secret_here
TWITTER_ACCESS_TOKEN=your_twitter_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret_here

# DO NOT USE Bearer Token - it's read-only and cannot post tweets
# TWITTER_BEARER_TOKEN=your_bearer_token_here

# Auto-posting Configuration
AUTO_POST_ENABLED=true
AUTO_POST_PLATFORMS=twitter
AUTO_POST_MIN_CREDIBILITY=0.7
AUTO_POST_MAX_PER_DAY=5
AUTO_POST_INTERVAL_HOURS=2

# Fact-checking Configuration
FACT_CHECK_INTERVAL_HOURS=2
MAX_ARTICLES_PER_CYCLE=30
CREDIBILITY_THRESHOLD=0.7

# Rate Limiting
MAX_REQUESTS_PER_MINUTE=60

# Optional: User Agent for web scraping
USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36
`;

try {
    // Check if .env already exists
    if (fs.existsSync('.env')) {
        console.log('⚠️  .env file already exists!');
        console.log('💡 Creating .env.new with the correct OAuth 1.0a configuration...\n');
        fs.writeFileSync('.env.new', envContent);
        console.log('✅ Created .env.new file');
        console.log('📝 Please review and rename .env.new to .env after adding your credentials\n');
    } else {
        fs.writeFileSync('.env', envContent);
        console.log('✅ Created .env file\n');
    }

    console.log('🔑 TO FIX THE AUTHENTICATION ERROR:');
    console.log('');
    console.log('1. Go to https://developer.twitter.com/en/portal/dashboard');
    console.log('2. Select your app');
    console.log('3. Go to "Settings" → "User authentication settings"');
    console.log('4. Set "App permissions" to "Read and write"');
    console.log('5. REGENERATE your Access Token and Access Token Secret');
    console.log('6. Add all 4 OAuth 1.0a credentials to your .env file:');
    console.log('   - TWITTER_API_KEY (Consumer Key)');
    console.log('   - TWITTER_API_SECRET (Consumer Secret)');
    console.log('   - TWITTER_ACCESS_TOKEN');
    console.log('   - TWITTER_ACCESS_TOKEN_SECRET');
    console.log('');
    console.log('7. Remove or comment out any TWITTER_BEARER_TOKEN');
    console.log('');
    console.log('💡 The Bearer Token is read-only and cannot post tweets!');
    console.log('✅ OAuth 1.0a with write permissions is required for posting.');

} catch (error) {
    console.error('❌ Error creating .env file:', error.message);
    console.log('\n📝 Please manually create a .env file with the following content:');
    console.log('\n' + envContent);
} 