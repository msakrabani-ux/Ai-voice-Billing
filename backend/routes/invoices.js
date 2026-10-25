const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all invoices
router.get('/', (req, res) => {
    db.all("SELECT * FROM invoices ORDER BY createdAt DESC", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// Get invoice by ID with items
router.get('/:id', (req, res) => {
    db.get("SELECT * FROM invoices WHERE id = ?", [req.params.id], (err, invoice) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!invoice) {
            res.status(404).json({ error: "Invoice not found" });
            return;
        }
        
        db.all("SELECT * FROM invoice_items WHERE invoiceId = ?", [req.params.id], (err, items) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            invoice.items = items;
            res.json({ data: invoice });
        });
    });
});

// Create new invoice
router.post('/', (req, res) => {
    const { totalAmount, gstAmount, netAmount, paymentMode, items } = req.body;
    
    // Generate Invoice Number (e.g. INV-20260511-1234)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${dateStr}-${randomNum}`;

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        db.run(
            "INSERT INTO invoices (invoiceNumber, totalAmount, gstAmount, netAmount, paymentMode) VALUES (?, ?, ?, ?, ?)",
            [invoiceNumber, totalAmount, gstAmount, netAmount, paymentMode],
            function(err) {
                if (err) {
                    db.run("ROLLBACK");
                    res.status(500).json({ error: err.message });
                    return;
                }
                const invoiceId = this.lastID;
                
                const stmt = db.prepare("INSERT INTO invoice_items (invoiceId, productId, productName, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?)");
                
                let hasError = false;
                
                // Update product stock and insert items
                items.forEach(item => {
                    stmt.run(invoiceId, item.productId, item.productName, item.qty, item.price, item.qty * item.price, (itemErr) => {
                        if (itemErr) {
                            hasError = true;
                            console.error("Item insert error:", itemErr);
                        }
                    });
                    
                    // Deduct stock if productId exists
                    if (item.productId) {
                        db.run("UPDATE products SET stock = stock - ? WHERE id = ?", [item.qty, item.productId]);
                    }
                });

                stmt.finalize((finalizeErr) => {
                    if (hasError || finalizeErr) {
                        db.run("ROLLBACK");
                        res.status(500).json({ error: "Error inserting invoice items" });
                    } else {
                        db.run("COMMIT");
                        res.json({ 
                            message: "Invoice created successfully", 
                            data: { id: invoiceId, invoiceNumber, totalAmount, netAmount } 
                        });
                    }
                });
            }
        );
    });
});

module.exports = router;
