const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('availablehelpers')
        .setDescription('Shows a list of currently available helpers.'),
    async execute(interaction) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] }).catch(() => null);

        const availableHelpers = Array.from(interaction.client.helperAvailability.entries())
            .filter(([id, status]) => status === true);

        if (availableHelpers.length === 0) {
            return interaction.editReply({ content: 'No helpers are currently available.' });
        }

        const embed = new EmbedBuilder()
            .setTitle('Available Helpers')
            .setColor('#FF69B4')
            .setTimestamp();

        let helperList = '';
        try {
            const helperIds = availableHelpers.map(([id]) => id);
            const members = await interaction.guild.members.fetch({ user: helperIds });

            for (const [id, member] of members) {
                const displayName = member.user.globalName || member.user.username;
                helperList += `• ${displayName} (${member.user.username})\n`;
            }
        } catch (error) {
            console.error('Error batch fetching helpers:', error);
            helperList = 'Error loading helpers list.';
        }

        embed.setDescription(helperList || 'No helpers are currently available.');

        await interaction.editReply({ embeds: [embed] });
    },
};
