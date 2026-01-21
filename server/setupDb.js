const fs = require('fs');
const path = require('path');
require('dotenv').config();
const db = require('./db');

async function setupDatabase() {
    console.log('Starting setup...');
    const client = await db.pool.connect();

    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Running schema setup...');

        // Use single client
        await client.query('SET search_path TO public');

        // Clean slate
        await client.query('DROP TABLE IF EXISTS sales CASCADE');
        await client.query('DROP TABLE IF EXISTS expenses CASCADE');
        await client.query('DROP TABLE IF EXISTS stock_batches CASCADE');

        await client.query(schemaSql);
        console.log('Database tables created successfully.');

        // Test query
        const res = await client.query('SELECT NOW()');
        console.log('Database connection verified:', res.rows[0]);

    } catch (err) {
        console.error('CRITICAL ERROR:', err.message);
        console.error('STACK:', err.stack);
        fs.writeFileSync('debug_error.log', err.stack);
        process.exit(1);
    } finally {
        client.release();
        await db.pool.end();
    }
}

setupDatabase();
