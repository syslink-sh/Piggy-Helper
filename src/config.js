const path = require('node:path');
const dotenv = require('dotenv');

// Load environment variables from .env file in the root directory
dotenv.config();

/**
 * Centralized configuration and environment variable management.
 * This ensures all parts of the bot use validated and trimmed values.
 */
module.exports = {
    // Core Discord Configuration
    token: (process.env.DISCORD_TOKEN || '').trim(),
    clientId: (process.env.DISCORD_CLIENT_ID || '').trim(),
    guildId: (process.env.DISCORD_GUILD_ID || '').trim(),

    // Channel and Category IDs
    requestsChannelId: (process.env.REQUESTS_CHANNEL_ID || '').trim(),
    categoryId: (process.env.CATEGORY_ID || '').trim(),
    logChannelId: (process.env.LOG_CHANNEL_ID || '').trim(),

    // Role IDs
    helperRoleId: (process.env.HELPERROLE || '').trim(),

    // Server Configuration
    port: process.env.PORT || 3000,

    /**
     * Helper to validate that all required variables are present.
     * @returns {boolean}
     */
    isValid() {
        return !!(this.token && this.clientId && this.guildId);
    },

    /**
     * Professional startup log for configuration status.
     */
    logStatus() {
        console.log('--- Bot Configuration ---');
        console.log(`- Token: ${this.token ? 'Loaded (✓)' : 'MISSING (✗)'}`);
        console.log(`- Client ID: ${this.clientId ? 'Loaded (✓)' : 'MISSING (✗)'}`);
        console.log(`- Guild ID: ${this.guildId ? 'Loaded (✓)' : 'MISSING (✗)'}`);
        console.log(`- Port: ${this.port}`);
        console.log('-------------------------');
    }
};
