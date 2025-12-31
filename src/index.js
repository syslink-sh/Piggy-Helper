const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const config = require('./config');

if (!config.isValid()) {
    config.logStatus();
    console.error('CRITICAL ERROR: Missing required environment variables. Please check your .env file.');
    process.exit(1);
}

config.logStatus();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
client.helperAvailability = new Map();

const modulesPath = path.join(__dirname, 'modules');
const moduleFiles = fs.readdirSync(modulesPath).filter(file => file.endsWith('.js'));

for (const file of moduleFiles) {
    require(`./modules/${file}`)(client);
}

client.handleCommands();
client.handleEvents();

client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error('Failed to login to Discord:');
    console.error(err);
});