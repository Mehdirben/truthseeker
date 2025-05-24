# Palestine News Fact-Checker AI Agent

An AI-powered agent that scrapes the latest Palestine news from various sources and performs fact-checking using reputable sources like Al Jazeera, powered by Google's Gemini API.

## Features

- 🔍 **Web Scraping**: Automatically scrapes Palestine news from multiple sources
- 🤖 **AI-Powered Analysis**: Uses Google Gemini API for intelligent fact-checking
- 📰 **Reputable Sources**: Cross-references with Al Jazeera and other trusted news outlets
- ⏰ **Automated Monitoring**: Scheduled news collection and analysis
- 🌐 **Web Interface**: Simple web interface to view results
- 📊 **Fact-Check Reports**: Detailed analysis with source verification
- 📱 **Social Media Integration**: Generate responsible social media posts about news with fact-check warnings
- 🚨 **Misinformation Alerts**: Advanced fake news detection and warning system

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file with:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

3. **Get Gemini API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Create an API key for Gemini
   - Add it to your `.env` file

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Manual Test
```bash
npm test
```

## API Endpoints

- `GET /` - Web interface
- `GET /api/news` - Get latest Palestine news
- `GET /api/fact-check` - Get fact-checked articles
- `POST /api/analyze` - Analyze specific article
- `GET /api/social-ready-articles` - Get articles suitable for social media posting
- `POST /api/generate-social-post` - Generate social media post for specific platform
- `POST /api/generate-multiple-posts` - Generate posts for multiple platforms

## Project Structure

```
src/
├── index.js           # Main application entry point
├── config/            # Configuration files
├── scrapers/          # Web scrapers for different news sources
├── fact-checker/      # Fact-checking logic using Gemini AI
├── social-media/      # Social media post generation
├── sources/           # Reputable source configurations
└── utils/             # Utility functions
```

## Social Media Post Generation

The application now includes advanced social media post generation capabilities:

### Features
- **Multi-Platform Support**: Generate posts for Twitter, Facebook, Instagram, LinkedIn
- **Tone Customization**: Choose from informative, engaging, urgent, or professional tones
- **Fake News Warnings**: Automatic detection and warning for disputed/misleading content
- **Responsible Sharing**: Include tips for media literacy and verification
- **Character Limits**: Respect platform-specific character restrictions
- **Visual Suggestions**: AI-generated suggestions for accompanying visuals

### Usage
1. Navigate to the "Generate Social Media Posts" section
2. Select a fact-checked article from the dropdown
3. Choose your target platform and tone
4. Click "Generate Single Post" or "Generate for All Platforms"
5. Copy the generated content with built-in warnings and hashtags

### Misinformation Protection
- **High Alert**: Articles with credibility < 30% get strong warning labels
- **Medium Alert**: Articles with credibility 30-50% get caution notices
- **Low Alert**: Unverified content gets verification reminders
- **Verification Sources**: Suggests reputable sources for cross-checking

## News Sources

- Al Jazeera English
- BBC News Middle East
- Reuters Middle East
- Associated Press
- Middle East Eye
- The Guardian World News

## Fact-Checking Process

1. **Collection**: Scrape news articles from various sources
2. **Analysis**: Use Gemini AI to analyze content and claims
3. **Verification**: Cross-reference with reputable sources
4. **Scoring**: Assign credibility scores to articles
5. **Reporting**: Generate detailed fact-check reports

## License

MIT
