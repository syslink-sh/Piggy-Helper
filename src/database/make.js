const { run } = require('./db');

async function makeTables() {
    try {
        console.log('Creating database tables...');

        await run(`
            CREATE TABLE IF NOT EXISTS requests (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL,
                display_name TEXT,
                username TEXT,
                piggy_skin TEXT,
                roblox_username TEXT,
                timezone TEXT,
                notes TEXT,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                accepted_by TEXT,
                accepted_at TIMESTAMP
            )
        `);

        await run(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                channel_id TEXT NOT NULL,
                channel_name TEXT,
                user_id TEXT NOT NULL,
                username TEXT,
                content TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Successfully created database tables.');
        process.exit(0);
    } catch (error) {
        console.error('Error creating database tables:', error);
        process.exit(1);
    }
}

makeTables();
