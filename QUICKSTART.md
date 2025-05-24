# 🚀 Quick Start Guide - Palestine News Fact-Checker AI Agent

Get your AI Agent up and running in 5 minutes!

## ⚡ Prerequisites

- Node.js 18+ installed
- Google Gemini API key ([Get one here](https://aistudio.google.com/))

## 🔧 Installation Steps

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd palestine-news-fact-checker
npm install
```

### 2. Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Start the Agent
```bash
# Development mode (recommended for first run)
npm run dev

# OR production mode
npm start
```

### 4. Access the Interface
Open your browser to: **http://localhost:3000**

## 🎯 What You'll See

### Dashboard Features
- **📊 Real-time Stats**: Articles processed, credibility scores
- **📰 Latest Analysis**: Recent fact-checked articles
- **🔍 Manual Analysis**: Paste any article URL for instant fact-checking
- **📱 Social Media Posts**: Generate platform-specific content

### How It Works
1. **Automatic Monitoring**: Scrapes news every 6 hours
2. **AI Analysis**: Uses Gemini AI to fact-check content
3. **Credibility Scoring**: Assigns 0.0-1.0 credibility ratings
4. **Social Media Ready**: Generates posts with warnings

## 🧪 Test the System

### Test Manual Analysis
1. Go to "Analyze Article" section
2. Paste any news article URL
3. Click "Analyze"
4. Review the credibility score and findings

### Test Social Media Generation
1. Navigate to "Social Media Posts"
2. Select a fact-checked article
3. Choose platform (Twitter/Facebook/LinkedIn)
4. Generate and review the content

## ⚙️ Basic Configuration

### Adjust Fact-Checking Frequency
```env
# Check for news every 3 hours instead of 6
FACT_CHECK_INTERVAL_HOURS=3
```

### Change Credibility Threshold
```env
# Only process high-credibility articles (0.8+)
CREDIBILITY_THRESHOLD=0.8
```

### Enable Debug Logging
```env
# See detailed operation logs
LOG_LEVEL=debug
```

## 🚨 Common First-Run Issues

### "Gemini API key invalid"
- Double-check your API key in `.env`
- Ensure no extra spaces or quotes
- Verify the key is active at [Google AI Studio](https://aistudio.google.com/)

### Port 3000 already in use
```env
# Change to different port
PORT=3001
```

### No articles appearing
- Wait 5 minutes for initial scraping
- Check logs for any error messages
- Verify internet connection

## 📚 Next Steps

### Enable Automatic Social Media Posting
1. Set up social media API credentials
2. Configure auto-posting in `.env`:
   ```env
   AUTO_POST_ENABLED=true
   AUTO_POST_PLATFORMS=twitter,facebook
   ```

### Monitor System Performance
- Check `/api/health` endpoint
- Review log files for errors
- Monitor memory usage

### Customize News Sources
- Edit `src/sources/sources.js`
- Add new RSS feeds in `src/sources/rss-feeds.js`

## 🆘 Need Help?

- **📖 Full Documentation**: See `README.md`
- **🐛 Issues**: Check GitHub issues
- **⚙️ Configuration**: Review `.env.example`
- **🔧 API**: Visit `/api/docs` when running

## 🎉 Success Indicators

You know it's working when you see:
- ✅ "Fact-check cycle completed" in logs
- ✅ Articles appearing in dashboard
- ✅ Credibility scores being calculated
- ✅ Social media posts being generated

---

**🚀 You're ready to combat misinformation with AI!** 