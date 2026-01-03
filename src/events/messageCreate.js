const { Events } = require('discord.js');
const db = require('../database/db');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Ignore bot messages
        if (message.author.bot) return;

        // Only log messages in ticket channels
        if (!message.channel.name.startsWith('helprequest-')) return;

        try {
            await db.run(
                'INSERT INTO messages (channel_id, channel_name, user_id, username, content) VALUES ($1, $2, $3, $4, $5)',
                [
                    message.channel.id,
                    message.channel.name,
                    message.author.id,
                    message.author.username,
                    message.content
                ]
            );
        } catch (err) {
            console.error('Failed to log message to database:', err);
        }
    },
};
