const { Events, ActivityType } = require('discord.js');
const config = require('../config');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        client.user.setActivity('icl ts pmo fr fr u pmo so much amir', { type: ActivityType.Playing });

        if (!config.guildId) {
            console.warn('DISCORD_GUILD_ID is not defined. Guild locking is disabled.');
            return;
        }

        client.guilds.cache.forEach(guild => {
            if (guild.id !== config.guildId) {
                console.log(`Leaving unauthorized guild: ${guild.name} (${guild.id})`);
                guild.leave().catch(err => console.error(`Failed to leave guild ${guild.id}:`, err));
            }
        });
    },
};
