import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/config.js';
import { newsSources } from '../sources/sources.js';
import { logger, delay, extractMainContent } from '../utils/logger.js';
import { SocialMediaScraper } from '../social-media/SocialMediaScraper.js';

export class FactChecker {
    constructor() {
        if (!config.gemini.apiKey) {
            throw new Error('Gemini API key is required. Please set GEMINI_API_KEY in your .env file.');
        }
        
        this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: config.gemini.model });
        this.socialMediaScraper = new SocialMediaScraper();
    }

    async analyzeArticle(article) {
        try {
            logger.info(`Analyzing article: ${article.title}`);
            
            // Extract main content if too long
            const content = extractMainContent(article.content);
            
            const analysis = await this.performFactCheck(article, content);
            
            // Add delay to respect rate limits
            await delay(config.rateLimiting.geminiDelay);
            
            return analysis;
            
        } catch (error) {
            logger.error(`Error analyzing article: ${article.title}`, error.message);
            return {
                error: 'Analysis failed',
                message: error.message,
                credibilityScore: 0,
                analysisDate: new Date().toISOString()
            };
        }
    }

    async performFactCheck(article, content) {
        const prompt = this.buildFactCheckPrompt(article, content);
        
        try {
            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            
            // Parse the AI response
            return this.parseFactCheckResponse(response, article);
            
        } catch (error) {
            logger.error('Gemini API error:', error.message);
            throw error;
        }
    }

    buildFactCheckPrompt(article, content) {
        const reputableSources = Object.values(newsSources)
            .filter(source => source.isReputable)
            .map(source => source.name)
            .join(', ');

        return `
As an expert fact-checker specializing in Middle East news and Palestine-Israel coverage, please analyze this news article with emphasis on Palestinian perspectives and ground-truth verification:

**Article Title:** ${article.title}
**Source:** ${article.source}
**URL:** ${article.url}
**Content:** ${content}

Please provide a comprehensive cross-reference analysis in JSON format with the following structure:

{
    "credibilityScore": <number between 0-1>,
    "overallAssessment": "<VERIFIED/PARTIALLY_VERIFIED/DISPUTED/MISLEADING/UNVERIFIED>",
    "trustedSources": [
        "International outlets (Reuters, BBC, AP News)",
        "Regional sources (Al Jazeera, HesPress)",
        "Palestinian outlets",
        "Social media verification",
        "Citizen journalism"
    ],
    "socialMediaVerification": {
        "status": "<confirmed/disputed/contradicted/not_found>",
        "result": "<brief description>",
        "details": "<what social media evidence shows vs institutional reporting>"
    },
    "keyFindings": [
        {
            "claim": "<specific claim from article>",
            "verification": "<VERIFIED/DISPUTED/UNVERIFIED>",
            "evidence": "<supporting or contradicting evidence>",
            "sources": ["<institutional sources>", "<social media evidence>", "<citizen reports>"],
            "socialMediaStatus": "<found/not_found/contradicts>",
            "palestinianPerspective": "<what Palestinian sources say about this claim>"
        }
    ],
    "sourceAnalysis": {
        "reputation": "<assessment of source credibility>",
        "bias": "<detected bias if any>",
        "palestinianContext": "<does this source include Palestinian perspectives>",
        "groundTruthAlignment": "<how well does this align with social media and citizen reports>"
    },
    "contextualFactors": [
        "<important context from Palestinian perspectives>",
        "<social media context and citizen reports>",
        "<regional context from HesPress and similar sources>"
    ],
    "redFlags": [
        "<institutional bias or missing Palestinian context>",
        "<contradictions with social media evidence>",
        "<lack of ground-truth verification>"
    ],
    "crossReference": {
        "institutionalSources": "<alignment between Reuters, BBC, AP News>",
        "regionalSources": "<what Al Jazeera, HesPress report>",
        "socialMediaEvidence": "<what verified social media accounts show>",
        "citizenJournalism": "<what people on the ground are reporting>",
        "palestinianSources": "<what Palestinian outlets report>",
        "majorDiscrepancies": "<significant differences between source types>"
    },
    "recommendations": "<advice emphasizing the importance of Palestinian perspectives and ground-truth verification>",
    "analysisDate": "${new Date().toISOString()}"
}

**Critical Verification Guidelines:**
1. **Prioritize Ground Truth**: Social media evidence and citizen journalism often provide the most immediate and accurate information
2. **Palestinian Perspective Essential**: Always note if Palestinian voices and context are missing from institutional reporting
3. **Cross-Reference with HesPress**: Include Moroccan regional perspective and Arab world context
4. **Social Media Verification**: Check if claims align with verified social media accounts and eyewitness reports
5. **Citizen Journalism Priority**: User-generated content and citizen reports often reveal truth that institutional media misses
6. **Institutional Bias Detection**: Note when Western/Israeli sources contradict Palestinian and regional sources
7. **Real-time vs Delayed**: Social media provides real-time information that traditional media often filters or delays
8. **Missing Context**: Identify when institutional sources lack crucial Palestinian or regional context

**Source Hierarchy for Palestine News:**
1. Direct eyewitness accounts (social media, citizen journalism)
2. Palestinian news outlets and local sources
3. Regional sources (Al Jazeera, HesPress, Arab media)
4. International sources (Reuters, BBC, AP) - but note limitations
5. Israeli sources - use with extreme caution and always cross-reference

**Focus Areas:**
- Does this article include Palestinian perspectives?
- How does it compare to social media evidence and citizen reports?
- What does HesPress and regional sources say?
- Are there discrepancies between institutional and ground-truth sources?
- Is crucial context missing that only Palestinian sources provide?

Please prioritize truth from the ground up, not institutional narratives down.`;
    }

    parseFactCheckResponse(response, article) {
        try {
            // Extract JSON from the response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }
            
            const analysis = JSON.parse(jsonMatch[0]);
            
            // Validate and enhance the analysis
            return {
                ...analysis,
                articleTitle: article.title,
                articleSource: article.source,
                articleUrl: article.url,
                sourceCredibility: article.sourceCredibility || 0,
                processedAt: new Date().toISOString(),
                
                // Ensure required fields exist
                credibilityScore: analysis.credibilityScore || 0,
                overallAssessment: analysis.overallAssessment || 'UNVERIFIED',
                keyFindings: analysis.keyFindings || [],
                sourceAnalysis: analysis.sourceAnalysis || {},
                contextualFactors: analysis.contextualFactors || [],
                redFlags: analysis.redFlags || [],
                crossReference: analysis.crossReference || {},
                recommendations: analysis.recommendations || '',
                
                // New fields for comprehensive verification
                trustedSources: analysis.trustedSources || [
                    'International outlets (Reuters, BBC, AP News)',
                    'Regional sources (Al Jazeera, HesPress)', 
                    'Palestinian outlets',
                    'Social media verification',
                    'Citizen journalism'
                ],
                socialMediaVerification: analysis.socialMediaVerification || {
                    status: 'not_found',
                    result: 'No social media verification performed',
                    details: 'Cross-referencing with social media and citizen reports not completed'
                },
                
                // Add our own scoring
                finalScore: this.calculateFinalScore(analysis, article)
            };
            
        } catch (error) {
            logger.error('Error parsing fact-check response:', error.message);
            
            // Return a basic analysis if parsing fails
            return {
                articleTitle: article.title,
                articleSource: article.source,
                articleUrl: article.url,
                credibilityScore: 0.5,
                overallAssessment: 'UNVERIFIED',
                error: 'Failed to parse AI analysis',
                rawResponse: response,
                processedAt: new Date().toISOString(),
                finalScore: 0.5
            };
        }
    }

    calculateFinalScore(analysis, article) {
        let score = analysis.credibilityScore || 0;
        
        // Adjust based on source credibility
        if (article.sourceCredibility) {
            score = (score + article.sourceCredibility) / 2;
        }
        
        // Boost score for social media verification
        if (analysis.socialMediaVerification) {
            if (analysis.socialMediaVerification.status === 'confirmed') {
                score += 0.15; // Boost for social media confirmation
            } else if (analysis.socialMediaVerification.status === 'contradicted') {
                score -= 0.2; // Penalty for contradicting social media evidence
            }
        }
        
        // Boost score for Palestinian perspective inclusion
        if (analysis.sourceAnalysis && analysis.sourceAnalysis.palestinianContext) {
            if (analysis.sourceAnalysis.palestinianContext.includes('included') || 
                analysis.sourceAnalysis.palestinianContext.includes('Palestinian perspectives')) {
                score += 0.1; // Boost for including Palestinian context
            }
        }
        
        // Adjust based on ground truth alignment
        if (analysis.sourceAnalysis && analysis.sourceAnalysis.groundTruthAlignment) {
            if (analysis.sourceAnalysis.groundTruthAlignment.includes('high') || 
                analysis.sourceAnalysis.groundTruthAlignment.includes('aligns')) {
                score += 0.1;
            } else if (analysis.sourceAnalysis.groundTruthAlignment.includes('contradicts') ||
                      analysis.sourceAnalysis.groundTruthAlignment.includes('poor')) {
                score -= 0.15;
            }
        }
        
        // Adjust based on red flags (now including institutional bias)
        if (analysis.redFlags && analysis.redFlags.length > 0) {
            score -= 0.08 * analysis.redFlags.length; // Reduced penalty since some red flags are institutional bias detection
        }
        
        // Adjust based on verification status
        if (analysis.overallAssessment === 'VERIFIED') {
            score += 0.1;
        } else if (analysis.overallAssessment === 'DISPUTED' || analysis.overallAssessment === 'MISLEADING') {
            score -= 0.2;
        }
        
        // Bonus for citizen journalism confirmation
        if (analysis.crossReference && analysis.crossReference.citizenJournalism) {
            if (analysis.crossReference.citizenJournalism.includes('confirms') ||
                analysis.crossReference.citizenJournalism.includes('verified')) {
                score += 0.1;
            }
        }
        
        // Ensure score is between 0 and 1
        return Math.max(0, Math.min(1, score));
    }
}
