import fetch from 'node-fetch';

async function testImmediatePost() {
    try {
        console.log('🔍 Getting fact-check results...');
        
        // First, get the fact-check results
        const factCheckResponse = await fetch('http://localhost:3000/api/fact-check');
        const factCheckData = await factCheckResponse.json();
        
        if (!factCheckData.success || factCheckData.results.length === 0) {
            console.log('❌ No fact-checked articles available');
            return;
        }
        
        console.log(`📊 Found ${factCheckData.results.length} fact-checked articles`);
        
        // Find a high-credibility article
        const goodArticle = factCheckData.results.find(article => {
            const credibility = article.analysis?.credibilityScore || 0;
            return credibility >= 0.7;
        });
        
        if (!goodArticle) {
            console.log('❌ No high-credibility articles found for posting');
            return;
        }
        
        console.log(`✅ Found article to post: "${goodArticle.title}"`);
        console.log(`🔍 Credibility: ${Math.round((goodArticle.analysis?.credibilityScore || 0) * 100)}%`);
        
        // Try to post immediately
        console.log('🐦 Attempting immediate Twitter post...');
        
        const postResponse = await fetch('http://localhost:3000/api/twitter/post-immediate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                articleId: goodArticle.url
            })
        });
        
        const postResult = await postResponse.json();
        
        if (postResult.success) {
            console.log('🎉 SUCCESS! Tweet posted successfully!');
            console.log(`📱 Tweet ID: ${postResult.tweetId}`);
            console.log(`📝 Content: ${postResult.content}`);
        } else {
            console.log('❌ Failed to post tweet:', postResult.error);
        }
        
    } catch (error) {
        console.error('❌ Error in immediate post test:', error.message);
    }
}

testImmediatePost(); 