import { SocialMediaPostGenerator } from './social-media/SocialMediaPostGenerator.js';
import { config } from './config/config.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testSocialMediaGeneration() {
    console.log('🧪 Testing Social Media Post Generation...\n');
    
    try {
        const generator = new SocialMediaPostGenerator();
        
        // Sample article and analysis data
        const sampleArticle = {
            title: "Breaking: Ceasefire Agreement Reached in Gaza After International Mediation",
            source: "Reuters",
            url: "https://reuters.com/sample-article",
            publishedAt: new Date().toISOString()
        };
        
        const sampleAnalysis = {
            credibilityScore: 0.85,
            overallAssessment: "VERIFIED",
            keyFindings: [
                {
                    claim: "Ceasefire agreement reached through international mediation",
                    verification: "VERIFIED",
                    evidence: "Multiple diplomatic sources confirm the agreement",
                    sources: ["UN", "EU", "Arab League"]
                }
            ],
            redFlags: [],
            sourceAnalysis: {
                reputation: "High - Reuters is a reputable international news agency",
                bias: "Minimal detected bias",
                previousAccuracy: "High historical accuracy"
            }
        };
        
        console.log('📱 Generating Twitter post...');
        const twitterPost = await generator.generatePost(sampleArticle, sampleAnalysis, 'twitter', 'informative');
        console.log('Twitter Post Result:', JSON.stringify(twitterPost, null, 2));
        
        console.log('\n📘 Generating Facebook post...');
        const facebookPost = await generator.generatePost(sampleArticle, sampleAnalysis, 'facebook', 'engaging');
        console.log('Facebook Post Result:', JSON.stringify(facebookPost, null, 2));
        
        console.log('\n🌐 Generating posts for multiple platforms...');
        const multiplePosts = await generator.generateMultiplePosts(
            sampleArticle, 
            sampleAnalysis, 
            ['twitter', 'linkedin'], 
            'professional'
        );
        console.log('Multiple Posts Result:', JSON.stringify(multiplePosts, null, 2));
        
        console.log('\n✅ Social Media Post Generation Test Completed Successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Make sure you have set the GEMINI_API_KEY in your .env file');
    }
}

// Run the test
testSocialMediaGeneration();
