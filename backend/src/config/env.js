const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

const parseList = value => {
    return String(value || '')
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
};

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const frontendUrls = [...new Set([frontendUrl, ...parseList(process.env.FRONTEND_URLS)])];

const env = {
    port: process.env.PORT || 3000,
    frontendUrl,
    frontendUrls,
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        name: process.env.DB_NAME || 'beaverup',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || ''
    },
    ai: {
        provider: process.env.AI_PROVIDER || 'openai',
        apiKey: process.env.AI_API_KEY || '',
        model: process.env.AI_MODEL || 'gpt-4o-mini',
        maxOutputTokens: Number(process.env.AI_MAX_OUTPUT_TOKENS || 500)
    }
};

module.exports = env;
