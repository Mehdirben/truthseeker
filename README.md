# 🤖 Palestine News Fact-Checker AI Agent

An intelligent, automated AI agent that continuously monitors Palestine-related news, performs comprehensive fact-checking using advanced AI models, and generates responsible social media content. This system combines web scraping, natural language processing, and automated content generation to combat misinformation while promoting media literacy.

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Installation & Setup](#-installation--setup)
- [Configuration](#-configuration)
- [Usage Guide](#-usage-guide)
- [API Documentation](#-api-documentation)
- [Technical Details](#-technical-details)
- [Social Media Integration](#-social-media-integration)
- [Automated Twitter Posting](#-automated-twitter-posting)
- [Fact-Checking Process](#-fact-checking-process)
- [Monitoring & Analytics](#-monitoring--analytics)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

## 🌟 Overview

The Palestine News Fact-Checker AI Agent is a sophisticated system designed to address the critical need for accurate information verification in news coverage about Palestine. The agent operates autonomously, continuously monitoring multiple news sources, analyzing content for credibility, and generating fact-checked social media content.

### 🎯 Mission

- **Combat Misinformation**: Identify and flag potentially misleading or false information
- **Promote Media Literacy**: Educate users about source verification and critical thinking
- **Responsible Sharing**: Generate social media content with appropriate warnings and context
- **Transparency**: Provide detailed analysis and source verification information

### 🔄 Workflow

```
News Sources → Web Scraping → AI Analysis → Fact-Checking → Social Media Generation → Publishing
```

## ✨ Key Features

### 🔍 **Intelligent News Monitoring**
- **Multi-Source Scraping**: Automatically monitors 15+ reputable news sources
- **Real-Time Processing**: Continuous monitoring with configurable intervals
- **Duplicate Detection**: Prevents processing of already analyzed articles
- **Content Extraction**: Advanced parsing of article content, metadata, and context

### 🧠 **Advanced AI-Powered Analysis**
- **Google Gemini Integration**: Leverages cutting-edge language models for analysis
- **Credibility Scoring**: Assigns numerical credibility scores (0.0-1.0)
- **Claim Verification**: Identifies and verifies specific claims within articles
- **Source Cross-Referencing**: Compares information across multiple trusted sources
- **Bias Detection**: Identifies potential bias and missing perspectives

### 📱 **Smart Social Media Generation**
- **Multi-Platform Support**: Twitter, Facebook, Instagram, LinkedIn optimized content
- **Contextual Warnings**: Automatic misinformation alerts and fact-check notices
- **Tone Adaptation**: Professional, informative, engaging, or urgent tones
- **Character Optimization**: Platform-specific length and format optimization
- **Visual Suggestions**: AI-generated recommendations for accompanying media

### ⚠️ **Misinformation Protection**
- **Risk Assessment**: Three-tier warning system (High/Medium/Low risk)
- **Verification Prompts**: Encourages users to check multiple sources
- **Media Literacy**: Educational content about source verification
- **Responsible Hashtags**: Promotes fact-checking and verification culture

### 🔄 **Automated Operations**
- **Scheduled Processing**: Configurable intervals (default: every 6 hours)
- **Queue Management**: Handles multiple articles with rate limiting
- **Error Recovery**: Robust error handling and retry mechanisms
- **Performance Monitoring**: Built-in logging and analytics

### 🐦 **Twitter Auto-Posting**
- **Intelligent Queue Management**: Automatically posts high-credibility articles
- **Smart Scheduling**: Posts 4 times daily at optimal engagement times
- **Quality Filtering**: Only posts articles with ≥70% credibility scores
- **Rate Limiting**: Respects Twitter API limits (max 5 posts/day)
- **Real-time Monitoring**: Comprehensive logging and error handling

## 🏗️ System Architecture

### 📊 High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   News Sources  │    │   Web Scrapers  │    │  Content Store  │
│                 │───▶│                 │───▶│                 │
│ • Al Jazeera    │    │ • RSS Parsers   │    │ • Articles      │
│ • BBC News      │    │ • HTML Parsers  │    │ • Metadata      │
│ • Reuters       │    │ • API Clients   │    │ • Analysis      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Social Platforms│    │    AI Engine    │    │  Fact Checker   │
│                 │◀───│                 │◀───│                 │
│ • Twitter API   │    │ • Gemini AI     │    │ • Source Verify │
│ • Facebook API  │    │ • Post Gen      │    │ • Claim Check   │
│ • LinkedIn API  │    │ • Content Opt   │    │ • Score Calc    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │ Twitter AutoBot │
                       │                 │
                       │ • Auto Queue    │
                       │ • Smart Schedule│
                       │ • Rate Limiting │
                       │ • Quality Filter│
                       └─────────────────┘
```

### 🗂️ Directory Structure

```
palestine-news-fact-checker/
├── 📁 src/
│   ├── 📄 index.js                     # Main application server
│   ├── 📁 config/
│   │   └── 📄 config.js               # Configuration management
│   ├── 📁 scrapers/
│   │   ├── 📄 NewsScraper.js          # Main scraping orchestrator
│   │   ├── 📄 RSSFeedScraper.js       # RSS feed processing
│   │   └── 📄 WebScraper.js           # HTML content extraction
│   ├── 📁 fact-checker/
│   │   ├── 📄 FactChecker.js          # Core fact-checking logic
│   │   ├── 📄 SourceAnalyzer.js       # Source credibility analysis
│   │   └── 📄 ClaimVerifier.js        # Individual claim verification
│   ├── 📁 social-media/
│   │   ├── 📄 SocialMediaPostGenerator.js  # Post content generation
│   │   ├── 📄 SocialMediaScraper.js        # Social media monitoring
│   │   └── 📄 TwitterAutoPoster.js         # Automated Twitter posting
│   ├── 📁 sources/
│   │   ├── 📄 sources.js              # Trusted source definitions
│   │   └── 📄 rss-feeds.js            # RSS feed configurations
│   └── 📁 utils/
│       ├── 📄 logger.js               # Logging utilities
│       ├── 📄 validators.js           # Input validation
│       └── 📄 helpers.js              # Common helper functions
├── 📁 public/
│   ├── 📄 index.html                  # Web interface
│   ├── 📄 styles.css                  # UI styling
│   └── 📄 script.js                   # Frontend JavaScript
├── 📄 package.json                    # Dependencies and scripts
├── 📄 .env.example                    # Environment variables template
├── 📄 .gitignore                      # Git ignore rules
└── 📄 README.md                       # This documentation
```

## 🚀 Installation & Setup

### 📋 Prerequisites

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher
- **Google Gemini API Key**: Required for AI analysis
- **Internet Connection**: For web scraping and API calls

### 💻 Quick Start

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/palestine-news-fact-checker.git
   cd palestine-news-fact-checker
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Required
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Twitter API Configuration (OAuth 1.0a - Required for posting)
   TWITTER_API_KEY=your_twitter_api_key_here
   TWITTER_API_SECRET=your_twitter_api_secret_here
   TWITTER_ACCESS_TOKEN=your_twitter_access_token_here
   TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret_here
   
   # Auto-posting Configuration
   AUTO_POST_ENABLED=true
   MAX_POSTS_PER_DAY=5
   CREDIBILITY_THRESHOLD=70
   POSTING_HOURS=8,12,16,20
   
   # Optional
   PORT=3000
   FACT_CHECK_INTERVAL_HOURS=6
   MAX_REQUESTS_PER_MINUTE=60
   ```

4. **Get Gemini API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Sign in with your Google account
   - Create a new API key
   - Copy the key to your `.env` file

5. **Start the Application**
   ```bash
   # Development mode (auto-restart on changes)
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Verify Installation**
   - Open your browser to `http://localhost:3000`
   - Check that the web interface loads
   - Monitor console logs for any errors

## ⚙️ Configuration

### 🎛️ Core Configuration Options

#### Web Scraping Settings
```env
# Scraping behavior
USER_AGENT=Mozilla/5.0 (compatible; FactChecker/1.0)
SCRAPING_TIMEOUT=10000
SCRAPING_MAX_RETRIES=3
SCRAPING_REQUEST_DELAY=1000

# Content filtering
MIN_ARTICLE_LENGTH=100
MAX_ARTICLE_AGE_HOURS=48
```

#### AI Model Configuration
```env
# Gemini API settings
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-2.0-flash
GEMINI_TEMPERATURE=0.1

# Analysis parameters
CREDIBILITY_THRESHOLD=0.7
VERIFICATION_SOURCES=5
```

#### Fact-Checking Parameters
```env
# Processing intervals
FACT_CHECK_INTERVAL_HOURS=6
MAX_ARTICLES_PER_CYCLE=20

# Quality thresholds
MIN_CREDIBILITY_SCORE=0.3
MISINFORMATION_THRESHOLD=0.5
```

## 📖 Usage Guide

### 🌐 Web Interface

#### Dashboard Overview
The main dashboard provides:
- **Real-time Statistics**: Total articles processed, credibility distribution
- **Recent Analysis**: Latest fact-checked articles with scores
- **System Status**: Scraping status, API health, error rates
- **Manual Controls**: Trigger immediate analysis, adjust settings

#### Manual Article Analysis
1. Navigate to the "Analyze Article" section
2. Enter article URL or paste content directly
3. Select analysis depth (quick/standard/comprehensive)
4. Click "Analyze" and wait for results
5. Review credibility score, key findings, and source verification

#### Social Media Post Generation
1. Go to "Social Media Posts" section
2. Select a fact-checked article from the dropdown
3. Choose target platform (Twitter/Facebook/LinkedIn/Instagram)
4. Select tone (informative/engaging/professional/urgent)
5. Click "Generate Post" to create platform-optimized content
6. Review generated content, warnings, and hashtags
7. Copy content for manual posting

### 🔌 API Usage

#### Common API Workflows

**Get Latest News**
```bash
curl http://localhost:3000/api/news?limit=10
```

**Analyze Specific Article**
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/article",
    "title": "Article Title",
    "content": "Article content..."
  }'
```

**Generate Social Media Post**
```bash
curl -X POST http://localhost:3000/api/generate-social-post \
  -H "Content-Type: application/json" \
  -d '{
    "articleId": "123",
    "platform": "twitter",
    "tone": "informative"
  }'
```

## 📡 API Documentation

### 🎯 Core Endpoints

#### News & Articles

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/api/news` | Get latest scraped news | `limit`, `source`, `since` |
| `GET` | `/api/fact-check` | Get fact-check results | `limit`, `minCredibility` |
| `POST` | `/api/analyze` | Analyze specific article | `url`, `title`, `content` |
| `GET` | `/api/social-ready-articles` | Get articles ready for social media | `limit`, `minCredibility` |

#### Social Media

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `POST` | `/api/generate-social-post` | Generate single platform post | `articleId`, `platform`, `tone` |
| `POST` | `/api/generate-multiple-posts` | Generate multi-platform posts | `articleId`, `platforms[]`, `tone` |

### 📝 Response Examples

#### Analyze Article Response
```json
{
  "success": true,
  "analysis": {
    "credibilityScore": 0.85,
    "overallAssessment": "VERIFIED",
    "keyFindings": [
      {
        "claim": "Specific factual claim",
        "verification": "VERIFIED",
        "sources": ["Source 1", "Source 2"],
        "confidence": 0.9
      }
    ],
    "redFlags": [],
    "trustedSources": ["Al Jazeera", "Reuters"],
    "processingTime": "2.3s",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## 🔬 Technical Details

### 🧮 AI Analysis Pipeline

#### 1. Content Preprocessing
- Text cleaning and normalization
- Entity extraction
- Claim identification

#### 2. Source Verification
- Cross-reference with trusted sources
- Verify specific claims
- Timeline verification

#### 3. Credibility Calculation
The credibility score is calculated using weighted factors:

- **Source Reputation** (30%): Based on historical accuracy and bias ratings
- **Content Quality** (25%): Grammar, citations, factual consistency
- **Claim Verification** (25%): Percentage of verified vs. disputed claims
- **Temporal Relevance** (10%): How recent and timely the information is
- **Cross-Reference Success** (10%): Number of corroborating sources

#### 4. Risk Assessment
Evaluates potential misinformation risk based on:
- Credibility score
- Number of disputed claims
- Source reliability
- Content flags

### 📊 Data Models

#### Article Schema
```javascript
{
  id: String,
  url: String,
  title: String,
  content: String,
  source: String,
  publishedAt: Date,
  scrapedAt: Date,
  metadata: {
    author: String,
    category: String,
    tags: [String],
    wordCount: Number
  }
}
```

#### Analysis Schema
```javascript
{
  articleId: String,
  credibilityScore: Number, // 0.0 - 1.0
  overallAssessment: Enum, // VERIFIED, DISPUTED, MISLEADING, UNVERIFIED
  keyFindings: [{
    claim: String,
    verification: Enum, // VERIFIED, DISPUTED, UNVERIFIED
    sources: [String],
    confidence: Number
  }],
  redFlags: [String],
  processingTime: Number,
  timestamp: Date
}
```

## 📱 Social Media Integration

### 🎨 Content Generation Features

#### Platform Optimization
Each social media platform has specific requirements:

**Twitter/X**
- 280 character limit
- 2-3 hashtags optimal
- Emoji usage for engagement

**Facebook**
- Longer form content (up to 500 words)
- 3-5 hashtags
- Discussion encouragement

**LinkedIn**
- Professional tone
- 1,300 character ideal length
- Industry-relevant hashtags

**Instagram**
- Visual-first content
- 2,200 character caption limit
- 10-15 hashtags for discoverability

#### Warning System Integration

The system automatically adds appropriate warnings based on credibility scores:

**High Risk (Score < 0.3)**
```
🚨 WARNING: This content has been flagged as potentially 
misleading. Please verify with multiple sources.
#FactCheck #MisinformationAlert #VerifyBeforeSharing
```

**Medium Risk (Score 0.3-0.5)**
```
⚠️ CAUTION: This content contains disputed information. 
Cross-reference with trusted sources.
#FactCheck #VerifyInfo #MediaLiteracy
```

**Low Risk (Score 0.5-0.7)**
```
📋 NOTE: This information requires verification. 
Always check multiple sources.
#FactCheck #VerifyNews
```

## 🐦 Automated Twitter Posting

### 🚀 Overview

The Palestine News Fact-Checker includes a sophisticated Twitter automation system that intelligently selects and posts fact-checked Palestine news articles. The system operates with strict quality controls, rate limiting, and credibility thresholds to ensure only verified, high-quality content is shared.

### ✨ Key Features

#### 🤖 **Intelligent Auto-Posting**
- **Automatic Queue Management**: Articles are automatically queued based on credibility scores
- **Smart Scheduling**: Posts 4 times daily at optimal engagement times (8 AM, 12 PM, 4 PM, 8 PM)
- **Priority Scoring**: Articles ranked by credibility, impact, and relevance
- **Rate Limiting**: Maximum 5 posts per day to prevent spam
- **Quality Threshold**: Only articles with ≥70% credibility score are posted

#### 📊 **Queue Management System**
- **Automatic Queuing**: High-credibility articles (70%+) are automatically added to the posting queue
- **Priority Scoring**: Articles scored based on:
  - Credibility percentage (40%)
  - Source reputation (25%)
  - Timeliness/breaking news factor (20%)
  - Content impact/importance (15%)
- **Duplicate Prevention**: Prevents posting similar content multiple times
- **Manual Override**: API endpoints for manual queue management

#### 📋 **Quality & Safety Controls**
- **Credibility Filtering**: Only posts articles with credibility scores ≥70%
- **Content Warnings**: Automatic misinformation warnings for lower-scored content
- **Source Verification**: Cross-references multiple trusted sources
- **Fact-Check Labels**: Clear labeling with credibility percentages
- **Rate Limiting**: Respects Twitter API limits and best practices

### ⚙️ Setup & Configuration

#### 🔑 Twitter API Authentication

The system requires Twitter API v1.1 OAuth 1.0a credentials for posting functionality:

1. **Create Twitter Developer Account**
   - Visit [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
   - Apply for developer access
   - Create a new app project

2. **Configure App Permissions**
   ```
   ⚠️ CRITICAL: Set app permissions to "Read and write"
   ```
   - Go to your app's Settings tab
   - Click "User authentication settings"
   - Set "App permissions" to "Read and write"
   - Save changes

3. **Generate Access Tokens**
   - Navigate to "Keys and tokens" tab
   - Generate "Access Token and Secret"
   - ⚠️ **Important**: Regenerate tokens after changing permissions

4. **Environment Configuration**
   ```env
   # Twitter OAuth 1.0a Credentials (Required for posting)
   TWITTER_API_KEY=your_twitter_api_key_here
   TWITTER_API_SECRET=your_twitter_api_secret_here
   TWITTER_ACCESS_TOKEN=your_twitter_access_token_here
   TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret_here
   
   # Auto-posting Configuration
   AUTO_POST_ENABLED=true
   MAX_POSTS_PER_DAY=5
   CREDIBILITY_THRESHOLD=70
   
   # Posting Schedule (24-hour format)
   POSTING_HOURS=8,12,16,20
   ```

#### 📅 **Scheduling Configuration**

The system posts at configurable times throughout the day:

```javascript
// Default schedule (can be customized in .env)
const defaultSchedule = [
  { hour: 8, minute: 0 },   // 8:00 AM - Morning news
  { hour: 12, minute: 0 },  // 12:00 PM - Midday updates  
  { hour: 16, minute: 0 },  // 4:00 PM - Afternoon news
  { hour: 20, minute: 0 }   // 8:00 PM - Evening summary
];
```

### 📋 API Endpoints

#### Twitter Queue Management

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/api/twitter/queue` | Get current posting queue | `limit`, `minPriority` |
| `GET` | `/api/twitter/status` | Get auto-poster status | - |
| `POST` | `/api/twitter/post-now` | Post next queued article immediately | - |
| `POST` | `/api/twitter/test-auth` | Test Twitter authentication | - |
| `DELETE` | `/api/twitter/queue/:id` | Remove article from queue | `id` |

#### Usage Examples

**Check Queue Status**
```bash
curl http://localhost:3000/api/twitter/queue
```

**Test Authentication**
```bash
curl -X POST http://localhost:3000/api/twitter/test-auth
```

**Post Immediately**
```bash
curl -X POST http://localhost:3000/api/twitter/post-now
```

### 📊 **Monitoring & Analytics**

#### Real-time Status Dashboard

The web interface provides comprehensive monitoring:

- **Queue Status**: Number of articles ready to post
- **Authentication Status**: Twitter API connection health
- **Posting History**: Recent tweets with engagement metrics
- **Success/Error Rates**: System reliability statistics
- **Next Scheduled Post**: Countdown to next automatic post

#### Logging & Debugging

The system provides detailed logging for monitoring:

```javascript
// Example log outputs
[INFO] ✅ Twitter OAuth 1.0a authenticated as @mehdirben
[INFO] 📤 Added to Twitter queue: "Article Title" (Priority: 78)
[INFO] 🐦 Posted tweet ID: 1926401528451002438
[INFO] 📅 Next scheduled post: 2024-01-15 16:00:00
[ERROR] ❌ Tweet posting failed: Rate limit exceeded
```

### 🔧 **Troubleshooting**

#### Common Authentication Issues

**403 "Unsupported Authentication" Error**
```bash
# Issue: Using Bearer Token instead of OAuth 1.0a
# Solution: Remove Bearer Token from .env, use only OAuth 1.0a credentials
```

**401 "Unauthorized" Error**
```bash
# Issue: App permissions set to "Read-only"
# Solution: Change app permissions to "Read and write" and regenerate tokens
```

**Multiple Authentication Methods**
```bash
# Issue: Both OAuth 1.0a and OAuth 2.0 credentials in .env
# Solution: Keep only OAuth 1.0a credentials for posting
```

#### Testing Authentication

Use the diagnostic script to test your setup:

```bash
node test-twitter-auth.js
```

Expected output:
```
✅ Twitter OAuth 1.0a authenticated as @yourusername
✅ Write permissions confirmed
🐦 Ready for auto-posting!
```

### 📈 **Performance Metrics**

The system tracks key performance indicators:

#### Posting Metrics
- **Posts per Day**: Average daily posting volume
- **Success Rate**: Percentage of successful posts
- **Queue Efficiency**: Average time from analysis to posting
- **Engagement Tracking**: Retweets, likes, replies (if available)

#### Quality Metrics  
- **Average Credibility**: Mean credibility score of posted content
- **Source Distribution**: Breakdown of content by news source
- **Error Rates**: Failed posts, authentication issues, rate limits
- **Queue Health**: Articles queued vs. posted ratios

### 🎯 **Best Practices**

#### Content Strategy
- **Quality over Quantity**: Focus on high-credibility content (70%+)
- **Diverse Sources**: Maintain balanced source representation
- **Timely Posting**: Leverage breaking news for maximum impact
- **Clear Labeling**: Always include credibility scores and fact-check labels

#### Technical Guidelines
- **Rate Limit Respect**: Never exceed Twitter's API limits
- **Error Handling**: Implement robust retry mechanisms
- **Authentication Security**: Regularly rotate API credentials
- **Monitoring**: Continuously monitor system health and performance

### 🔮 **Future Enhancements**

#### Planned Features
- **Multi-Account Support**: Post to multiple Twitter accounts
- **Thread Generation**: Create Twitter threads for longer articles
- **Image Generation**: AI-generated images for enhanced engagement
- **Analytics Integration**: Deep integration with Twitter Analytics API
- **Sentiment Analysis**: Real-time monitoring of audience response

## 🔍 Fact-Checking Process

### 📋 Methodology

#### Phase 1: Source Collection
1. **RSS Feed Monitoring**: Automated collection from 15+ sources
2. **Content Extraction**: HTML parsing and text normalization
3. **Duplicate Detection**: URL and content similarity matching
4. **Metadata Extraction**: Author, publication date, category

#### Phase 2: AI Analysis
1. **Content Understanding**: Natural language processing with Gemini
2. **Claim Identification**: Extraction of factual assertions
3. **Context Analysis**: Understanding of geopolitical context
4. **Bias Detection**: Identification of potential bias indicators

#### Phase 3: Verification
1. **Source Cross-Referencing**: Comparison with trusted sources
2. **Claim Verification**: Individual fact-checking of assertions
3. **Timeline Verification**: Checking dates and sequence of events

#### Phase 4: Scoring
1. **Credibility Calculation**: Multi-factor scoring algorithm
2. **Risk Assessment**: Classification of misinformation risk
3. **Confidence Intervals**: Statistical confidence in analysis
4. **Source Quality Weighting**: Adjustment based on source reliability

### 🎯 Quality Assurance

#### Validation Steps
- **Multi-Source Verification**: Minimum 3 source confirmation
- **Temporal Consistency**: Timeline verification across sources
- **Logical Consistency**: Internal contradiction detection
- **Expert Review**: Flagging for human review when needed

## 📈 Monitoring & Analytics

### 📊 Key Metrics

#### System Performance
- **Processing Speed**: Average time per article analysis
- **Accuracy Rate**: Percentage of correct credibility assessments
- **Source Coverage**: Number of sources successfully monitored
- **Uptime**: System availability and reliability metrics

#### Content Analytics
- **Article Volume**: Number of articles processed daily/weekly
- **Credibility Distribution**: Breakdown of scores across articles
- **Source Performance**: Reliability metrics by news source
- **Trend Analysis**: Emerging topics and misinformation patterns

#### API Usage
- **Request Volume**: Number of API calls per endpoint
- **Response Times**: Average latency for different operations
- **Error Rates**: Percentage of failed requests by type
- **User Engagement**: Web interface usage patterns

## 🤝 Contributing

### 🛠️ Development Setup

1. **Fork the Repository**
   ```bash
   git fork https://github.com/original-repo/palestine-fact-checker
   ```

2. **Create Development Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Install Development Dependencies**
   ```bash
   npm install --include=dev
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

### 📝 Contribution Guidelines

#### Code Standards
- **ES6+ JavaScript**: Modern syntax and features
- **Modular Architecture**: Clear separation of concerns
- **Error Handling**: Comprehensive try-catch blocks
- **Documentation**: JSDoc comments for all functions
- **Testing**: Unit tests for all new features

#### Areas for Contribution
- **New Source Integrations**: Adding support for additional news sources
- **Language Support**: Multi-language content analysis
- **Social Media Platforms**: Integration with additional platforms
- **UI/UX Improvements**: Enhanced web interface design
- **Performance Optimization**: Speed and efficiency improvements

## 🔧 Troubleshooting

### 🚨 Common Issues

#### API Key Problems
**Issue**: "Gemini API key invalid or missing"
```bash
# Check environment variables
echo $GEMINI_API_KEY

# Verify .env file exists
ls -la .env
```

#### Memory Issues
**Issue**: High memory usage or out-of-memory errors
- Monitor memory usage with built-in diagnostics
- Implement article limits to prevent memory overflow
- Clear old articles regularly

#### Rate Limiting
**Issue**: Too many API requests
- Implement exponential backoff
- Respect rate limits with delays between requests
- Use request queuing for better management

### 🔍 Debugging Tools

#### Logging Configuration
```javascript
// Set log level for debugging
process.env.LOG_LEVEL = 'debug';
```

#### Health Check Endpoints
```bash
# System health
curl http://localhost:3000/api/health

# API status
curl http://localhost:3000/api/news
```

## 📄 License

### MIT License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### 🎯 Ethical Use Guidelines

This tool is designed for:
- ✅ Educational purposes and media literacy
- ✅ Combating misinformation and promoting accuracy
- ✅ Supporting independent journalism and fact-checking
- ✅ Encouraging critical thinking about news sources

This tool should NOT be used for:
- ❌ Suppressing legitimate journalism or free speech
- ❌ Promoting any political agenda or bias
- ❌ Harassing or targeting individuals or organizations

---

## 🙏 Acknowledgments

### 👥 Contributors
- **Lead Developer**: Development team
- **AI/ML Integration**: Google Gemini API
- **Open Source Libraries**: Express.js, Axios, Cheerio, and others

### 🏢 Organizations
- **Google AI**: For providing the Gemini API
- **News Sources**: Al Jazeera, BBC, Reuters, and other organizations
- **Open Source Community**: For the foundational libraries and tools

---

## 📞 Contact & Support

### 🌐 Project Links
- **GitHub Repository**: [Project Repository](https://github.com/your-username/palestine-fact-checker)
- **Issues**: Report bugs and request features on GitHub
- **Documentation**: Comprehensive guides and API docs

### 📧 Support
- **Technical Issues**: Create an issue on GitHub
- **Feature Requests**: Use GitHub Discussions
- **General Questions**: Community support via issues

---

**Made with ❤️ for truth, transparency, and media literacy**

*Last updated: January 2024*
*Version: 1.0.0* 