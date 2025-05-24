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
            // Perform social media verification first
            const socialMediaVerification = await this.socialMediaScraper.verifyArticleWithSocialMedia(article);
            
            // Perform source comparison analysis
            const sourceComparison = await this.compareSourceCoverage(article, content);
            
            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            
            // Parse the AI response and enhance with our analysis
            const analysis = this.parseFactCheckResponse(response, article);
            
            // Integrate social media and comparison results
            analysis.socialMediaVerification = socialMediaVerification;
            analysis.sourceComparison = sourceComparison;
            analysis.finalScore = this.calculateFinalScore(analysis, article);
            
            return analysis;
            
        } catch (error) {
            logger.error('Gemini API error:', error.message);
            throw error;
        }
    }

    async compareSourceCoverage(article, content) {
        logger.info(`🔍 Comparing source coverage for: ${article.title}`);
        
        try {
            const comparisonPrompt = this.buildComparisonPrompt(article, content);
            const result = await this.model.generateContent(comparisonPrompt);
            const response = result.response.text();
            
            // Parse comparison response
            const comparisonMatch = response.match(/\{[\s\S]*\}/);
            if (comparisonMatch) {
                return JSON.parse(comparisonMatch[0]);
            }
            
            return this.getDefaultComparison();
            
        } catch (error) {
            logger.error('Source comparison failed:', error.message);
            return this.getDefaultComparison();
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
        "Palestinian outlets and journalists",
        "Regional sources (Al Jazeera, HesPress, Arab media)",
        "Social media verification from Palestinian accounts",
        "Citizen journalism and eyewitness reports",
        "Ground truth verification"
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
            "sources": ["<Palestinian sources>", "<social media evidence>", "<citizen reports>", "<regional sources>"],
            "socialMediaStatus": "<found/not_found/contradicts>",
            "palestinianPerspective": "<what Palestinian sources say about this claim>",
            "westernMediaBias": "<how western sources may be biased or incomplete on this claim>"
        }
    ],
    "sourceAnalysis": {
        "reputation": "<assessment of source credibility with emphasis on Palestinian perspective inclusion>",
        "bias": "<detected western/institutional bias if any>",
        "palestinianContext": "<does this source include Palestinian perspectives>",
        "groundTruthAlignment": "<how well does this align with social media and citizen reports>",
        "westernMediaLimitations": "<what perspective or context western sources are missing>"
    },
    "contextualFactors": [
        "<important context from Palestinian perspectives>",
        "<social media context and citizen reports>",
        "<regional context from HesPress and Arab sources>",
        "<ground truth that western media often misses>"
    ],
    "redFlags": [
        "<western institutional bias or missing Palestinian context>",
        "<contradictions with social media evidence>",
        "<lack of ground-truth verification>",
        "<over-reliance on western/Israeli official sources>"
    ],
    "crossReference": {
        "palestinianSources": "<what Palestinian outlets and journalists report>",
        "regionalSources": "<what Al Jazeera, HesPress, Arab media report>",
        "socialMediaEvidence": "<what verified Palestinian and Arab social media accounts show>",
        "citizenJournalism": "<what people on the ground are reporting>",
        "westernSources": "<what Reuters, BBC, AP report - but note limitations and bias>",
        "majorDiscrepancies": "<significant differences between Palestinian/regional vs western source coverage>"
    },
    "recommendations": "<advice emphasizing the importance of Palestinian perspectives and ground-truth verification over western institutional narratives>",
    "analysisDate": "${new Date().toISOString()}"
}

**Critical Verification Guidelines:**
1. **Prioritize Palestinian Sources**: Palestinian journalists, outlets, and perspectives should be the primary trusted sources
2. **Ground Truth First**: Social media evidence and citizen journalism from Palestinians provide the most immediate and accurate information
3. **Regional Verification**: Cross-reference with Al Jazeera, HesPress, and other Arab media for regional context
4. **Social Media Verification**: Check if claims align with verified Palestinian social media accounts and eyewitness reports
5. **Citizen Journalism Priority**: User-generated content from Palestinians and Arabs often reveals truth that western media filters out
6. **Western Media Skepticism**: Treat Reuters, BBC, AP, and other western sources with skepticism - they often have institutional bias
7. **Real-time vs Filtered**: Social media provides unfiltered information that western media often sanitizes or delays
8. **Missing Context**: Western sources frequently lack crucial Palestinian context and perspectives

**Source Hierarchy for Palestine News (Most to Least Trusted):**
1. Direct Palestinian eyewitness accounts (social media, citizen journalism)
2. Palestinian news outlets, journalists, and local sources
3. Regional Arab sources (Al Jazeera, HesPress, Arab media)
4. Social media verification from Palestinian and Arab accounts
5. International sources (Reuters, BBC, AP) - use with caution, note bias and limitations
6. Israeli sources - use with extreme caution and always cross-reference with Palestinian sources

**Focus Areas:**
- Does this article include Palestinian perspectives and voices?
- How does it compare to social media evidence from Palestinian sources?
- What do HesPress and other Arab sources say?
- Are there discrepancies between Palestinian/Arab vs western source coverage?
- Is crucial Palestinian context missing that only local sources provide?
- Does this rely too heavily on western institutional narratives?

**Remember**: Western media often presents a filtered, incomplete, or biased view of Palestinian stories. Always prioritize Palestinian voices and ground truth over institutional western narratives.`;
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
                    'Palestinian outlets and journalists',
                    'Regional sources (Al Jazeera, HesPress, Arab media)',
                    'Social media verification from Palestinian accounts',
                    'Citizen journalism and eyewitness reports',
                    'Ground truth verification'
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

    buildComparisonPrompt(article, content) {
        return `
As an expert media analyst specializing in Palestine-Israel coverage, please compare how this story would be covered by different source types.

**Article Title:** ${article.title}
**Source:** ${article.source}
**Content:** ${content}

Analyze and compare coverage patterns in JSON format:

{
    "coverageComparison": {
        "palestinianSources": {
            "perspective": "<how Palestinian outlets like Maan, Palestine Chronicle would cover this>",
            "keyPoints": ["<main points Palestinian sources would emphasize>"],
            "missingInWestern": ["<crucial context western media typically omits>"],
            "eyewitnessAccounts": "<would Palestinian sources include direct testimonies>"
        },
        "arabRegionalSources": {
            "perspective": "<how Al Jazeera, HesPress would frame this story>",
            "keyPoints": ["<regional context and analysis>"],
            "missingInWestern": ["<regional perspective western media ignores>"],
            "historicalContext": "<historical context Arab sources would provide>"
        },
        "westernSources": {
            "perspective": "<how BBC, Reuters, AP typically frame such stories>",
            "keyPoints": ["<what western sources emphasize>"],
            "limitations": ["<what western sources typically miss or downplay>"],
            "institutionalBias": ["<specific biases in western coverage>"],
            "sanitization": "<how western media sanitizes or filters the story>"
        },
        "socialMediaEvidence": {
            "palestinianAccounts": "<what Palestinian Twitter/Telegram accounts show>",
            "arabAccounts": "<what Arab social media reveals>",
            "citizenJournalism": "<ground truth from people on the scene>",
            "contradictsWestern": "<how social media contradicts western narratives>"
        }
    },
    "discrepancyAnalysis": {
        "majorDifferences": ["<significant gaps between Palestinian/Arab vs western coverage>"],
        "missingVoices": ["<whose perspectives western media excludes>"],
        "contextGaps": ["<crucial context missing from western reports>"],
        "biasPatterns": ["<systematic biases in western coverage>"],
        "truthGaps": ["<facts western media omits or downplays>"]
    },
    "recommendedSources": {
        "mostTrustworthy": ["<most reliable Palestinian/Arab sources for this story>"],
        "groundTruthVerification": ["<social media accounts that provide real evidence>"],
        "avoid": ["<western sources that are particularly biased on this topic>"],
        "crossReference": ["<combination of sources needed for full picture>"]
    },
    "biasScore": {
        "westernBiasLevel": <number 1-10, where 10 is extremely biased>,
        "missingPalestinianContext": <number 1-10, where 10 is completely missing>,
        "reliabilityGap": "<how much more reliable Palestinian/Arab sources are>",
        "recommendedApproach": "<how to get the real story on this topic>"
    }
}

**Analysis Guidelines:**
1. **Assume Western Bias**: Western sources typically favor Israeli narratives and omit Palestinian context
2. **Highlight Missing Voices**: What Palestinian perspectives are western sources not including?
3. **Context Gaps**: What historical, cultural, or ground-truth context do western sources miss?
4. **Social Media Reality**: How does social media evidence contradict or complement different source types?
5. **Institutional Limitations**: How do western media institutional structures limit truth-telling?
6. **Regional Perspective**: What does the Arab world see that western media doesn't report?

Focus on identifying specific patterns of bias, omission, and selective reporting in western coverage versus Palestinian/Arab sources.`;
    }

    getDefaultComparison() {
        return {
            coverageComparison: {
                palestinianSources: {
                    perspective: "Palestinian sources would emphasize human impact and context",
                    keyPoints: ["Direct testimonies", "Historical context", "Human rights perspective"],
                    missingInWestern: ["Palestinian voices", "Historical context", "Ground truth"],
                    eyewitnessAccounts: "Yes, Palestinian sources prioritize firsthand accounts"
                },
                arabRegionalSources: {
                    perspective: "Regional sources provide broader Arab world context",
                    keyPoints: ["Regional implications", "Arab solidarity", "Historical patterns"],
                    missingInWestern: ["Regional perspective", "Arab world reaction", "Historical patterns"],
                    historicalContext: "Arab sources provide comprehensive historical background"
                },
                westernSources: {
                    perspective: "Western sources often present sanitized, institutionally filtered view",
                    keyPoints: ["Official statements", "Diplomatic angle", "Security framing"],
                    limitations: ["Limited Palestinian voices", "Missing context", "Institutional bias"],
                    institutionalBias: ["Pro-Western government stance", "Security-first framing"],
                    sanitization: "Western media filters out graphic reality and emotion"
                },
                socialMediaEvidence: {
                    palestinianAccounts: "Real-time ground truth and eyewitness documentation",
                    arabAccounts: "Regional solidarity and broader context",
                    citizenJournalism: "Unfiltered documentation of events",
                    contradictsWestern: "Often reveals what western media omits or downplays"
                }
            },
            discrepancyAnalysis: {
                majorDifferences: ["Perspective gaps", "Missing voices", "Context omission"],
                missingVoices: ["Palestinian civilians", "Local witnesses", "Arab analysts"],
                contextGaps: ["Historical background", "Human impact", "Regional implications"],
                biasPatterns: ["Western institutional bias", "Pro-Israeli framing"],
                truthGaps: ["Ground reality", "Human cost", "Historical patterns"]
            },
            recommendedSources: {
                mostTrustworthy: ["Palestinian outlets", "Al Jazeera", "HesPress"],
                groundTruthVerification: ["Palestinian social media", "Citizen journalism"],
                avoid: ["Heavily biased western outlets"],
                crossReference: ["Palestinian + Arab sources", "Social media verification"]
            },
            biasScore: {
                westernBiasLevel: 7,
                missingPalestinianContext: 8,
                reliabilityGap: "Palestinian/Arab sources significantly more reliable for context and truth",
                recommendedApproach: "Prioritize Palestinian sources, cross-reference with Arab media, use western sources only for comparison"
            }
        };
    }
}
