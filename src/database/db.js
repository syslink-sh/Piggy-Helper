const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
    connectionString: config.postgresUrl,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client:', err);
});

/**
 * Run a SQL query that doesn't return results (INSERT, UPDATE, DELETE).
 * Wrapped to maintain compatibility with SQLite-style code.
 */
async function run(sql, params = []) {
    // SQLite's run returns an object with 'lastID' and 'changes'.
    // pg's query returns an object with 'rowCount' and 'rows'.
    const result = await pool.query(sql, params);
    return { changes: result.rowCount };
}

/**
 * Run a SQL query that returns multiple rows.
 */
async function all(sql, params = []) {
    const result = await pool.query(sql, params);
    return result.rows;
}

/**
 * Run a SQL query that returns a single row.
 */
async function get(sql, params = []) {
    const result = await pool.query(sql, params);
    return result.rows[0];
}

module.exports = {
    pool,
    run,
    all,
    get
};
