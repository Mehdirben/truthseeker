export const newsSources = {
    alJazeera: {
        name: 'Al Jazeera English',
        baseUrl: 'https://www.aljazeera.com',
        rssUrl: 'https://www.aljazeera.com/xml/rss/all.xml',
        palestineUrl: 'https://www.aljazeera.com/where/palestine/',
        searchUrl: 'https://www.aljazeera.com/search?q=palestine',
        credibilityScore: 0.9,
        bias: 'slight-left',
        isReputable: true,
        selectors: {
            title: 'h1',
            content: '.wysiwyg',
            date: 'time',
            author: '.article-author'
        }
    },
    
    alJazeeraPalestine: {
        name: 'Al Jazeera Palestine',
        baseUrl: 'https://www.aljazeera.com',
        rssUrl: 'https://www.aljazeera.com/where/palestine/rss.xml',
        credibilityScore: 0.9,
        bias: 'slight-left',
        isReputable: true,
        category: 'palestine-specific',
        selectors: {
            title: 'h1',
            content: '.wysiwyg',
            date: 'time',
            author: '.article-author'
        }
    },
    
    bbc: {
        name: 'BBC News Middle East',
        baseUrl: 'https://www.bbc.com',
        rssUrl: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml',
        credibilityScore: 0.95,
        bias: 'center-left',
        isReputable: true,
        selectors: {
            title: '[data-component="headline"]',
            content: '[data-component="text-block"]',
            date: 'time',
            author: '.ssrcss-68pt20-Text-TextContributorName'
        }
    },
    
    reuters: {
        name: 'Reuters Middle East',
        baseUrl: 'https://www.reuters.com',
        rssUrl: 'https://www.reuters.com/arc/outboundfeeds/rss/category/world/middle-east/',
        credibilityScore: 0.95,
        bias: 'center',
        isReputable: true,
        selectors: {
            title: '[data-testid="Heading"]',
            content: '[data-component="ArticleBody"]',
            date: 'time',
            author: '[data-module="ArticleByline"]'
        }
    },
    
    ap: {
        name: 'Associated Press',
        baseUrl: 'https://apnews.com',
        rssUrl: 'https://apnews.com/index.rss',
        searchUrl: 'https://apnews.com/hub/israel-palestinians',
        credibilityScore: 0.93,
        bias: 'center',
        isReputable: true,
        selectors: {
            title: 'h1',
            content: '.RichTextStoryBody',
            date: '[data-key="timestamp"]',
            author: '.Component-bylines'
        }
    },
    
    apMiddleEast: {
        name: 'AP Middle East',
        baseUrl: 'https://apnews.com',
        rssUrl: 'https://apnews.com/hub/middle-east/feed',
        credibilityScore: 0.93,
        bias: 'center',
        isReputable: true,
        category: 'middle-east',
        selectors: {
            title: 'h1',
            content: '.RichTextStoryBody',
            date: '[data-key="timestamp"]',
            author: '.Component-bylines'
        }
    },
    
    middleEastEye: {
        name: 'Middle East Eye',
        baseUrl: 'https://www.middleeasteye.net',
        rssUrl: 'https://www.middleeasteye.net/rss.xml',
        credibilityScore: 0.8,
        bias: 'left',
        isReputable: true,
        selectors: {
            title: 'h1.article-title',
            content: '.field-body',
            date: '.date-published',
            author: '.author-name'
        }
    },
    
    guardian: {
        name: 'The Guardian World',
        baseUrl: 'https://www.theguardian.com',
        rssUrl: 'https://www.theguardian.com/world/rss',
        credibilityScore: 0.85,
        bias: 'left',
        isReputable: true,
        selectors: {
            title: '[data-gu-name="headline"]',
            content: '.dcr-1eu861s',
            date: 'time',
            author: '[data-gu-name="meta"]'
        }
    },
    
    guardianIsraelPalestine: {
        name: 'The Guardian Israel-Palestine',
        baseUrl: 'https://www.theguardian.com',
        rssUrl: 'https://www.theguardian.com/world/israel-and-the-palestinians/rss',
        credibilityScore: 0.85,
        bias: 'left',
        isReputable: true,
        category: 'palestine-specific',
        selectors: {
            title: '[data-gu-name="headline"]',
            content: '.dcr-1eu861s',
            date: 'time',
            author: '[data-gu-name="meta"]'
        }
    },
    
    timesOfIsrael: {
        name: 'Times of Israel',
        baseUrl: 'https://www.timesofisrael.com',
        rssUrl: 'https://www.timesofisrael.com/feed/',
        credibilityScore: 0.8,
        bias: 'center-right',
        isReputable: true,
        perspective: 'israeli',
        selectors: {
            title: 'h1',
            content: '.entry-content',
            date: '.entry-date',
            author: '.entry-author'
        }
    },
    
    haaretz: {
        name: 'Haaretz',
        baseUrl: 'https://www.haaretz.com',
        rssUrl: 'https://www.haaretz.com/cmlink/1.628752',
        credibilityScore: 0.85,
        bias: 'center-left',
        isReputable: true,
        perspective: 'israeli',
        selectors: {
            title: 'h1',
            content: '.article-body',
            date: '.article-date',
            author: '.article-author'
        }
    },
    
    hespress: {
        name: 'HesPress',
        baseUrl: 'https://www.hespress.com',
        rssUrl: 'https://www.hespress.com/rss',
        credibilityScore: 0.8,
        bias: 'center-left',
        isReputable: true,
        category: 'regional',
        country: 'Morocco',
        language: 'Arabic/French',
        selectors: {
            title: 'h1.article-title',
            content: '.article-content',
            date: '.article-date',
            author: '.article-author'
        }
    },
    
    palestineChronicle: {
        name: 'Palestine Chronicle',
        baseUrl: 'https://www.palestinechronicle.com',
        rssUrl: 'https://www.palestinechronicle.com/feed/',
        credibilityScore: 0.85,
        bias: 'pro-palestine',
        isReputable: true,
        category: 'palestinian',
        perspective: 'palestinian',
        selectors: {
            title: 'h1.entry-title',
            content: '.entry-content',
            date: '.entry-date',
            author: '.entry-author'
        }
    },
    
    maanNews: {
        name: 'Maan News Agency',
        baseUrl: 'https://www.maannews.com',
        rssUrl: 'https://www.maannews.net/rss.xml',
        credibilityScore: 0.8,
        bias: 'pro-palestine',
        isReputable: true,
        category: 'palestinian',
        perspective: 'palestinian',
        selectors: {
            title: 'h1',
            content: '.content',
            date: '.date',
            author: '.author'
        }
    },

    // Additional Breaking News Sources
    cnn: {
        name: 'CNN Middle East',
        baseUrl: 'https://www.cnn.com',
        rssUrl: 'http://rss.cnn.com/rss/edition_meast.rss',
        credibilityScore: 0.8,
        bias: 'center-left',
        isReputable: true,
        selectors: {
            title: 'h1',
            content: '.zn-body__paragraph',
            date: '.update-time',
            author: '.byline'
        }
    },

    nytimes: {
        name: 'New York Times Middle East',
        baseUrl: 'https://www.nytimes.com',
        rssUrl: 'https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml',
        credibilityScore: 0.9,
        bias: 'center-left',
        isReputable: true,
        selectors: {
            title: 'h1',
            content: '.StoryBodyCompanionColumn',
            date: 'time',
            author: '.css-1baulvz'
        }
    },

    washingtonPost: {
        name: 'Washington Post Middle East',
        baseUrl: 'https://www.washingtonpost.com',
        rssUrl: 'https://feeds.washingtonpost.com/rss/world?itid=lk_inline_manual_36',
        credibilityScore: 0.9,
        bias: 'center-left',
        isReputable: true,
        selectors: {
            title: 'h1',
            content: '.article-body',
            date: 'time',
            author: '.author'
        }
    },
    
    // Social Media Verification Sources
    socialMediaSources: {
        name: 'Social Media Verification',
        category: 'citizen_journalism',
        platforms: [
            'Twitter/X verified accounts',
            'Instagram eyewitness content',
            'TikTok ground reports',
            'Telegram channels',
            'Facebook verified pages'
        ],
        credibilityScore: 0.75,
        bias: 'varied',
        isReputable: true,
        verificationMethods: [
            'Cross-reference multiple accounts',
            'Geolocation verification',
            'Timestamp analysis',
            'User history verification',
            'Content authenticity checks'
        ]
    },
    
    citizenJournalism: {
        name: 'Citizen Journalism Networks',
        category: 'ground_truth',
        sources: [
            'Local photographers',
            'Independent journalists',
            'Eyewitness accounts',
            'Community reporters',
            'Human rights activists'
        ],
        credibilityScore: 0.8,
        bias: 'ground_truth',
        isReputable: true,
        verificationApproach: 'cross_reference_multiple_witnesses'
    }
};

export const palestineKeywords = [
    // Core Palestine/Israel terms
    'palestine', 'palestinian', 'gaza', 'west bank', 'israel', 'israeli', 
    'jerusalem', 'hamas', 'fatah', 'plo', 'ramallah', 'bethlehem', 
    'hebron', 'jenin', 'nablus', 'intifada', 'occupation', 'settlement',
    'checkpoint', 'ceasefire', 'two-state', 'oslo', 'abbas', 'netanyahu',
    
    // Gaza-specific terms
    'gaza strip', 'khan younis', 'rafah', 'jabalia', 'al-shifa', 
    'nasser hospital', 'unrwa', 'iron dome', 'qassam', 'tunnel',
    
    // West Bank terms
    'al-aqsa', 'temple mount', 'dome of the rock', 'settler', 'idf',
    'barrier', 'wall', 'apartheid', 'blockade', 'siege',
    
    // Recent conflict terms
    'hostage', 'captive', 'prisoner exchange', 'humanitarian aid',
    'war crimes', 'genocide', 'ethnic cleansing', 'displacement',
    'refugee camp', 'aid convoy', 'medical facility', 'school strike',
    
    // Regional players
    'hezbollah', 'iran', 'syria', 'lebanon', 'jordan', 'egypt',
    'saudi arabia', 'uae', 'qatar', 'turkey', 'united nations',
    
    // Current events
    'ceasefire negotiations', 'humanitarian corridor', 'evacuation',
    'ground invasion', 'air strike', 'rocket attack', 'incursion'
];

// High-priority sources for latest breaking news
export const prioritySources = [
    'alJazeera', 
    'alJazeeraPalestine',
    'bbc', 
    'reuters', 
    'ap',
    'apMiddleEast',
    'guardianIsraelPalestine',
    'palestineChronicle'
];

// Additional RSS feeds for real-time updates
export const additionalFeeds = [
    {
        name: 'Al Jazeera Live Blog',
        url: 'https://www.aljazeera.com/news/liveblog/rss.xml',
        type: 'live-updates'
    },
    {
        name: 'Reuters Middle East Breaking',
        url: 'https://www.reuters.com/arc/outboundfeeds/rss/category/breakingviews/',
        type: 'breaking-news'
    },
    {
        name: 'AP Breaking News',
        url: 'https://apnews.com/apf-topnews',
        type: 'breaking-news'
    }
];
