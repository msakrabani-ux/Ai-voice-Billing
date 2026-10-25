const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all products
router.get('/', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// Get product by ID
router.get('/:id', (req, res) => {
    db.get("SELECT * FROM products WHERE id = ?", [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: row });
    });
});

// Create new product
router.post('/', (req, res) => {
    const { name, price, stock, category } = req.body;
    db.run(
        "INSERT INTO products (name, price, stock, category) VALUES (?, ?, ?, ?)",
        [name, price, stock, category],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ data: { id: this.lastID, name, price, stock, category } });
        }
    );
});

// Update product
router.put('/:id', (req, res) => {
    const { name, price, stock, category } = req.body;
    db.run(
        "UPDATE products SET name = ?, price = ?, stock = ?, category = ? WHERE id = ?",
        [name, price, stock, category, req.params.id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: "Product updated", changes: this.changes });
        }
    );
});

// Delete product
router.delete('/:id', (req, res) => {
    db.run("DELETE FROM products WHERE id = ?", req.params.id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Product deleted", changes: this.changes });
    });
});

module.exports = router;
