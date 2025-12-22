const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('availablehelpers')
        .setDescription('Shows a list of currently available helpers.'),
    async execute(interaction) {
        const availableHelpers = Array.from(interaction.client.helperAvailability.entries())
            .filter(([id, status]) => status === true);

        if (availableHelpers.length === 0) {
            return interaction.reply({ content: 'No helpers are currently available.', flags: [MessageFlags.Ephemeral] });
        }

        const embed = new EmbedBuilder()
            .setTitle('Available Helpers')
            .setColor('#FF69B4')
            .setTimestamp();

        let helperList = '';
        for (const [id] of availableHelpers) {
            try {
                const member = await interaction.guild.members.fetch(id).catch(() => null);
                if (member) {
                    const displayName = member.user.globalName || member.user.username;
                    helperList += `• ${displayName} (${member.user.username})\n`;
                }
            } catch (error) {
                console.error(`Could not fetch user ${id}:`, error);
            }
        }

        embed.setDescription(helperList || 'No helpers are currently available.');

        await interaction.reply({ embeds: [embed] });
    },
};
