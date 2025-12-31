const fs = require('node:fs');
const path = require('node:path');

console.log('--- Deployment Debug ---');
const paths = [
    path.join(__dirname, '.env'),
    '/etc/secrets/.env'
];

let envPath = null;
for (const p of paths) {
    console.log(`Checking for .env at: ${p}`);
    if (fs.existsSync(p)) {
        envPath = p;
        console.log(`Found .env at: ${envPath} (${fs.statSync(envPath).size} bytes)`);
        break;
    }
}

if (!envPath) {
    console.error('CRITICAL ERROR: .env file not found in any of the following locations:');
    paths.forEach(p => console.error(` - ${p}`));
    process.exit(1);
}

require('dotenv').config({ path: envPath, override: true });
const { REST, Routes } = require('discord.js');

console.log('Environment variables loaded:');
const token = (process.env.DISCORD_TOKEN || '').trim();
const clientId = (process.env.DISCORD_CLIENT_ID || '').trim();
const guildId = (process.env.DISCORD_GUILD_ID || '').trim();

console.log(`- DISCORD_TOKEN present: ${!!token}`);
if (token && token.length > 8) {
    console.log(`- DISCORD_TOKEN format: "${token.substring(0, 4)}...${token.substring(token.length - 4)}" (Length: ${token.length})`);
    if (token.includes(' ')) console.log('[WARNING] Token contains internal spaces!');
}
console.log(`- DISCORD_CLIENT_ID: "${clientId}"`);
console.log(`- DISCORD_GUILD_ID: "${guildId}"`);
console.log('-------------------------');

if (!token) {
    console.error('CRITICAL ERROR: DISCORD_TOKEN is missing or empty after trimming.');
    process.exit(1);
}

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
