const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Configure Multer for image uploads
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
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// In-memory Database with sample products
let products = [
    {
        id: 1,
        name: "آيفون 15 برو ماكس",
        price: 4500,
        currency: "دولار",
        city: "بغداد",
        image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400",
        facebook: "https://facebook.com/seller1",
        description: "جهاز جديد بالكامل مع ضمان سنة، ذاكرة 256GB، لون تيتانيوم",
        createdAt: new Date('2024-01-15')
    },
    {
        id: 2,
        name: "لابتوب ماك بوك برو",
        price: 3200,
        currency: "دولار",
        city: "أربيل",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
        facebook: "https://facebook.com/seller2",
        description: "MacBook Pro M3، شاشة 14 بوصة، 16GB RAM",
        createdAt: new Date('2024-01-20')
    },
    {
        id: 3,
        name: "سيارة تويوتا كامري 2020",
        price: 18500,
        currency: "دولار",
        city: "البصرة",
        image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400",
        facebook: "https://facebook.com/seller3",
        description: "ماشية 50 ألف كم، فول مواصفات، جاهزة للاستخدام",
        createdAt: new Date('2024-02-01')
    },
    {
        id: 4,
        name: "ساعة آبل واتش",
        price: 350,
        currency: "دولار",
        city: "بغداد",
        image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400",
        facebook: "https://facebook.com/seller4",
        description: "Apple Watch Series 9، مقاس 45mm، لون منتصف الليل",
        createdAt: new Date('2024-02-10')
    },
    {
        id: 5,
        name: "أثاث منزلي كامل",
        price: 2500,
        currency: "دولار",
        city: "الموصل",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
        facebook: "https://facebook.com/seller5",
        description: "طقم كنب + طاولة طعام + 4 كراسي، استخدام خفيف جداً",
        createdAt: new Date('2024-02-15')
    },
    {
        id: 6,
        name: "كاميرا كانون EOS R5",
        price: 3800,
        currency: "دولار",
        city: "أربيل",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
        facebook: "https://facebook.com/seller6",
        description: "كاميرا احترافية مع عدسة 24-70mm، شبه جديدة",
        createdAt: new Date('2024-02-20')
    }
];

// Common CSS Styles
const commonStyles = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        :root {
            --bg-dark: #0f172a;
            --bg-card: rgba(30, 41, 59, 0.7);
            --primary: #6366f1;
            --primary-hover: #4f46e5;
            --accent: #ec4899;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --border: rgba(255, 255, 255, 0.1);
            --glass: rgba(255, 255, 255, 0.05);
        }
        
        body {
            font-family: 'Tajawal', sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            min-height: 100vh;
            line-height: 1.6;
            overflow-x: hidden;
        }
        
        /* Animated Background */
        .bg-animation {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            overflow: hidden;
        }
        
        .bg-animation::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 40%);
            animation: rotate 30s linear infinite;
        }
        
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        /* Glassmorphism */
        .glass {
            background: var(--glass);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid var(--border);
        }
        
        /* Navigation */
        nav {
            position: fixed;
            top: 0;
            width: 100%;
            z-index: 1000;
            padding: 1rem 2rem;
            transition: all 0.3s ease;
        }
        
        nav.scrolled {
            background: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(10px);
        }
        
        .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 1.8rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--primary), var(--accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .nav-links {
            display: flex;
            gap: 2rem;
            list-style: none;
        }
        
        .nav-links a {
            color: var(--text-secondary);
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s ease;
            position: relative;
            padding: 0.5rem 1rem;
            border-radius: 8px;
        }
        
        .nav-links a:hover, .nav-links a.active {
            color: var(--text-primary);
            background: var(--glass);
        }
        
        .mobile-menu {
            display: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--text-primary);
        }
        
        /* Buttons */
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.875rem 1.75rem;
            border-radius: 12px;
            border: none;
            font-family: 'Tajawal', sans-serif;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, var(--primary), var(--primary-hover));
            color: white;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
        }
        
        .btn-secondary {
            background: var(--glass);
            color: var(--text-primary);
            border: 1px solid var(--border);
        }
        
        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        
        /* Container */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }
        
        /* Hero Section */
        .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 6rem 2rem 4rem;
            position: relative;
        }
        
        .hero-content h1 {
            font-size: clamp(2.5rem, 6vw, 4.5rem);
            font-weight: 800;
            margin-bottom: 1.5rem;
            line-height: 1.2;
        }
        
        .hero-content h1 span {
            background: linear-gradient(135deg, var(--primary), var(--accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .hero-content p {
            font-size: 1.25rem;
            color: var(--text-secondary);
            max-width: 600px;
            margin: 0 auto 2.5rem;
        }
        
        .hero-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        /* Features */
        .features {
            padding: 4rem 0;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
        }
        
        .feature-card {
            padding: 2rem;
            border-radius: 20px;
            text-align: center;
            transition: all 0.3s ease;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
            border-color: var(--primary);
        }
        
        .feature-icon {
            width: 60px;
            height: 60px;
            border-radius: 16px;
            background: linear-gradient(135deg, var(--primary), var(--accent));
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            font-size: 1.5rem;
        }
        
        .feature-card h3 {
            font-size: 1.25rem;
            margin-bottom: 0.75rem;
        }
        
        .feature-card p {
            color: var(--text-secondary);
            font-size: 0.95rem;
        }
        
        /* Page Header */
        .page-header {
            padding: 8rem 2rem 3rem;
            text-align: center;
        }
        
        .page-header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        .page-header p {
            color: var(--text-secondary);
        }
        
        /* Filters */
        .filters {
            padding: 2rem;
            border-radius: 20px;
            margin-bottom: 3rem;
        }
        
        .filters-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            align-items: end;
        }
        
        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .form-group label {
            font-weight: 600;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }
        
        .form-control {
            padding: 0.875rem 1rem;
            border-radius: 12px;
            border: 1px solid var(--border);
            background: rgba(15, 23, 42, 0.6);
            color: var(--text-primary);
            font-family: 'Tajawal', sans-serif;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        
        .form-control:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }
        
        /* Products Grid */
        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 2rem;
            padding-bottom: 4rem;
        }
        
        .product-card {
            border-radius: 20px;
            overflow: hidden;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .product-image {
            width: 100%;
            height: 220px;
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        
        .product-card:hover .product-image {
            transform: scale(1.05);
        }
        
        .product-content {
            padding: 1.5rem;
        }
        
        .product-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 0.75rem;
        }
        
        .product-title {
            font-size: 1.1rem;
            font-weight: 700;
            line-height: 1.4;
        }
        
        .product-price {
            color: var(--accent);
            font-size: 1.25rem;
            font-weight: 800;
            white-space: nowrap;
        }
        
        .product-meta {
            display: flex;
            gap: 1rem;
            color: var(--text-secondary);
            font-size: 0.875rem;
            margin-bottom: 0.75rem;
        }
        
        .product-meta span {
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }
        
        .product-description {
            color: var(--text-secondary);
            font-size: 0.9rem;
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .product-footer {
            padding: 1rem 1.5rem;
            border-top: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .contact-btn {
            padding: 0.5rem 1rem;
            border-radius: 8px;
            background: var(--primary);
            color: white;
            text-decoration: none;
            font-size: 0.875rem;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .contact-btn:hover {
            background: var(--primary-hover);
        }
        
        /* Sell Form */
        .sell-section {
            padding: 2rem 0 4rem;
        }
        
        .sell-form {
            max-width: 700px;
            margin: 0 auto;
            padding: 2.5rem;
            border-radius: 24px;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
        }
        
        @media (max-width: 600px) {
            .form-row {
                grid-template-columns: 1fr;
            }
        }
        
        .file-upload {
            border: 2px dashed var(--border);
            border-radius: 12px;
            padding: 2rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
        }
        
        .file-upload:hover {
            border-color: var(--primary);
            background: rgba(99, 102, 241, 0.05);
        }
        
        .file-upload input {
            position: absolute;
            inset: 0;
            opacity: 0;
            cursor: pointer;
        }
        
        .file-upload i {
            font-size: 2.5rem;
            color: var(--primary);
            margin-bottom: 1rem;
        }
        
        .file-upload p {
            color: var(--text-secondary);
        }
        
        .preview-image {
            max-width: 100%;
            max-height: 200px;
            border-radius: 12px;
            margin-top: 1rem;
            display: none;
        }
        
        textarea.form-control {
            resize: vertical;
            min-height: 120px;
        }
        
        .submit-btn {
            width: 100%;
            padding: 1rem;
            font-size: 1.1rem;
            margin-top: 1rem;
        }
        
        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            grid-column: 1 / -1;
        }
        
        .empty-state i {
            font-size: 4rem;
            color: var(--text-secondary);
            margin-bottom: 1rem;
        }
        
        .empty-state h3 {
            color: var(--text-secondary);
            font-weight: 500;
        }
        
        /* Loading */
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        /* Toast Notification */
        .toast {
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: var(--primary);
            color: white;
            padding: 1rem 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 2000;
            opacity: 0;
            transition: all 0.3s ease;
        }
        
        .toast.show {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .nav-links {
                display: none;
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: rgba(15, 23, 42, 0.98);
                flex-direction: column;
                padding: 1rem;
                gap: 0.5rem;
            }
            
            .nav-links.active {
                display: flex;
            }
            
            .mobile-menu {
                display: block;
            }
            
            .hero-content h1 {
                font-size: 2rem;
            }
            
            .filters-grid {
                grid-template-columns: 1fr;
            }
            
            .products-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
`;

// Common Navigation
const commonNav = (activePage) => `
    <nav class="glass">
        <div class="nav-container">
            <div class="logo">
                <i class="fas fa-store"></i>
                سوقنا
            </div>
            <ul class="nav-links" id="navLinks">
                <li><a href="/" class="${activePage === 'home' ? 'active' : ''}">الرئيسية</a></li>
                <li><a href="/buy" class="${activePage === 'buy' ? 'active' : ''}">الشراء</a></li>
                <li><a href="/sell" class="${activePage === 'sell' ? 'active' : ''}">البيع</a></li>
            </ul>
            <div class="mobile-menu" onclick="toggleMenu()">
                <i class="fas fa-bars"></i>
            </div>
        </div>
    </nav>
    <script>
        function toggleMenu() {
            document.getElementById('navLinks').classList.toggle('active');
        }
        
        window.addEventListener('scroll', () => {
            document.querySelector('nav').classList.toggle('scrolled', window.scrollY > 50);
        });
    </scrip
