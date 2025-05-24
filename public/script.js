// Global variables
let factCheckResults = [];
let currentTab = 'news';
let isLoading = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadLatestNews();
    updateDashboard();
    
    // Auto-refresh news every 5 minutes
    setInterval(loadLatestNews, 5 * 60 * 1000);
});

function initializeEventListeners() {
    // Tab navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Refresh news button
    document.getElementById('refreshNews').addEventListener('click', () => {
        loadLatestNews(true); // Force refresh
    });

    // Analysis form
    document.getElementById('analyzeBtn').addEventListener('click', analyzeArticle);

    // Social media generation
    document.getElementById('generateSocialBtn').addEventListener('click', generateSocialPosts);

    // Filters
    document.getElementById('sourceFilter').addEventListener('change', filterNews);
    document.getElementById('credibilityFilter').addEventListener('change', filterNews);

    // Auto-fill title when URL is entered
    document.getElementById('articleUrl').addEventListener('blur', autoFillTitle);
}

async function loadLatestNews(forceRefresh = false) {
    if (isLoading && !forceRefresh) return;
    
    const refreshBtn = document.getElementById('refreshNews');
    const originalText = refreshBtn.innerHTML;
    
    try {
        isLoading = true;
        refreshBtn.innerHTML = '🔄 Loading...';
        refreshBtn.disabled = true;

        // If force refresh, trigger server refresh first
        if (forceRefresh) {
            showNotification('🔄 Triggering fresh news analysis...', 'info');
            await fetch('/api/trigger-fact-check', { method: 'POST' });
            // Wait a moment for processing
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // Get the latest fact-checked articles
        const response = await fetch('/api/fact-check?limit=20');
        if (!response.ok) throw new Error('Failed to fetch news');

        const data = await response.json();
        factCheckResults = data.results || [];

        displayNews(factCheckResults);
        updateStats();
        updateLastUpdated();
        
        if (forceRefresh) {
            showNotification(`✅ Refreshed! Found ${factCheckResults.length} recent Palestine articles`, 'success');
        }

    } catch (error) {
        console.error('Error loading news:', error);
        showNotification('❌ Failed to load latest news. Please try again.', 'error');
        document.getElementById('newsContainer').innerHTML = `
            <div class="error-state">
                <h3>🚫 Unable to Load News</h3>
                <p>There was an error fetching the latest Palestine news. This could be due to:</p>
                <ul>
                    <li>Network connectivity issues</li>
                    <li>RSS feeds being temporarily unavailable</li>
                    <li>The fact-checking system being under high load</li>
                </ul>
                <button onclick="loadLatestNews(true)" class="btn btn-primary">🔄 Try Again</button>
            </div>
        `;
    } finally {
        isLoading = false;
        refreshBtn.innerHTML = originalText;
        refreshBtn.disabled = false;
    }
}

function displayNews(articles) {
    const container = document.getElementById('newsContainer');
    
    if (!articles || articles.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>📰 No Recent Palestine News</h3>
                <p>No recent Palestine/Gaza articles have been analyzed yet.</p>
                <div class="empty-actions">
                    <button onclick="loadLatestNews(true)" class="btn btn-primary">🔄 Refresh News</button>
                    <p><small>The system automatically checks for news every 2 hours</small></p>
                </div>
            </div>
        `;
        return;
    }

    const newsHTML = articles.map((result, index) => {
        const analysis = result.analysis || {};
        const credibility = Math.round((analysis.credibilityScore || 0) * 100);
        const assessment = analysis.overallAssessment || 'UNVERIFIED';
        const timeAgo = getTimeAgo(result.processedAt || result.publishedAt);
        
        // Determine credibility class and warning
        let credibilityClass = 'low';
        let warningLevel = '';
        let warningText = '';
        
        if (credibility >= 70) {
            credibilityClass = 'high';
        } else if (credibility >= 40) {
            credibilityClass = 'medium';
        } else {
            credibilityClass = 'low';
        }

        // Add warning for low credibility
        if (assessment === 'MISLEADING' || credibility < 30) {
            warningLevel = '🚨 HIGH RISK';
            warningText = 'This content has been flagged as potentially misleading. Please verify with multiple sources.';
        } else if (assessment === 'DISPUTED' || credibility < 50) {
            warningLevel = '⚠️ CAUTION';
            warningText = 'This content contains disputed information. Cross-reference with trusted sources.';
        } else if (credibility < 70) {
            warningLevel = '📋 VERIFY';
            warningText = 'This information requires verification. Always check multiple sources.';
        }

        const keyFindings = analysis.keyFindings || [];
        const redFlags = analysis.redFlags || [];

        return `
            <div class="news-card ${credibilityClass}">
                <div class="news-header">
                    <h3 class="news-title">
                        <a href="${result.url || result.articleUrl}" target="_blank" rel="noopener">
                            ${result.title || result.articleTitle}
                        </a>
                    </h3>
                    <div class="news-meta">
                        <span class="source">${result.source || result.articleSource}</span>
                        <span class="time">${timeAgo}</span>
                    </div>
                </div>

                <div class="credibility-bar">
                    <div class="credibility-score ${credibilityClass}">
                        <span class="score">${credibility}%</span>
                        <span class="label">Credibility</span>
                    </div>
                    <div class="assessment ${assessment.toLowerCase()}">
                        ${assessment}
                    </div>
                </div>

                ${warningLevel ? `
                    <div class="warning-banner ${credibilityClass}">
                        <strong>${warningLevel}</strong>
                        <p>${warningText}</p>
                    </div>
                ` : ''}

                ${keyFindings.length > 0 ? `
                    <div class="findings-section">
                        <h4>🔍 Key Findings:</h4>
                        <ul class="findings-list">
                            ${keyFindings.slice(0, 3).map(finding => `
                                <li class="finding-item ${finding.verification?.toLowerCase() || 'unverified'}">
                                    <span class="claim">${finding.claim}</span>
                                    <span class="verification">${finding.verification || 'UNVERIFIED'}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}

                ${redFlags.length > 0 ? `
                    <div class="red-flags-section">
                        <h4>🚩 Concerns:</h4>
                        <ul class="red-flags-list">
                            ${redFlags.slice(0, 2).map(flag => `<li>${flag}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                <div class="news-actions">
                    <button onclick="generateQuickPost(${index})" class="btn btn-secondary btn-sm">
                        📱 Quick Post
                    </button>
                    <button onclick="showFullAnalysis(${index})" class="btn btn-outline btn-sm">
                        📊 Full Analysis
                    </button>
                    <a href="${result.url || result.articleUrl}" target="_blank" class="btn btn-outline btn-sm">
                        🔗 Read Original
                    </a>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = newsHTML;
}

function updateStats() {
    const total = factCheckResults.length;
    const verified = factCheckResults.filter(r => 
        (r.analysis?.overallAssessment || r.overallAssessment) === 'VERIFIED'
    ).length;
    const highRisk = factCheckResults.filter(r => 
        (r.analysis?.credibilityScore || r.credibilityScore || 0) < 0.3
    ).length;
    const avgCredibility = total > 0 ? 
        Math.round(factCheckResults.reduce((sum, r) => 
            sum + (r.analysis?.credibilityScore || r.credibilityScore || 0), 0
        ) / total * 100) : 0;

    document.getElementById('totalArticles').textContent = total;
    document.getElementById('verifiedCount').textContent = verified;
    document.getElementById('highRiskCount').textContent = highRisk;
    document.getElementById('avgCredibility').textContent = `${avgCredibility}%`;
}

function updateLastUpdated() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('lastUpdated').textContent = `Last updated: ${timeString}`;
}

// ... existing functions for tab switching, article analysis, etc.

function filterNews() {
    const sourceFilter = document.getElementById('sourceFilter').value;
    const credibilityFilter = document.getElementById('credibilityFilter').value;
    
    let filteredResults = [...factCheckResults];
    
    if (sourceFilter) {
        filteredResults = filteredResults.filter(result => 
            (result.source || result.articleSource || '').includes(sourceFilter)
        );
    }
    
    if (credibilityFilter) {
        filteredResults = filteredResults.filter(result => {
            const credibility = (result.analysis?.credibilityScore || result.credibilityScore || 0) * 100;
            switch (credibilityFilter) {
                case 'high': return credibility >= 70;
                case 'medium': return credibility >= 40 && credibility < 70;
                case 'low': return credibility < 40;
                default: return true;
            }
        });
    }
    
    displayNews(filteredResults);
}

function generateQuickPost(index) {
    const article = factCheckResults[index];
    // Switch to social media tab and pre-fill with this article
    switchTab('social');
    
    // Populate the social media form
    const select = document.getElementById('socialArticle');
    if (select) {
        // Add option if not exists
        const optionExists = Array.from(select.options).some(option => option.value == index);
        if (!optionExists) {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${article.title || article.articleTitle} (${article.source || article.articleSource})`;
            select.appendChild(option);
        }
        select.value = index;
    }
}

function showFullAnalysis(index) {
    const result = factCheckResults[index];
    const analysis = result.analysis || {};
    
    // Create modal or expand view with full analysis
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>📊 Full Analysis Report</h2>
                <button onclick="this.closest('.modal-overlay').remove()" class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <h3>${result.title || result.articleTitle}</h3>
                <p><strong>Source:</strong> ${result.source || result.articleSource}</p>
                <p><strong>Credibility Score:</strong> ${Math.round((analysis.credibilityScore || 0) * 100)}%</p>
                <p><strong>Assessment:</strong> ${analysis.overallAssessment || 'UNVERIFIED'}</p>
                
                ${analysis.keyFindings?.length ? `
                    <h4>🔍 Detailed Findings:</h4>
                    <ul>
                        ${analysis.keyFindings.map(finding => `
                            <li>
                                <strong>${finding.claim}</strong><br>
                                Status: ${finding.verification || 'UNVERIFIED'}<br>
                                ${finding.sources?.length ? `Sources: ${finding.sources.join(', ')}` : ''}
                            </li>
                        `).join('')}
                    </ul>
                ` : ''}
                
                ${analysis.redFlags?.length ? `
                    <h4>🚩 Red Flags:</h4>
                    <ul>
                        ${analysis.redFlags.map(flag => `<li>${flag}</li>`).join('')}
                    </ul>
                ` : ''}
                
                <p><strong>Processing Time:</strong> ${analysis.processingTime || 'N/A'}</p>
                <p><strong>Processed At:</strong> ${new Date(result.processedAt).toLocaleString()}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function getTimeAgo(dateString) {
    if (!dateString) return 'Unknown time';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

// ... rest of existing functions ... 