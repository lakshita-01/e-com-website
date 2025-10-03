// Product data with sample products
const products = [
    {
        id: 1,
        title: "Wireless Bluetooth Headphones",
        price: 79.99,
        category: "electronics",
        description: "High-quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
        image: "🎧",
        featured: true
    },
    {
        id: 2,
        title: "Premium Cotton T-Shirt",
        price: 24.99,
        category: "clothing",
        description: "Comfortable 100% organic cotton t-shirt available in multiple colors. Soft, breathable, and perfect for everyday wear.",
        image: "👕",
        featured: true
    },
    {
        id: 3,
        title: "JavaScript Programming Guide",
        price: 34.99,
        category: "books",
        description: "Complete guide to modern JavaScript development. Learn ES6+, async programming, and best practices from industry experts.",
        image: "📚",
        featured: false
    },
    {
        id: 4,
        title: "Smart Home Security Camera",
        price: 129.99,
        category: "electronics",
        description: "1080p HD security camera with night vision, motion detection, and smartphone app control. Keep your home safe 24/7.",
        image: "📹",
        featured: true
    },
    {
        id: 5,
        title: "Ceramic Coffee Mug Set",
        price: 19.99,
        category: "home",
        description: "Set of 4 elegant ceramic coffee mugs. Dishwasher and microwave safe. Perfect for your morning coffee routine.",
        image: "☕",
        featured: false
    },
    {
        id: 6,
        title: "Fitness Tracking Smartwatch",
        price: 199.99,
        category: "electronics",
        description: "Advanced fitness tracker with heart rate monitoring, GPS, and 7-day battery life. Track your health and fitness goals.",
        image: "⌚",
        featured: true
    },
    {
        id: 7,
        title: "Designer Denim Jeans",
        price: 89.99,
        category: "clothing",
        description: "Premium denim jeans with perfect fit and durability. Classic style that never goes out of fashion.",
        image: "👖",
        featured: false
    },
    {
        id: 8,
        title: "Cooking Masterclass Cookbook",
        price: 29.99,
        category: "books",
        description: "Learn professional cooking techniques with step-by-step recipes from world-renowned chefs.",
        image: "📖",
        featured: false
    },
    {
        id: 9,
        title: "Aromatherapy Essential Oil Set",
        price: 39.99,
        category: "home",
        description: "Set of 6 pure essential oils for relaxation and wellness. Includes lavender, eucalyptus, and peppermint.",
        image: "🧴",
        featured: true
    },
    {
        id: 10,
        title: "Wireless Phone Charger",
        price: 24.99,
        category: "electronics",
        description: "Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator.",
        image: "🔌",
        featured: false
    },
    {
        id: 11,
        title: "Cozy Winter Sweater",
        price: 54.99,
        category: "clothing",
        description: "Warm and stylish wool blend sweater perfect for cold weather. Available in multiple sizes and colors.",
        image: "🧥",
        featured: false
    },
    {
        id: 12,
        title: "Indoor Plant Care Guide",
        price: 22.99,
        category: "books",
        description: "Complete guide to growing and caring for indoor plants. Transform your home into a green oasis.",
        image: "🌱",
        featured: false
    },
    {
        id: 13,
        title: "Bamboo Kitchen Utensil Set",
        price: 16.99,
        category: "home",
        description: "Eco-friendly bamboo kitchen utensils. Set includes spatula, spoon, fork, and tongs. Sustainable and durable.",
        image: "🥄",
        featured: false
    },
    {
        id: 14,
        title: "Bluetooth Portable Speaker",
        price: 49.99,
        category: "electronics",
        description: "Compact wireless speaker with powerful sound and 12-hour battery. Perfect for outdoor adventures.",
        image: "🔊",
        featured: true
    },
    {
        id: 15,
        title: "Yoga Mat Premium",
        price: 34.99,
        category: "home",
        description: "Non-slip yoga mat with extra cushioning. Perfect for yoga, pilates, and home workouts.",
        image: "🧘",
        featured: false
    }
];

// Get products by category
function getProductsByCategory(category) {
    if (category === 'all') {
        return products;
    }
    return products.filter(product => product.category === category);
}

// Get featured products
function getFeaturedProducts() {
    return products.filter(product => product.featured);
}

// Get product by ID
function getProductById(id) {
    return products.find(product => product.id === parseInt(id));
}

// Search products
function searchProducts(query) {
    const lowercaseQuery = query.toLowerCase();
    return products.filter(product => 
        product.title.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery) ||
        product.category.toLowerCase().includes(lowercaseQuery)
    );
}