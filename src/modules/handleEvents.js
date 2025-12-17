const fs = require('node:fs');
const path = require('node:path');

module.exports = (client) => {
    client.handleEvents = async () => {
        const eventFiles = fs.readdirSync(path.join(__dirname, '../events')).filter(file => file.endsWith('.js'));
        for (const file of eventFiles) {
            const event = require(`../events/${file}`);
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
        }
    };
};
