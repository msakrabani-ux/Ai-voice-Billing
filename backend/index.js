const express = require('express');
const cors = require('cors');
const db = require('./database');

const productsRouter = require('./routes/products');
const invoicesRouter = require('./routes/invoices');
const analyticsRouter = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productsRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/analytics', analyticsRouter);

app.get('/', (req, res) => {
    res.send('MS SAKRA API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
