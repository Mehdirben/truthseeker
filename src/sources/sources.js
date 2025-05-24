export const newsSources = {
    alJazeera: {
        name: 'Al Jazeera English',
        baseUrl: 'https://www.aljazeera.com',
        rssUrl: 'https://www.aljazeera.com/xml/rss/all.xml',
        searchUrl: 'https://www.aljazeera.com/search',
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
    
    bbc: {
        name: 'BBC News',
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
        name: 'Reuters',
        baseUrl: 'https://www.reuters.com',
        rssUrl: 'https://www.reuters.com/world/middle-east',
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
        name: 'The Guardian',
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
    'palestine', 'palestinian', 'gaza', 'west bank', 'israel', 'israeli', 
    'jerusalem', 'hamas', 'fatah', 'plo', 'ramallah', 'bethlehem', 
    'hebron', 'jenin', 'nablus', 'intifada', 'occupation', 'settlement',
    'checkpoint', 'ceasefire', 'two-state', 'oslo', 'abbas', 'netanyahu'
];
