require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function probe() {
    const client = await pool.connect();
    try {
        console.log('Connected.');

        // Try to create public schema
        try {
            console.log('Attempting to create schema public...');
            await client.query('CREATE SCHEMA IF NOT EXISTS public');
            console.log('Schema public created or exists.');
        } catch (e) {
            console.log('Failed to create public schema:', e.message);
        }

        const res = await client.query('SELECT nspname FROM pg_namespace');
        console.log('Namespaces (pg_namespace):', res.rows.map(r => r.nspname));

    } catch (err) {
        console.error('Probe failed:', err.message);
    } finally {
        client.release();
        pool.end();
    }
}

probe();
