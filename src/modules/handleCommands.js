const fs = require('node:fs');
const path = require('node:path');

module.exports = (client) => {
    client.handleCommands = async () => {
        const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`../commands/${file}`);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${file} is missing a required "data" or "execute" property.`);
            }
        }
    };
};
