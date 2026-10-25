const express = require('express');
const router = express.Router();
const db = require('../database');

// Get basic analytics (total orders, total sales today, monthly sales)
router.get('/summary', (req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    const firstDayOfMonth = today.slice(0, 8) + '01';

    let summary = {
        totalOrders: 0,
        todaySales: 0,
        monthlySales: 0
    };

    db.get("SELECT COUNT(*) as count FROM invoices", [], (err, row) => {
        if (!err && row) summary.totalOrders = row.count;

        db.get("SELECT SUM(netAmount) as total FROM invoices WHERE date(createdAt) = ?", [today], (err, row) => {
            if (!err && row && row.total) summary.todaySales = row.total;

            db.get("SELECT SUM(netAmount) as total FROM invoices WHERE date(createdAt) >= ?", [firstDayOfMonth], (err, row) => {
                if (!err && row && row.total) summary.monthlySales = row.total;

                res.json({ data: summary });
            });
        });
    });
});

module.exports = router;
