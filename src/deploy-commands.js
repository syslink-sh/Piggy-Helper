const fs = require('node:fs');
const path = require('node:path');
const config = require('./config');
const { REST, Routes } = require('discord.js');

if (!config.isValid()) {
    config.logStatus();
    console.error('CRITICAL ERROR: Missing required environment variables. Deployment aborted.');
    process.exit(1);
}

config.logStatus();

const { token, clientId, guildId } = config;

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        if (guildId) {
            console.log(`Deploying to Guild: ${guildId}`);
            data = await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands },
            );
        } else {
            console.log('Deploying Globally (may take 1 hour to update)...');
            data = await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands },
            );
        }

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();
