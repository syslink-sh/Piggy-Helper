const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('toggleavailable')
        .setDescription('Toggles your availability as a helper.'),
    async execute(interaction) {
        if (!config.helperRoleId || !interaction.member.roles.cache.has(config.helperRoleId)) {
            return interaction.reply({
                content: 'You do not have the required role to use this command.',
                flags: [MessageFlags.Ephemeral]
            });
        }

        const userId = interaction.user.id;
        const currentStatus = interaction.client.helperAvailability.get(userId) || false;
        const newStatus = !currentStatus;
        interaction.client.helperAvailability.set(userId, newStatus);

        const status = newStatus ? 'available' : 'unavailable';
        await interaction.reply({
            content: `You are now **${status}**.`,
            flags: [MessageFlags.Ephemeral]
        });
    },
};
