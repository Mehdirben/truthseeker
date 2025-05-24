#!/usr/bin/env node

import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testing Twitter Write Permissions...\n');

async function testWritePermissions() {
    try {
        const client = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_API_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
        });

        console.log('🔍 Checking authentication...');
        const me = await client.v2.me();
        console.log(`✅ Authenticated as: @${me.data.username}\n`);

        console.log('🐦 Attempting to post test tweet...');
        
        const testTweet = `🧪 Palestine News Fact-Checker Test Tweet
        
✅ Authentication: Working
🔧 OAuth 1.0a: Configured  
📅 Time: ${new Date().toLocaleString()}

#TestTweet #PalestineNews #FactCheck`;

        const tweet = await client.v2.tweet(testTweet);
        
        console.log('🎉 SUCCESS! Tweet posted successfully!');
        console.log(`📎 Tweet ID: ${tweet.data.id}`);
        console.log(`🔗 URL: https://twitter.com/${me.data.username}/status/${tweet.data.id}`);
        
        console.log('\n✅ Write permissions are working correctly!');
        console.log('🚀 Your Palestine News auto-posting system is ready to go!');
        
        return true;
        
    } catch (error) {
        console.log('❌ Write permission test failed:');
        console.log(`   Error Code: ${error.code || 'Unknown'}`);
        console.log(`   Error Message: ${error.message}`);
        
        if (error.code === 401) {
            console.log('\n🔑 DIAGNOSIS: Your app still has READ-ONLY permissions');
            console.log('💡 Make sure you:');
            console.log('   1. Changed permissions to "Read and write"');
            console.log('   2. REGENERATED Access Token & Secret after changing permissions');
            console.log('   3. Updated your .env file with the NEW tokens');
            console.log('   4. Restarted your application');
        } else if (error.code === 403) {
            console.log('\n🔑 DIAGNOSIS: Authentication type issue');
            console.log('💡 Make sure you removed any TWITTER_BEARER_TOKEN from .env');
        } else {
            console.log('\n❓ Unexpected error. Please check your credentials.');
        }
        
        return false;
    }
}

testWritePermissions(); 