// Order History Management
class OrderHistoryManager {
    constructor() {
        this.orders = this.loadOrders();
    }

    // Load orders from localStorage
    loadOrders() {
        const saved = localStorage.getItem('userOrders');
        return saved ? JSON.parse(saved) : [];
    }

    // Get orders for current user
    getUserOrders() {
        if (!authManager.isLoggedIn()) {
            return [];
        }
        
        const currentUser = authManager.getCurrentUser();
        return this.orders.filter(order => order.userId === currentUser.id)
                         .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    }

    // Show order history modal
    showOrderHistory() {
        if (!authManager.isLoggedIn()) {
            authManager.showAuthModal();
            return;
        }

        const modal = document.getElementById('orderHistoryModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            this.renderOrderHistory();
        }
    }

    // Close order history modal
    closeOrderHistory() {
        const modal = document.getElementById('orderHistoryModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Render order history
    renderOrderHistory() {
        const container = document.getElementById('orderHistoryContent');
        const userOrders = this.getUserOrders();
        
        if (userOrders.length === 0) {
            container.innerHTML = `
                <div class="empty-orders">
                    <div class="empty-icon">
                        <i class="fas fa-shopping-bag"></i>
                    </div>
                    <h3>No Orders Yet</h3>
                    <p>Start shopping to see your orders here</p>
                    <button class="btn btn-primary" onclick="orderHistoryManager.closeOrderHistory()">
                        Start Shopping
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="orders-list">
                ${userOrders.map(order => this.renderOrderCard(order)).join('')}
            </div>
        `;
    }

    // Render individual order card
    renderOrderCard(order) {
        const orderDate = new Date(order.orderDate).toLocaleDateString();
        const deliveryDate = new Date(order.estimatedDelivery).toLocaleDateString();
        const statusColor = this.getStatusColor(order.status);
        
        return `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-info">
                        <h4>Order ${order.id}</h4>
                        <p class="order-date">Placed on ${orderDate}</p>
                    </div>
                    <div class="order-status">
                        <span class="status-badge ${statusColor}">${order.status.toUpperCase()}</span>
                        <p class="order-total">$${order.total.toFixed(2)}</p>
                    </div>
                </div>
                
                <div class="order-items">
                    ${order.items.slice(0, 3).map(item => `
                        <div class="order-item">
                            <span class="item-emoji">${item.image}</span>
                            <div class="item-details">
                                <span class="item-name">${item.title}</span>
                                <span class="item-qty">Qty: ${item.quantity}</span>
                            </div>
                            <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                    ${order.items.length > 3 ? `
                        <div class="more-items">
                            +${order.items.length - 3} more items
                        </div>
                    ` : ''}
                </div>
                
                <div class="order-footer">
                    <div class="delivery-info">
                        <i class="fas fa-truck"></i>
                        <span>Estimated delivery: ${deliveryDate}</span>
                        <span class="tracking-number">Tracking: ${order.trackingNumber}</span>
                    </div>
                    <div class="order-actions">
                        <button class="btn btn-outline" onclick="orderHistoryManager.trackOrder('${order.id}')">
                            Track Order
                        </button>
                        <button class="btn btn-outline" onclick="orderHistoryManager.viewOrderDetails('${order.id}')">
                            View Details
                        </button>
                        ${order.status === 'delivered' ? `
                            <button class="btn btn-primary" onclick="orderHistoryManager.reorderItems('${order.id}')">
                                Reorder
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // Get status color class
    getStatusColor(status) {
        const colors = {
            'confirmed': 'status-confirmed',
            'processing': 'status-processing',
            'shipped': 'status-shipped',
            'delivered': 'status-delivered',
            'cancelled': 'status-cancelled'
        };
        return colors[status] || 'status-confirmed';
    }

    // Track order
    trackOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        // Simulate tracking information
        const trackingSteps = [
            { status: 'Order Confirmed', date: order.orderDate, completed: true },
            { status: 'Processing', date: this.addDays(order.orderDate, 1), completed: order.status !== 'confirmed' },
            { status: 'Shipped', date: this.addDays(order.orderDate, 2), completed: ['shipped', 'delivered'].includes(order.status) },
            { status: 'Out for Delivery', date: this.addDays(order.orderDate, 3), completed: order.status === 'delivered' },
            { status: 'Delivered', date: order.estimatedDelivery, completed: order.status === 'delivered' }
        ];

        this.showTrackingModal(order, trackingSteps);
    }

    // Show tracking modal
    showTrackingModal(order, trackingSteps) {
        const modal = document.getElementById('trackingModal');
        const content = document.getElementById('trackingContent');
        
        content.innerHTML = `
            <div class="tracking-header">
                <h3>Track Order ${order.id}</h3>
                <p>Tracking Number: ${order.trackingNumber}</p>
            </div>
            
            <div class="tracking-timeline">
                ${trackingSteps.map((step, index) => `
                    <div class="timeline-step ${step.completed ? 'completed' : ''}">
                        <div class="step-indicator">
                            <i class="fas ${step.completed ? 'fa-check' : 'fa-circle'}"></i>
                        </div>
                        <div class="step-content">
                            <h4>${step.status}</h4>
                            <p>${new Date(step.date).toLocaleDateString()} ${new Date(step.date).toLocaleTimeString()}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="tracking-actions">
                <button class="btn btn-primary" onclick="orderHistoryManager.closeTrackingModal()">
                    Close
                </button>
            </div>
        `;
        
        modal.style.display = 'block';
    }

    // Close tracking modal
    closeTrackingModal() {
        const modal = document.getElementById('trackingModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // View order details
    viewOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        alert(`Order Details for ${order.id}\n\nTotal: $${order.total.toFixed(2)}\nItems: ${order.items.length}\nStatus: ${order.status}\nTracking: ${order.trackingNumber}`);
    }

    // Reorder items
    reorderItems(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        // Add all items from the order back to cart
        order.items.forEach(item => {
            cart.addItem(item.id, item.quantity);
        });

        cart.showSuccessMessage(`${order.items.length} items added to cart from previous order!`);
        this.closeOrderHistory();
        cart.openCart();
    }

    // Utility function to add days to date
    addDays(dateString, days) {
        const date = new Date(dateString);
        date.setDate(date.getDate() + days);
        return date.toISOString();
    }

    // Filter orders
    filterOrders(status) {
        const userOrders = this.getUserOrders();
        const filteredOrders = status === 'all' ? userOrders : userOrders.filter(order => order.status === status);
        
        const container = document.getElementById('orderHistoryContent');
        container.innerHTML = `
            <div class="orders-list">
                ${filteredOrders.map(order => this.renderOrderCard(order)).join('')}
            </div>
        `;
    }
}

// Initialize order history manager
const orderHistoryManager = new OrderHistoryManager();