import { NewsScraper } from './scrapers/NewsScraper.js';
import { FactChecker } from './fact-checker/FactChecker.js';
import { logger } from './utils/logger.js';

async function testNewsScraper() {
    console.log('🔍 Testing News Scraper...\n');
    
    try {
        const scraper = new NewsScraper();
        const articles = await scraper.getLatestNews();
        
        console.log(`✅ Successfully scraped ${articles.length} Palestine-related articles`);
        
        if (articles.length > 0) {
            console.log('\n📰 Sample Articles:');
            articles.slice(0, 3).forEach((article, index) => {
                console.log(`\n${index + 1}. ${article.title}`);
                console.log(`   Source: ${article.source}`);
                console.log(`   URL: ${article.url}`);
                console.log(`   Credibility: ${Math.round(article.sourceCredibility * 100)}%`);
            });
        }
        
        return articles;
    } catch (error) {
        console.error('❌ News scraper test failed:', error.message);
        return [];
    }
}

async function testFactChecker(articles) {
    console.log('\n\n🤖 Testing Fact Checker...\n');
    
    if (!process.env.GEMINI_API_KEY) {
        console.log('⚠️  Skipping fact-checker test - GEMINI_API_KEY not provided');
        console.log('Please add your Gemini API key to the .env file to test fact-checking');
        return;
    }
    
    try {
        const factChecker = new FactChecker();
        
        if (articles.length === 0) {
            console.log('⚠️  No articles to fact-check');
            return;
        }
        
        // Test with the first article
        const testArticle = articles[0];
        console.log(`🔍 Analyzing: "${testArticle.title}"`);
        
        const analysis = await factChecker.analyzeArticle(testArticle);
        
        console.log('\n✅ Fact-check analysis completed:');
        console.log(`   Overall Assessment: ${analysis.overallAssessment || 'N/A'}`);
        console.log(`   Credibility Score: ${Math.round((analysis.credibilityScore || 0) * 100)}%`);
        console.log(`   Final Score: ${Math.round((analysis.finalScore || 0) * 100)}%`);
        
        if (analysis.keyFindings && analysis.keyFindings.length > 0) {
            console.log('\n📋 Key Findings:');
            analysis.keyFindings.slice(0, 2).forEach((finding, index) => {
                console.log(`   ${index + 1}. ${finding.claim || 'N/A'} - ${finding.verification || 'Unverified'}`);
            });
        }
        
        if (analysis.redFlags && analysis.redFlags.length > 0) {
            console.log(`\n⚠️  Red Flags: ${analysis.redFlags.join(', ')}`);
        }
        
    } catch (error) {
        console.error('❌ Fact checker test failed:', error.message);
    }
}

async function runTests() {
    console.log('🚀 Palestine News Fact-Checker AI Agent - Test Suite\n');
    console.log('=' .repeat(60));
    
    // Test news scraping
    const articles = await testNewsScraper();
    
    // Test fact checking
    await testFactChecker(articles);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Test suite completed!');
    console.log('\nNext steps:');
    console.log('1. Add your Gemini API key to .env file');
    console.log('2. Run "npm start" to start the full application');
    console.log('3. Open http://localhost:3000 in your browser');
}

// Run tests
runTests().catch(console.error);
