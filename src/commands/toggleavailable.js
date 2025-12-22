const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('toggleavailable')
        .setDescription('Toggles your availability as a helper.'),
    async execute(interaction) {
        const HELPERROLE = process.env.HELPERROLE;
        if (!interaction.member.roles.cache.has(HELPERROLE)) {
            return interaction.reply({ content: 'You do not have the required role to use this command.', flags: [MessageFlags.Ephemeral] });
        }

        const userId = interaction.user.id;
        const currentStatus = interaction.client.helperAvailability.get(userId) || false;
        const newStatus = !currentStatus;
        interaction.client.helperAvailability.set(userId, newStatus);

        const status = newStatus ? 'available' : 'unavailable';
        await interaction.reply({ content: `You are now **${status}**.`, flags: [MessageFlags.Ephemeral] });
    },
};
