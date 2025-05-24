import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/config.js';
import { newsSources } from '../sources/sources.js';
import { logger, delay, extractMainContent } from '../utils/logger.js';

export class FactChecker {
    constructor() {
        if (!config.gemini.apiKey) {
            throw new Error('Gemini API key is required. Please set GEMINI_API_KEY in your .env file.');
        }
        
        this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: config.gemini.model });
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
As an expert fact-checker specializing in Middle East news and Palestine-Israel coverage, please analyze this news article:

**Article Title:** ${article.title}
**Source:** ${article.source}
**URL:** ${article.url}
**Content:** ${content}

Please provide a comprehensive fact-check analysis in JSON format with the following structure:

{
    "credibilityScore": <number between 0-1>,
    "overallAssessment": "<VERIFIED/PARTIALLY_VERIFIED/DISPUTED/MISLEADING/UNVERIFIED>",
    "keyFindings": [
        {
            "claim": "<specific claim from article>",
            "verification": "<VERIFIED/DISPUTED/UNVERIFIED>",
            "evidence": "<supporting or contradicting evidence>",
            "sources": ["<reputable source 1>", "<reputable source 2>"]
        }
    ],
    "sourceAnalysis": {
        "reputation": "<assessment of source credibility>",
        "bias": "<detected bias if any>",
        "previousAccuracy": "<historical accuracy of source>"
    },
    "contextualFactors": [
        "<important context or background information>"
    ],
    "redFlags": [
        "<any concerning elements like sensationalism, lack of sources, etc.>"
    ],
    "crossReference": {
        "similarReporting": "<whether other reputable sources report similar information>",
        "conflictingReports": "<any contradictory reporting from reliable sources>"
    },
    "recommendations": "<advice for readers on how to interpret this information>",
    "analysisDate": "${new Date().toISOString()}"
}

**Important Guidelines:**
1. Focus on factual accuracy and verifiable information
2. Consider the source's track record and potential bias
3. Look for corroboration from multiple reputable sources: ${reputableSources}
4. Be especially careful with emotionally charged content
5. Note any missing context or important background information
6. Identify specific claims that can be fact-checked
7. Distinguish between opinion/analysis and factual reporting
8. Consider the timeliness and relevance of the information

Please be thorough but concise in your analysis.`;
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
        
        // Adjust based on red flags
        if (analysis.redFlags && analysis.redFlags.length > 0) {
            score -= 0.1 * analysis.redFlags.length;
        }
        
        // Adjust based on verification status
        if (analysis.overallAssessment === 'VERIFIED') {
            score += 0.1;
        } else if (analysis.overallAssessment === 'DISPUTED' || analysis.overallAssessment === 'MISLEADING') {
            score -= 0.2;
        }
        
        // Ensure score is between 0 and 1
        return Math.max(0, Math.min(1, score));
    }
}
