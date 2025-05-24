import fetch from 'node-fetch';

// Simple test for Twitter API endpoints
async function testTwitterAPI() {
    try {
        console.log('Testing Twitter API status endpoint...');
        
        const response = await fetch('http://localhost:3000/api/twitter/status');
        const text = await response.text();
        
        console.log('Response status:', response.status);
        console.log('Response text:', text.substring(0, 200));
        
        if (response.status === 200) {
            const data = JSON.parse(text);
            console.log('Parsed data:', JSON.stringify(data, null, 2));
            
            if (data.success) {
                console.log('✅ Twitter API endpoint is working!');
                console.log(`🔧 Configured: ${data.configured}`);
                console.log(`📝 Queue Length: ${data.queueLength || 0}`);
                console.log(`📊 Daily Posts: ${data.dailyPostCount || 0}/${data.maxPostsPerDay || 5}`);
            } else {
                console.log('❌ Twitter API endpoint returned error');
            }
        } else {
            console.log('❌ HTTP Error:', response.status);
        }
        
    } catch (error) {
        console.error('❌ Error testing Twitter API:', error.message);
    }
}

testTwitterAPI(); 