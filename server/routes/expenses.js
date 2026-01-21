const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all expenses
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM expenses ORDER BY expense_date DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Log new expense
router.post('/', async (req, res) => {
    const { category, amount, description } = req.body;

    if (!category || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await db.query(
            'INSERT INTO expenses (category, amount, description) VALUES ($1, $2, $3) RETURNING *',
            [category, amount, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
