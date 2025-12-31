const { Events } = require('discord.js');
const config = require('../config');

module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        if (config.guildId && guild.id !== config.guildId) {
            console.log(`Joined unauthorized guild: ${guild.name} (${guild.id}). Leaving...`);
            await guild.leave().catch(err => console.error(`Failed to leave guild ${guild.id}:`, err));
        }
    },
};
