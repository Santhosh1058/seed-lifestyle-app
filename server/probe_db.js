require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function probe() {
    try {
        const client = await pool.connect();
        console.log('Connected successfully.');

        // Check current search path
        const pathRes = await client.query('SHOW search_path');
        console.log('Current search_path:', pathRes.rows[0].search_path);

        // List all schemas
        const schemaRes = await client.query('SELECT schema_name FROM information_schema.schemata');
        console.log('Available Schemas:', schemaRes.rows.map(r => r.schema_name));

        client.release();
    } catch (err) {
        console.error('Probe failed:', err.message);
    } finally {
        pool.end();
    }
}

probe();
