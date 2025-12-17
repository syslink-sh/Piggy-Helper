const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('checks bot connectivity.'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};
