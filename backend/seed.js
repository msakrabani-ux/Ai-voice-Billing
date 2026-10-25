const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'ms_sakra.db');
const db = new sqlite3.Database(dbPath);

const defaultProducts = [
    { name: 'Apple', price: 120, stock: 50, category: 'Fruits' },
    { name: 'Banana', price: 60, stock: 100, category: 'Fruits' },
    { name: 'Orange', price: 80, stock: 80, category: 'Fruits' },
    { name: 'Mango', price: 150, stock: 40, category: 'Fruits' },
    { name: 'Apple Juice', price: 90, stock: 30, category: 'Juice' },
    { name: 'Orange Juice', price: 80, stock: 35, category: 'Juice' },
    { name: 'Mango Juice', price: 100, stock: 25, category: 'Juice' },
    { name: 'Mixed Fruit Juice', price: 110, stock: 20, category: 'Juice' },
    { name: 'Milk', price: 30, stock: 50, category: 'Dairy' },
    { name: 'Soap', price: 40, stock: 100, category: 'Grocery' },
    { name: 'Rice', price: 60, stock: 500, category: 'Grocery' }
];

db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    const stmt = db.prepare("INSERT INTO products (name, price, stock, category) VALUES (?, ?, ?, ?)");
    
    defaultProducts.forEach(p => {
        stmt.run(p.name, p.price, p.stock, p.category);
    });
    
    stmt.finalize();
    db.run("COMMIT", (err) => {
        if (err) {
            console.error("Error seeding data:", err);
        } else {
            console.log("Successfully added Fruits and Juices to the database!");
        }
        db.close();
    });
});
