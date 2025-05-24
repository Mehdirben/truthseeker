import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';

export class SocialMediaPostGenerator {
    constructor() {
        if (!config.gemini.apiKey) {
            throw new Error('Gemini API key is required for social media post generation.');
        }
        
        this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: config.gemini.model });
    }

    async generatePost(article, analysis, platform = 'twitter', tone = 'informative') {
        try {
            logger.info(`Generating ${platform} post for: ${article.title}`);
            
            const prompt = this.buildSocialMediaPrompt(article, analysis, platform, tone);
            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            
            return this.parseSocialMediaResponse(response, platform, article, analysis);
            
        } catch (error) {
            logger.error(`Error generating social media post: ${error.message}`);
            return {
                error: 'Post generation failed',
                message: error.message,
                generatedAt: new Date().toISOString()
            };
        }
    }    buildSocialMediaPrompt(article, analysis, platform, tone) {
        const credibilityStatus = this.getCredibilityStatus(analysis);
        const platformSpecs = this.getPlatformSpecifications(platform);
        const fakeNewsWarning = this.buildFakeNewsWarning(analysis);
        
        // Extract social media verification info
        const socialMediaStatus = analysis.socialMediaVerification ? 
            `${analysis.socialMediaVerification.status} - ${analysis.socialMediaVerification.result}` : 
            'Not verified against social media sources';
        
        const groundTruthInfo = analysis.sourceAnalysis?.groundTruthAlignment || 'Not assessed against ground sources';
        const palestinianContext = analysis.sourceAnalysis?.palestinianContext || 'Palestinian perspective not noted';
        
        return `
As a social media expert specializing in news communication and ground-truth verification, create an engaging ${platform} post about this news article and its comprehensive source verification:

**Article Information:**
- Title: ${article.title}
- Source: ${article.source}
- URL: ${article.url}
- Published: ${article.publishedAt || 'Recent'}

**Comprehensive Verification Analysis:**
- Credibility Score: ${analysis.credibilityScore || 0}/1.0
- Overall Assessment: ${analysis.overallAssessment || 'UNVERIFIED'}
- Social Media Verification: ${socialMediaStatus}
- Ground Truth Alignment: ${groundTruthInfo}
- Palestinian Context: ${palestinianContext}
- Key Issues: ${analysis.redFlags?.join(', ') || 'None identified'}
- Sources Verified: ${analysis.trustedSources?.join(', ') || 'Traditional sources only'}

**Platform Specifications:**
${platformSpecs}

**Tone:** ${tone}

${fakeNewsWarning ? `
**IMPORTANT - VERIFICATION ALERT:**
Warning Level: ${fakeNewsWarning.level.toUpperCase()}
Message: ${fakeNewsWarning.message}
Required Hashtags: ${fakeNewsWarning.hashtags.join(', ')}
` : ''}

Please generate a social media post in JSON format:

{
    "post": "<main post content emphasizing ground-truth verification>",
    "hashtags": ["<relevant hashtag 1>", "<relevant hashtag 2>", "..."],
    "characterCount": <number of characters>,
    "engagement": {
        "callToAction": "<encourage verification through multiple source types>",
        "questionPrompt": "<optional question about source verification>"
    },
    "warnings": {
        "includeFactCheckWarning": <true/false>,
        "warningText": "<warning text if contradicts social media/citizen reports>",
        "warningLevel": "<high/medium/low if applicable>"
    },
    "alternativeVersions": [
        {
            "style": "brief",
            "content": "<shorter version mentioning source verification>"
        },
        {
            "style": "detailed", 
            "content": "<detailed version including social media verification>"
        }
    ],
    "visualSuggestions": [
        "<suggestion for social media verification infographic>",
        "<suggestion for source comparison visual>"
    ],
    "responsibleSharing": {
        "tips": [
            "Check social media for eyewitness accounts",
            "Look for Palestinian sources and perspectives", 
            "Cross-reference with citizen journalism",
            "Verify with regional sources like HesPress"
        ],
        "verificationSources": ["Social media accounts", "Palestinian outlets", "Regional sources", "Citizen reports"]
    }
}

**Enhanced Guidelines:**
1. Emphasize the importance of social media and citizen journalism verification
2. Highlight when institutional sources contradict ground-truth evidence
3. Mention Palestinian perspectives and regional sources like HesPress
4. Include warnings when social media evidence contradicts the article
5. Encourage users to check multiple source types, not just traditional media
6. Prioritize ground-truth verification over institutional narratives
7. Use hashtags that promote citizen journalism and social media verification
8. Call attention to missing Palestinian context in institutional reporting
9. Encourage followers to seek eyewitness accounts and local perspectives
10. Balance engagement with media literacy about source verification types
11. Highlight the value of real-time social media reporting vs delayed institutional media
12. Promote critical thinking about institutional bias vs ground truth

Make the post informative about comprehensive source verification, encouraging followers to seek truth from multiple source types including social media and citizen journalism.`;
    }

    getPlatformSpecifications(platform) {
        const specs = {
            twitter: `
- Character limit: 280 characters
- Use 2-3 relevant hashtags
- Include thread potential for longer content
- Emojis for engagement
- @ mentions when appropriate`,
            
            facebook: `
- More flexible length (up to 500 words ideal for engagement)
- Use 3-5 hashtags
- Encourage discussion in comments
- Can include longer explanatory text
- Link preview will show`,
            
            instagram: `
- Focus on visual storytelling
- Caption up to 2,200 characters
- Use 10-15 hashtags for discoverability
- Stories format consideration
- Engaging visual elements crucial`,
            
            linkedin: `
- Professional tone
- 1,300 character ideal length
- Industry-relevant hashtags
- Encourage professional discussion
- Focus on credibility and analysis`,
            
            general: `
- Adaptable to multiple platforms
- Focus on core message
- Include essential information
- Professional and engaging tone`
        };
        
        return specs[platform] || specs.general;
    }

    getCredibilityStatus(analysis) {
        const score = analysis.credibilityScore || 0;
        const assessment = analysis.overallAssessment || 'UNVERIFIED';
        
        if (score >= 0.8 && assessment === 'VERIFIED') {
            return '✅ VERIFIED - High credibility';
        } else if (score >= 0.6 && (assessment === 'VERIFIED' || assessment === 'PARTIALLY_VERIFIED')) {
            return '⚠️ PARTIALLY VERIFIED - Moderate credibility';
        } else if (assessment === 'DISPUTED' || assessment === 'MISLEADING') {
            return '❌ DISPUTED - Contains misinformation';
        } else {
            return '⚪ UNVERIFIED - Requires additional verification';
        }
    }

    buildFakeNewsWarning(analysis) {
        const score = analysis.credibilityScore || 0;
        const assessment = analysis.overallAssessment || 'UNVERIFIED';
        
        if (assessment === 'MISLEADING' || score < 0.3) {
            return {
                level: 'high',
                message: '🚨 WARNING: This content has been flagged as potentially misleading or false. Please verify with multiple reputable sources before sharing.',
                hashtags: ['#FactCheck', '#MisinformationAlert', '#VerifyBeforeSharing']
            };
        } else if (assessment === 'DISPUTED' || score < 0.5) {
            return {
                level: 'medium',
                message: '⚠️ CAUTION: This content contains disputed information. Cross-reference with trusted sources.',
                hashtags: ['#FactCheck', '#VerifyInfo', '#MediaLiteracy']
            };
        } else if (assessment === 'UNVERIFIED' || score < 0.7) {
            return {
                level: 'low',
                message: '📋 NOTE: This information requires verification. Always check multiple sources.',
                hashtags: ['#FactCheck', '#VerifyNews']
            };
        }
        
        return null;
    }

    parseSocialMediaResponse(response, platform, article, analysis) {
        try {
            // Extract JSON from the response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }
            
            const post = JSON.parse(jsonMatch[0]);
            
            // Validate and enhance the post
            return {
                ...post,
                platform: platform,
                articleTitle: article.title,
                articleUrl: article.url,
                credibilityScore: analysis.credibilityScore || 0,
                overallAssessment: analysis.overallAssessment || 'UNVERIFIED',
                generatedAt: new Date().toISOString(),
                
                // Ensure required fields exist
                post: post.post || this.generateFallbackPost(article, analysis, platform),
                hashtags: post.hashtags || ['#FactCheck', '#News'],
                characterCount: post.characterCount || post.post?.length || 0,
                engagement: post.engagement || {},
                warnings: post.warnings || {},
                alternativeVersions: post.alternativeVersions || [],
                visualSuggestions: post.visualSuggestions || []
            };
            
        } catch (error) {
            logger.error('Error parsing social media post response:', error.message);
            
            // Return a basic post if parsing fails
            return {
                post: this.generateFallbackPost(article, analysis, platform),
                hashtags: ['#FactCheck', '#News'],
                platform: platform,
                error: 'Failed to parse AI-generated post',
                articleTitle: article.title,
                articleUrl: article.url,
                generatedAt: new Date().toISOString()
            };
        }
    }

    generateFallbackPost(article, analysis, platform) {
        const credibilityEmoji = analysis.credibilityScore >= 0.7 ? '✅' : 
                               analysis.credibilityScore >= 0.5 ? '⚠️' : '❌';
        const maxLength = platform === 'twitter' ? 240 : 300;
        
        let post = `${credibilityEmoji} FACT-CHECK: "${article.title}" `;
        post += `Credibility: ${Math.round((analysis.credibilityScore || 0) * 100)}% `;
        post += `Read full analysis: ${article.url}`;
        
        if (post.length > maxLength) {
            post = post.substring(0, maxLength - 3) + '...';
        }
        
        return post;
    }

    async generateMultiplePosts(article, analysis, platforms = ['twitter', 'facebook'], tone = 'informative') {
        const posts = {};
        
        for (const platform of platforms) {
            try {
                posts[platform] = await this.generatePost(article, analysis, platform, tone);
                // Add delay between requests to respect rate limits
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                logger.error(`Error generating ${platform} post:`, error);
                posts[platform] = { error: error.message };
            }
        }
        
        return posts;
    }
}
