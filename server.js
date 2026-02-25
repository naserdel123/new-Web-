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

// ✅ صفحة رئيسية (HTML بسيط)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>سوقنا - API</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #0f172a; color: white; text-align: center; padding: 50px; }
                .box { background: rgba(255,255,255,0.1); padding: 30px; border-radius: 20px; max-width: 600px; margin: 0 auto; }
                h1 { color: #6366f1; }
                .btn { display: inline-block; background: #6366f1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; margin: 10px; }
                .status { color: #10b981; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="box">
                <h1>🚀 سوقنا API</h1>
                <p class="status">✅ السيرفر يعمل بنجاح</p>
                <p>الوقت: ${new Date().toLocaleString('ar-SA')}</p>
                <br>
                <a href="/api/products" class="btn">📦 عرض المنتجات</a>
                <a href="/api/health" class="btn">🏥 فحص الحالة</a>
            </div>
        </body>
        </html>
    `);
});

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
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

// In-memory database
let products = [];
let nextId = 1;

// API Routes
app.get('/api/products', (req, res) => {
    let result = [...products];
    
    if (req.query.search) {
        const search = req.query.search.toLowerCase();
        result = result.filter(p => p.name.toLowerCase().includes(search));
    }
    
    if (req.query.city) {
        const city = req.query.city.toLowerCase();
        result = result.filter(p => p.city.toLowerCase().includes(city));
    }
    
    if (req.query.currency) {
        result = result.filter(p => p.currency === req.query.currency);
    }
    
    res.json(result.sort((a, b) => b.id - a.id));
});

app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
});

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

app.delete('/api/products/:id', (req, res) => {
    const index = products.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Product not found' });
    
    products.splice(index, 1);
    res.json({ message: 'Product deleted' });
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date(),
        productsCount: products.length 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found', path: req.path });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
