const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const modulesPath = path.join(__dirname, 'modules');
const moduleFiles = fs.readdirSync(modulesPath).filter(file => file.endsWith('.js'));

for (const file of moduleFiles) {
    require(`./modules/${file}`)(client);
}

client.handleCommands();
client.handleEvents();

client.login(process.env.DISCORD_TOKEN);

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