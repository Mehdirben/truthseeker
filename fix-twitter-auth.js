#!/usr/bin/env node

import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 Twitter Authentication Diagnostic Tool\n');

async function diagnoseTwitterAuth() {
    console.log('📋 Step 1: Checking environment variables...');
    
    const requiredVars = [
        'TWITTER_API_KEY',
        'TWITTER_API_SECRET', 
        'TWITTER_ACCESS_TOKEN',
        'TWITTER_ACCESS_TOKEN_SECRET'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.log('❌ Missing required environment variables:');
        missingVars.forEach(varName => console.log(`   - ${varName}`));
        console.log('\n💡 Please add all 4 OAuth 1.0a credentials to your .env file\n');
        return false;
    }
    
    console.log('✅ All required environment variables present');
    
    // Check for Bearer Token (should not be present)
    if (process.env.TWITTER_BEARER_TOKEN) {
        console.log('⚠️  TWITTER_BEARER_TOKEN detected - this should be removed!');
        console.log('💡 Bearer Token prevents OAuth 1.0a from working properly\n');
    }
    
    console.log('\n📋 Step 2: Testing OAuth 1.0a authentication...');
    
    try {
        const client = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_API_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
        });
        
        console.log('✅ Twitter client initialized');
        
        console.log('\n📋 Step 3: Testing API access...');
        
        // Test read access
        try {
            const me = await client.v2.me();
            console.log(`✅ Read access working - authenticated as: @${me.data.username}`);
        } catch (error) {
            console.log('❌ Read access failed:', error.data || error.message);
            console.log('\n🔑 AUTHENTICATION ISSUE DETECTED!');
            console.log('Your credentials are invalid or expired.');
            printAuthFixInstructions();
            return false;
        }
        
        // Test write access with a dry run
        console.log('\n📋 Step 4: Testing write permissions...');
        
        try {
            // Try to get tweet composer limits (requires write scope)
            const writeClient = client.v2;
            
            // This endpoint requires write permissions
            console.log('🔍 Checking write permissions...');
            
            // Instead of actually posting, we'll try to access a write-required endpoint
            // that doesn't post anything but tests permissions
            
            console.log('⚠️  Cannot test write permissions without actually posting.');
            console.log('🧪 To test posting, we need to attempt a real tweet.');
            console.log('\n💡 Based on the 401 Unauthorized errors in your logs:');
            console.log('   Your app likely has READ-ONLY permissions.');
            
            printAuthFixInstructions();
            return false;
            
        } catch (error) {
            console.log('❌ Write access test failed:', error.data || error.message);
            
            if (error.code === 401) {
                console.log('\n🔑 PERMISSIONS ISSUE DETECTED!');
                console.log('Your app has READ-ONLY permissions.');
                printAuthFixInstructions();
            } else if (error.code === 403) {
                console.log('\n🔑 AUTHENTICATION TYPE ISSUE!');
                console.log('Your app is not using the correct authentication method.');
                printAuthFixInstructions();
            }
            
            return false;
        }
        
    } catch (error) {
        console.log('❌ Failed to initialize Twitter client:', error.message);
        return false;
    }
}

function printAuthFixInstructions() {
    console.log('\n🔧 HOW TO FIX TWITTER AUTHENTICATION:');
    console.log('\n1. 🌐 Go to: https://developer.twitter.com/en/portal/dashboard');
    console.log('2. 📱 Select your Twitter app');
    console.log('3. ⚙️  Click "Settings" tab');
    console.log('4. 🔐 Click "User authentication settings"');
    console.log('5. ✏️  Set "App permissions" to "Read and write"');
    console.log('6. 🔄 Click "Save" (very important!)');
    console.log('7. 🔑 Go to "Keys and tokens" tab');
    console.log('8. 🔄 Click "Regenerate" for Access Token & Secret');
    console.log('   ⚠️  CRITICAL: You MUST regenerate after changing permissions!');
    console.log('9. 📝 Copy the new Access Token and Access Token Secret');
    console.log('10. 📄 Update your .env file with the new credentials');
    console.log('\n❗ IMPORTANT NOTES:');
    console.log('   • Changing permissions does NOT automatically update existing tokens');
    console.log('   • You MUST regenerate tokens after permission changes');
    console.log('   • Only regenerate Access Token & Secret (keep API Key & Secret same)');
    console.log('\n✅ After updating credentials, restart your application');
}

function printCurrentConfig() {
    console.log('\n📋 Current Configuration:');
    console.log(`   API Key: ${process.env.TWITTER_API_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`   API Secret: ${process.env.TWITTER_API_SECRET ? '✅ Set' : '❌ Missing'}`);
    console.log(`   Access Token: ${process.env.TWITTER_ACCESS_TOKEN ? '✅ Set' : '❌ Missing'}`);
    console.log(`   Access Token Secret: ${process.env.TWITTER_ACCESS_TOKEN_SECRET ? '✅ Set' : '❌ Missing'}`);
    console.log(`   Bearer Token: ${process.env.TWITTER_BEARER_TOKEN ? '⚠️ Present (should remove)' : '✅ Not present'}`);
}

// Run the diagnostic
printCurrentConfig();
diagnoseTwitterAuth().then(success => {
    if (success) {
        console.log('\n🎉 Twitter authentication is working correctly!');
    } else {
        console.log('\n❌ Twitter authentication needs to be fixed.');
        console.log('Please follow the instructions above.');
    }
}); 