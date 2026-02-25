const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

// In-memory database (استخدم MongoDB في الإنتاج)
let products = [];
let nextId = 1;

// Routes

// Get all products with filters
app.get('/api/products', (req, res) => {
    let result = [...products];
    
    // Search by name
    if (req.query.search) {
        const search = req.query.search.toLowerCase();
        result = result.filter(p => p.name.toLowerCase().includes(search));
    }
    
    // Filter by city
    if (req.query.city) {
        const city = req.query.city.toLowerCase();
        result = result.filter(p => p.city.toLowerCase().includes(city));
    }
    
    // Filter by currency
    if (req.query.currency) {
        result = result.filter(p => p.currency === req.query.currency);
    }
    
    res.json(result.sort((a, b) => b.id - a.id));
});

// Get single product
app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
});

// Create product
app.post('/api/products', upload.single('image'), (req, res) => {
    const { name, price, currency, city, description, facebookLink } = req.body;
    
    const product = {
        id: nextId++,
        name,
        price: parseFloat(price),
        currency,
        city,
        description: description || '',
        facebookLink: facebookLink || '',
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
        createdAt: new Date()
    };
    
    products.push(product);
    res.status(201).json(product);
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
    const index = products.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Product not found' });
    
    products.splice(index, 1);
    res.json({ message: 'Product deleted' });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
