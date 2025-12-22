const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        const GUILD_ID = process.env.DISCORD_GUILD_ID;

        if (GUILD_ID && guild.id !== GUILD_ID) {
            console.log(`Joined unauthorized guild: ${guild.name} (${guild.id}). Leaving...`);
            await guild.leave().catch(err => console.error(`Failed to leave guild ${guild.id}:`, err));
        }
    },
};
