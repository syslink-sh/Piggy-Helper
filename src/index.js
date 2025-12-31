const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
console.log('--- Startup Debug ---');
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
    console.error('Please ensure the .env file exists and the bot has permission to read it.');
    process.exit(1);
}

const result = require('dotenv').config({ path: envPath, override: true });
if (result.error) {
    console.error('Dotenv Error:', result.error);
    process.exit(1);
}

console.log('Environment variables loaded successfully.');
const token = process.env.DISCORD_TOKEN;
console.log(`- DISCORD_TOKEN present: ${!!token}`);
if (token && token.length > 8) {
    console.log(`- DISCORD_TOKEN format: ${token.substring(0, 4)}...${token.substring(token.length - 4)}`);
}
console.log(`- DISCORD_CLIENT_ID present: ${!!process.env.DISCORD_CLIENT_ID}`);
console.log(`- DISCORD_GUILD_ID present: ${!!process.env.DISCORD_GUILD_ID}`);
console.log(`- PORT: ${process.env.PORT || 'using default 3000'}`);
console.log('---------------------');

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

const express = require("express");
const http = require("http");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).send("icl ts pmo fr fr u pmo");
});

const httpServer = http.createServer(app);

httpServer.listen(PORT, () => {
    console.log(`HTTP Server started on port ${PORT}`);
});