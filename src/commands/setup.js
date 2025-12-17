const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Deploys the help request panel.'),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }
        const channel = interaction.channel;

        const embed = new EmbedBuilder()
            .setTitle('Piggy Helper Request')
            .setDescription('If you require assistance, please click the button below to submit a request.')
            .setColor('#FF69B4');

        const setupButton = new ButtonBuilder()
            .setCustomId('request_help')
            .setLabel('Request Help')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(setupButton);

        await channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: 'Help panel deployed successfully.', flags: [MessageFlags.Ephemeral] });
    },
};
