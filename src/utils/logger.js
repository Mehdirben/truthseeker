export const logger = {
    log: (level, message, data = null) => {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        
        console.log(logMessage);
        if (data) {
            console.log(JSON.stringify(data, null, 2));
        }
    },
    
    info: (message, data = null) => logger.log('info', message, data),
    warn: (message, data = null) => logger.log('warn', message, data),
    error: (message, data = null) => logger.log('error', message, data),
    debug: (message, data = null) => logger.log('debug', message, data)
};

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const sanitizeText = (text) => {
    if (!text) return '';
    return text
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();
};

export const extractMainContent = (text, maxLength = 3000) => {
    if (!text) return '';
    
    const sanitized = sanitizeText(text);
    if (sanitized.length <= maxLength) return sanitized;
    
    // Find a good breaking point near the limit
    const substring = sanitized.substring(0, maxLength);
    const lastSentence = substring.lastIndexOf('.');
    const lastParagraph = substring.lastIndexOf('\n\n');
    
    const breakPoint = Math.max(lastSentence, lastParagraph);
    if (breakPoint > maxLength * 0.8) {
        return sanitized.substring(0, breakPoint + 1);
    }
    
    return sanitized.substring(0, maxLength) + '...';
};

export const isValidUrl = (string) => {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
};

export const sleep = delay;
