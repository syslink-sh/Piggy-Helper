const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        client.user.setActivity('Helping People !', { type: ActivityType.Playing });

        const GUILD_ID = process.env.DISCORD_GUILD_ID;
        if (!GUILD_ID) {
            console.warn('DISCORD_GUILD_ID is not defined in .env. Guild locking is disabled.');
            return;
        }

        client.guilds.cache.forEach(guild => {
            if (guild.id !== GUILD_ID) {
                console.log(`Leaving unauthorized guild: ${guild.name} (${guild.id})`);
                guild.leave().catch(err => console.error(`Failed to leave guild ${guild.id}:`, err));
            }
        });
    },
};
