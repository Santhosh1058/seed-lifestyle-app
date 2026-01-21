const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all stock batches with current status
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
      SELECT * FROM stock_batches 
      ORDER BY arrival_date DESC
    `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new stock batch
router.post('/', async (req, res) => {
    const { supplier_name, seed_name, lot_no, arrival_date, total_packets_initial, cost_per_packet } = req.body;

    // Basic validation
    if (!supplier_name || !seed_name || !lot_no || !total_packets_initial || !cost_per_packet) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate stats (assuming 1 packet = 10g for now, can be adjusted)
    const total_weight_initial = total_packets_initial * 10;
    const total_stock_value = total_packets_initial * cost_per_packet;

    try {
        const result = await db.query(
            `INSERT INTO stock_batches 
       (supplier_name, seed_name, lot_no, arrival_date, total_packets_initial, total_weight_initial, packets_available, cost_per_packet, total_stock_value) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
            [supplier_name, seed_name, lot_no, arrival_date, total_packets_initial, total_weight_initial, total_packets_initial, cost_per_packet, total_stock_value]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'Lot number already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
