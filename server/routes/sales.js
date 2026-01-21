const express = require('express');
const router = express.Router();
const db = require('../db');

// Log a sale
router.post('/', async (req, res) => {
    const { customer_name, stock_batch_id, packets_sold, amount_paid } = req.body;

    if (!customer_name || !stock_batch_id || !packets_sold || !amount_paid) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Get current stock
        const stockRes = await client.query('SELECT * FROM stock_batches WHERE id = $1 FOR UPDATE', [stock_batch_id]);
        if (stockRes.rows.length === 0) {
            throw new Error('Stock batch not found');
        }
        const stock = stockRes.rows[0];

        // 2. Check availability
        if (stock.packets_available < packets_sold) {
            throw new Error('Insufficient stock available');
        }

        // 3. Calculate profit
        // Profit = Amount Paid - (Cost Per Packet * Packets Sold)
        const cost_price = Number(stock.cost_per_packet) * packets_sold;
        const profit = Number(amount_paid) - cost_price;

        // 4. Insert Sale
        const saleRes = await client.query(
            `INSERT INTO sales (customer_name, stock_batch_id, packets_sold, amount_paid, profit) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [customer_name, stock_batch_id, packets_sold, amount_paid, profit]
        );

        // 5. Update Stock
        await client.query(
            `UPDATE stock_batches 
       SET packets_available = packets_available - $1 
       WHERE id = $2`,
            [packets_sold, stock_batch_id]
        );

        await client.query('COMMIT');
        res.status(201).json(saleRes.rows[0]);

    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// Get recent sales
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
      SELECT s.*, sb.seed_name, sb.lot_no 
      FROM sales s
      JOIN stock_batches sb ON s.stock_batch_id = sb.id
      ORDER BY s.sale_date DESC
      LIMIT 50
    `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
