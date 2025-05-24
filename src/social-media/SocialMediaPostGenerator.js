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
        
        return `
As a social media expert specializing in news communication and misinformation prevention, create an engaging ${platform} post about this news article and its fact-check analysis:

**Article Information:**
- Title: ${article.title}
- Source: ${article.source}
- URL: ${article.url}
- Published: ${article.publishedAt || 'Recent'}

**Fact-Check Analysis:**
- Credibility Score: ${analysis.credibilityScore || 0}/1.0
- Overall Assessment: ${analysis.overallAssessment || 'UNVERIFIED'}
- Key Issues: ${analysis.redFlags?.join(', ') || 'None identified'}
- Verification Status: ${credibilityStatus}

**Platform Specifications:**
${platformSpecs}

**Tone:** ${tone}

${fakeNewsWarning ? `
**IMPORTANT - MISINFORMATION ALERT:**
Warning Level: ${fakeNewsWarning.level.toUpperCase()}
Message: ${fakeNewsWarning.message}
Required Hashtags: ${fakeNewsWarning.hashtags.join(', ')}
` : ''}

Please generate a social media post in JSON format:

{
    "post": "<main post content>",
    "hashtags": ["<relevant hashtag 1>", "<relevant hashtag 2>", "..."],
    "characterCount": <number of characters>,
    "engagement": {
        "callToAction": "<encourage specific user action>",
        "questionPrompt": "<optional question to drive engagement>"
    },
    "warnings": {
        "includeFactCheckWarning": <true/false>,
        "warningText": "<warning text if credibility is low>",
        "warningLevel": "<high/medium/low if applicable>"
    },
    "alternativeVersions": [
        {
            "style": "brief",
            "content": "<shorter version>"
        },
        {
            "style": "detailed",
            "content": "<more detailed version>"
        }
    ],
    "visualSuggestions": [
        "<suggestion 1 for accompanying visual content>",
        "<suggestion 2 for infographic elements>"
    ],
    "responsibleSharing": {
        "tips": ["<tip 1 for responsible sharing>", "<tip 2>"],
        "verificationSources": ["<suggested verification source 1>", "<source 2>"]
    }
}

**Guidelines:**
1. Be factual and responsible in reporting
2. Include appropriate warnings for disputed or unverified content
3. Use engaging but professional language
4. Include relevant hashtags for discoverability
5. Encourage critical thinking and fact-checking
6. Respect character limits for the platform
7. Include call-to-action to read full analysis
8. Balance engagement with journalistic integrity
9. Use emojis appropriately for the platform
10. Consider the sensitivity of the topic
11. For disputed/misleading content, prioritize warning over engagement
12. Always encourage verification with multiple sources
13. Include media literacy education when appropriate

Make the post informative, engaging, and responsible. Prioritize public safety and accurate information over viral potential.`;
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
