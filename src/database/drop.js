const { run } = require('./db');

async function dropTables() {
    try {
        console.log('Dropping database tables and clearing all content...');

        await run('DROP TABLE IF EXISTS requests');
        await run('DROP TABLE IF EXISTS messages');

        console.log('Successfully dropped all database tables.');
        process.exit(0);
    } catch (error) {
        console.error('Error dropping database tables:', error);
        process.exit(1);
    }
}

dropTables();
