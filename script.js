// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Swiper for featured products
    initializeSwiper();
    
    // Load products
    loadFeaturedProducts();
    loadAllProducts();
    
    // Set up event listeners
    setupEventListeners();
    
    console.log('E-Commerce Product Showcase loaded successfully!');
});

// Initialize Swiper carousel
function initializeSwiper() {
    const swiper = new Swiper('.featured-swiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
            },
            768: {
                slidesPerView: 3,
            },
            1024: {
                slidesPerView: 4,
            },
        }
    });
}

// Load featured products in carousel
function loadFeaturedProducts() {
    const featuredContainer = document.getElementById('featuredProducts');
    const featuredProducts = getFeaturedProducts();
    
    featuredContainer.innerHTML = featuredProducts.map(product => `
        <div class="swiper-slide">
            <div class="product-card" onclick="openProductModal(${product.id})">
                <div class="product-image">
                    <span style="font-size: 4rem;">${product.image}</span>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <div class="product-actions" onclick="event.stopPropagation()">
                        <button class="btn btn-primary" onclick="cart.addItem(${product.id})">Add to Cart</button>
                        <button class="btn btn-secondary" onclick="buyNow(${product.id})">Buy Now</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Load all products in grid
function loadAllProducts(category = 'all') {
    const productsGrid = document.getElementById('productsGrid');
    const filteredProducts = getProductsByCategory(category);
    
    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-category="${product.category}" onclick="openProductModal(${product.id})">
            <div class="product-image">
                <span style="font-size: 4rem;">${product.image}</span>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <p class="product-description">${product.description.substring(0, 100)}...</p>
                <div class="product-actions" onclick="event.stopPropagation()">
                    <button class="btn btn-primary" onclick="cart.addItem(${product.id})">Add to Cart</button>
                    <button class="btn btn-secondary" onclick="buyNow(${product.id})">Buy Now</button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add animation to cards
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.style.animation = 'fadeInUp 0.6s ease forwards';
    });
}

// Set up event listeners
function setupEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter products
            const category = this.dataset.filter;
            loadAllProducts(category);
        });
    });
    
    // Cart button
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => cart.openCart());
    }
    
    // Close cart
    const closeCart = document.getElementById('closeCart');
    if (closeCart) {
        closeCart.addEventListener('click', () => cart.closeCart());
    }
    
    // Cart overlay
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartOverlay) {
        cartOverlay.addEventListener('click', () => cart.closeCart());
    }
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => cart.checkout());
    }
    
    // Modal close button
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', closeProductModal);
    }
    
    // Modal overlay click
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeProductModal();
            }
        });
    }
    
    // Quantity controls in modal
    const decreaseQty = document.getElementById('decreaseQty');
    const increaseQty = document.getElementById('increaseQty');
    const quantityInput = document.getElementById('quantity');
    
    if (decreaseQty) {
        decreaseQty.addEventListener('click', function() {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });
    }
    
    if (increaseQty) {
        increaseQty.addEventListener('click', function() {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue < 10) {
                quantityInput.value = currentValue + 1;
            }
        });
    }
    
    // Modal add to cart
    const addToCartModal = document.getElementById('addToCartModal');
    if (addToCartModal) {
        addToCartModal.addEventListener('click', function() {
            const productId = parseInt(this.dataset.productId);
            const quantity = parseInt(quantityInput.value);
            cart.addItem(productId, quantity);
            closeProductModal();
        });
    }
    
    // Modal buy now
    const buyNowModal = document.getElementById('buyNowModal');
    if (buyNowModal) {
        buyNowModal.addEventListener('click', function() {
            const productId = parseInt(this.dataset.productId);
            const quantity = parseInt(quantityInput.value);
            buyNow(productId, quantity);
        });
    }
}

// Open product modal
function openProductModal(productId) {
    const product = getProductById(productId);
    if (!product) return;
    
    const modal = document.getElementById('productModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalPrice = document.getElementById('modalPrice');
    const modalDescription = document.getElementById('modalDescription');
    const addToCartModal = document.getElementById('addToCartModal');
    const buyNowModal = document.getElementById('buyNowModal');
    const quantityInput = document.getElementById('quantity');
    
    // Create a placeholder image with emoji
    modalImage.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 8rem; background: #f8f9fa;">${product.image}</div>`;
    modalTitle.textContent = product.title;
    modalPrice.textContent = `$${product.price.toFixed(2)}`;
    modalDescription.textContent = product.description;
    quantityInput.value = 1;
    
    // Set product ID for buttons
    addToCartModal.dataset.productId = productId;
    buyNowModal.dataset.productId = productId;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close product modal
function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Buy now function
function buyNow(productId, quantity = 1) {
    const product = getProductById(productId);
    if (!product) return;
    
    const total = product.price * quantity;
    const confirmed = confirm(`Buy ${quantity} x ${product.title}\nTotal: $${total.toFixed(2)}\n\nProceed to checkout?`);
    
    if (confirmed) {
        cart.showSuccessMessage(`Order placed successfully! Thank you for purchasing ${product.title}.`);
        closeProductModal();
    }
}

// Add CSS animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);