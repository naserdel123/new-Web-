// 🔗 رابط Backend على Render (ستحتاج لتحديثه بعد نشرك على Render)
const API_URL = 'https://new-web-tphy.onrender.com';

// 🎭 Toggle Theme
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const icon = document.querySelector('.theme-toggle i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
}

// 📊 Animate Numbers
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = '+' + Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// 🖼️ Preview Image
function previewImage(input) {
    const preview = document.getElementById('imagePreview');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// 💾 Handle Sell Form Submit
async function handleSellSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', document.getElementById('productName').value);
    formData.append('price', document.getElementById('productPrice').value);
    formData.append('currency', document.getElementById('productCurrency').value);
    formData.append('city', document.getElementById('productCity').value);
    formData.append('description', document.getElementById('productDescription').value);
    formData.append('facebookLink', document.getElementById('facebookLink').value);
    
    const imageFile = document.getElementById('productImage').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            document.getElementById('sellForm').classList.add('hidden');
            document.getElementById('successMessage').classList.remove('hidden');
        } else {
            alert('حدث خطأ، يرجى المحاولة مرة أخرى');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('حدث خطأ في الاتصال');
    }
}

// 🛍️ Load Products
async function loadProducts() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const productsList = document.getElementById('productsList');
    const noResults = document.getElementById('noResults');
    
    if (loadingSpinner) loadingSpinner.classList.remove('hidden');
    
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        
        if (loadingSpinner) loadingSpinner.classList.add('hidden');
        
        if (products.length === 0) {
            if (noResults) noResults.classList.remove('hidden');
            return;
        }
        
        displayProducts(products);
    } catch (error) {
        console.error('Error:', error);
        if (loadingSpinner) loadingSpinner.classList.add('hidden');
        // عرض بيانات وهمية للعرض التوضيحي
        displayDummyProducts();
    }
}

// 🎨 Display Products
function displayProducts(products) {
    const container = document.getElementById('productsList') || document.getElementById('recentProducts');
    if (!container) return;
    
    container.innerHTML = products.map(product => `
        <div class="product-card" onclick="showProductDetails(${product.id})">
            <img src="${product.imageUrl || 'https://via.placeholder.com/300x250'}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">${product.price} ${product.currency}</div>
                <div class="product-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${product.city}</span>
                </div>
                <div class="product-actions">
                    ${product.facebookLink ? `
                        <a href="${product.facebookLink}" target="_blank" class="btn btn-primary btn-small" onclick="event.stopPropagation()">
                            <i class="fab fa-facebook"></i> تواصل
                        </a>
                    ` : ''}
                    <button class="btn btn-secondary btn-small" onclick="event.stopPropagation(); showProductDetails(${product.id})">
                        <i class="fas fa-eye"></i> التفاصيل
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// 🎭 Display Dummy Products (للعرض التوضيحي)
function displayDummyProducts() {
    const dummyProducts = [
        { id: 1, name: 'iPhone 14 Pro Max', price: 4500, currency: 'ريال سعودي', city: 'الرياض', imageUrl: '', facebookLink: 'https://facebook.com/user1' },
        { id: 2, name: 'MacBook Pro M2', price: 6000, currency: 'درهم إماراتي', city: 'دبي', imageUrl: '', facebookLink: '' },
        { id: 3, name: 'PlayStation 5', price: 2500, currency: 'دينار كويتي', city: 'الكويت', imageUrl: '', facebookLink: 'https://facebook.com/user3' }
    ];
    displayProducts(dummyProducts);
}

// 🔍 Apply Filters
async function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value;
    const city = document.getElementById('cityFilter').value;
    const currency = document.getElementById('currencyFilter').value;
    
    try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (city) params.append('city', city);
        if (currency) params.append('currency', currency);
        
        const response = await fetch(`${API_URL}/products?${params}`);
        const products = await response.json();
        
        displayProducts(products);
    } catch (error) {
        console.error('Error:', error);
    }
}

// 📱 Show Product Details
async function showProductDetails(id) {
    const modal = document.getElementById('productModal');
    const content = document.getElementById('modalContent');
    
    try {
        const response = await fetch(`${API_URL}/products/${id}`);
        const product = await response.json();
        
        content.innerHTML = `
            <img src="${product.imageUrl || 'https://via.placeholder.com/600x400'}" alt="${product.name}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 20px 20px 0 0;">
            <div style="padding: 2rem;">
                <h2 style="font-size: 1.8rem; margin-bottom: 1rem;">${product.name}</h2>
                <div style="font-size: 2rem; font-weight: 800; background: var(--gradient-2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 1rem;">
                    ${product.price} ${product.currency}
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--gray); margin-bottom: 1rem;">
                    <i class="fas fa-map-marker-alt" style="color: var(--accent);"></i>
                    <span>${product.city}</span>
                </div>
                <p style="color: var(--gray); line-height: 1.8; margin-bottom: 1.5rem;">${product.description || 'لا يوجد وصف'}</p>
                ${product.facebookLink ? `
                    <a href="${product.facebookLink}" target="_blank" class="btn btn-primary btn-block">
                        <i class="fab fa-facebook"></i> التواصل عبر فيسبوك
                    </a>
                ` : '<button class="btn btn-secondary btn-block" disabled>لا يوجد رابط تواصل</button>'}
            </div>
        `;
        
        modal.classList.add('active');
    } catch (error) {
        console.error('Error:', error);
    }
}

// ❌ Close Modal
function closeModal() {
    document.getElementById('productModal').classList.remove('active');
}

// 🚀 Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Animate stats on homepage
    animateValue('usersCount', 0, 1000, 2000);
    animateValue('productsCount', 0, 500, 2000);
    animateValue('dealsCount', 0, 200, 2000);
    
    // Close modal on outside click
    window.onclick = function(event) {
        const modal = document.getElementById('productModal');
        if (event.target === modal) {
            closeModal();
        }
    }
});
