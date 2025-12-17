const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('closerequest')
        .setDescription('Closes the current help request ticket.'),
    async execute(interaction) {

        if (!interaction.channel.name.startsWith('helprequest-')) {
            return interaction.reply({ content: 'This command can only be used in help request channels.', flags: [MessageFlags.Ephemeral] });
        }


        let requester = null;
        let helper = null;

        if (interaction.channel.topic && interaction.channel.topic.includes('ID:')) {
            const idLine = interaction.channel.topic.split('\n').find(line => line.startsWith('ID:'));
            if (idLine) {
                const ids = idLine.replace('ID: ', '').split('/');
                requester = ids[0];
                helper = ids[1];
            }
        }

        if (interaction.user.id !== requester && interaction.user.id !== helper) {
            return interaction.reply({ content: 'You are not authorized to close this request.', flags: [MessageFlags.Ephemeral] });
        }

        const confirmButton = new ButtonBuilder()
            .setCustomId('confirm_close')
            .setLabel('Confirm Close')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(confirmButton);

        await interaction.reply({ content: 'Are you sure you want to close this help request?', components: [row], flags: [MessageFlags.Ephemeral] });
    },
};
