// Enhanced Payment Processing System
class PaymentManager {
    constructor() {
        this.paymentMethods = this.loadPaymentMethods();
        this.supportedMethods = [
            { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
            { id: 'paypal', name: 'PayPal', icon: '🅿️' },
            { id: 'apple_pay', name: 'Apple Pay', icon: '🍎' },
            { id: 'google_pay', name: 'Google Pay', icon: '🟢' },
            { id: 'razorpay', name: 'Razorpay', icon: '💰' },
            { id: 'cod', name: 'Cash on Delivery', icon: '💵' }
        ];
    }

    // Load saved payment methods
    loadPaymentMethods() {
        const saved = localStorage.getItem('paymentMethods');
        return saved ? JSON.parse(saved) : [];
    }

    // Save payment methods
    savePaymentMethods() {
        localStorage.setItem('paymentMethods', JSON.stringify(this.paymentMethods));
    }

    // Add payment method
    addPaymentMethod(method) {
        const newMethod = {
            id: Date.now(),
            ...method,
            isDefault: this.paymentMethods.length === 0
        };
        this.paymentMethods.push(newMethod);
        this.savePaymentMethods();
        return newMethod;
    }

    // Enhanced payment processing with multiple gateways
    async processPayment(paymentData) {
        // Check if user is logged in
        if (!authManager.isLoggedIn()) {
            throw new Error('Please login to complete payment');
        }

        // Determine which gateway to use based on payment method
        let gateway = 'stripe'; // default
        
        switch (paymentData.method.id) {
            case 'paypal':
                gateway = 'paypal';
                break;
            case 'razorpay':
                gateway = 'razorpay';
                break;
            case 'card':
                // Use different gateways based on card type or region
                gateway = this.selectBestCardGateway(paymentData);
                break;
        }

        // Set the gateway and process payment
        paymentGatewayManager.setActiveGateway(gateway);
        
        const enhancedPaymentData = {
            ...paymentData,
            userId: authManager.getCurrentUser().id,
            currency: this.detectCurrency(),
            metadata: {
                orderId: 'ORD' + Date.now(),
                customerEmail: authManager.getCurrentUser().email || '',
                customerPhone: authManager.getCurrentUser().mobile
            }
        };

        try {
            const result = await paymentGatewayManager.processPayment(enhancedPaymentData);
            
            if (result.success) {
                // Log transaction
                this.logTransaction(result);
                
                // Update user's payment history
                this.updatePaymentHistory(result);
            }
            
            return result;
        } catch (error) {
            console.error('Payment processing error:', error);
            return {
                success: false,
                error: error.message || 'Payment processing failed'
            };
        }
    }

    // Select best card gateway based on various factors
    selectBestCardGateway(paymentData) {
        // In a real app, this would consider:
        // - User's location
        // - Card type
        // - Transaction amount
        // - Gateway fees
        // - Success rates
        
        const amount = paymentData.amount;
        
        if (amount > 1000) {
            return 'stripe'; // Better for high-value transactions
        } else if (amount < 50) {
            return 'square'; // Lower fees for small transactions
        }
        
        return 'stripe'; // Default
    }

    // Detect currency based on user location or preferences
    detectCurrency() {
        // In a real app, this would use geolocation or user preferences
        const userCountry = 'US'; // Default or detected
        
        const currencyMap = {
            'US': 'USD',
            'IN': 'INR',
            'GB': 'GBP',
            'EU': 'EUR',
            'CA': 'CAD'
        };
        
        return currencyMap[userCountry] || 'USD';
    }

    // Log transaction for audit purposes
    logTransaction(transactionResult) {
        const transactions = JSON.parse(localStorage.getItem('transactionLog') || '[]');
        
        transactions.push({
            ...transactionResult,
            userId: authManager.getCurrentUser().id,
            loggedAt: new Date().toISOString()
        });
        
        // Keep only last 100 transactions
        if (transactions.length > 100) {
            transactions.splice(0, transactions.length - 100);
        }
        
        localStorage.setItem('transactionLog', JSON.stringify(transactions));
    }

    // Update user's payment history
    updatePaymentHistory(transactionResult) {
        const user = authManager.getCurrentUser();
        if (!user.paymentHistory) {
            user.paymentHistory = [];
        }
        
        user.paymentHistory.unshift({
            transactionId: transactionResult.transactionId,
            amount: transactionResult.amount,
            gateway: transactionResult.gateway,
            timestamp: transactionResult.timestamp,
            status: 'completed'
        });
        
        // Keep only last 50 payments
        if (user.paymentHistory.length > 50) {
            user.paymentHistory.splice(50);
        }
        
        authManager.updateUserProfile(user);
    }

    // Validate card number (enhanced Luhn algorithm)
    validateCardNumber(cardNumber) {
        const num = cardNumber.replace(/\s/g, '');
        
        // Check if it's a valid length
        if (!/^\d{13,19}$/.test(num)) {
            return false;
        }
        
        let sum = 0;
        let isEven = false;
        
        for (let i = num.length - 1; i >= 0; i--) {
            let digit = parseInt(num.charAt(i));
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    }

    // Enhanced card type detection
    getCardType(cardNumber) {
        const num = cardNumber.replace(/\s/g, '');
        
        const cardTypes = [
            { type: 'Visa', pattern: /^4/ },
            { type: 'MasterCard', pattern: /^5[1-5]/ },
            { type: 'American Express', pattern: /^3[47]/ },
            { type: 'Discover', pattern: /^6(?:011|5)/ },
            { type: 'Diners Club', pattern: /^3[0689]/ },
            { type: 'JCB', pattern: /^35/ },
            { type: 'UnionPay', pattern: /^62/ }
        ];
        
        for (const cardType of cardTypes) {
            if (cardType.pattern.test(num)) {
                return cardType.type;
            }
        }
        
        return 'Unknown';
    }

    // Validate card expiry
    validateCardExpiry(expiry) {
        const [month, year] = expiry.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        
        const cardMonth = parseInt(month);
        const cardYear = parseInt(year);
        
        if (cardMonth < 1 || cardMonth > 12) {
            return false;
        }
        
        if (cardYear < currentYear || (cardYear === currentYear && cardMonth < currentMonth)) {
            return false;
        }
        
        return true;
    }

    // Validate CVV
    validateCVV(cvv, cardType) {
        const cvvLength = cardType === 'American Express' ? 4 : 3;
        return /^\d+$/.test(cvv) && cvv.length === cvvLength;
    }

    // Get payment analytics for admin
    getPaymentAnalytics() {
        const transactions = JSON.parse(localStorage.getItem('transactionLog') || '[]');
        
        const analytics = {
            totalTransactions: transactions.length,
            totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
            successRate: transactions.filter(t => t.success).length / transactions.length * 100,
            gatewayBreakdown: {},
            averageAmount: 0
        };
        
        // Gateway breakdown
        transactions.forEach(t => {
            if (!analytics.gatewayBreakdown[t.gateway]) {
                analytics.gatewayBreakdown[t.gateway] = 0;
            }
            analytics.gatewayBreakdown[t.gateway]++;
        });
        
        analytics.averageAmount = analytics.totalAmount / analytics.totalTransactions || 0;
        
        return analytics;
    }

    // Refund processing (simulation)
    async processRefund(transactionId, amount, reason) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const refundId = 'refund_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
                
                resolve({
                    success: true,
                    refundId: refundId,
                    originalTransactionId: transactionId,
                    refundAmount: amount,
                    reason: reason,
                    processedAt: new Date().toISOString(),
                    estimatedArrival: '3-5 business days'
                });
            }, 1500);
        });
    }
}

// Enhanced Order Management System
class OrderManager {
    constructor() {
        this.orders = this.loadOrders();
    }

    // Load orders from localStorage
    loadOrders() {
        const saved = localStorage.getItem('userOrders');
        return saved ? JSON.parse(saved) : [];
    }

    // Save orders to localStorage
    saveOrders() {
        localStorage.setItem('userOrders', JSON.stringify(this.orders));
    }

    // Create new order with user association
    createOrder(orderData) {
        if (!authManager.isLoggedIn()) {
            throw new Error('User must be logged in to create order');
        }

        const user = authManager.getCurrentUser();
        const order = {
            id: 'ORD' + Date.now(),
            userId: user.id,
            items: orderData.items,
            total: orderData.total,
            shippingAddress: orderData.shippingAddress,
            paymentMethod: orderData.paymentMethod,
            transactionId: orderData.transactionId,
            status: 'confirmed',
            orderDate: new Date().toISOString(),
            estimatedDelivery: this.calculateDeliveryDate(),
            trackingNumber: this.generateTrackingNumber(),
            customerInfo: {
                name: user.name,
                mobile: user.mobile,
                email: user.email || ''
            }
        };

        this.orders.unshift(order);
        this.saveOrders();
        
        // Update user's order history
        this.updateUserOrderHistory(user.id, order.id);
        
        return order;
    }

    // Update user's order history
    updateUserOrderHistory(userId, orderId) {
        const user = authManager.getCurrentUser();
        if (user && user.id === userId) {
            if (!user.orderHistory) {
                user.orderHistory = [];
            }
            user.orderHistory.unshift(orderId);
            authManager.updateUserProfile(user);
        }
    }

    // Calculate estimated delivery date with more sophisticated logic
    calculateDeliveryDate() {
        const deliveryDate = new Date();
        
        // Add business days (skip weekends)
        let daysToAdd = Math.floor(Math.random() * 5) + 3; // 3-7 days
        
        while (daysToAdd > 0) {
            deliveryDate.setDate(deliveryDate.getDate() + 1);
            
            // Skip weekends
            if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
                daysToAdd--;
            }
        }
        
        return deliveryDate.toISOString();
    }

    // Generate tracking number
    generateTrackingNumber() {
        const prefix = 'SH'; // ShopHub prefix
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `${prefix}${timestamp}${random}`;
    }

    // Get user orders
    getUserOrders(userId = null) {
        const targetUserId = userId || (authManager.isLoggedIn() ? authManager.getCurrentUser().id : null);
        
        if (!targetUserId) {
            return [];
        }
        
        return this.orders
            .filter(order => order.userId === targetUserId)
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    }

    // Update order status
    updateOrderStatus(orderId, newStatus) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            order.statusUpdatedAt = new Date().toISOString();
            this.saveOrders();
            return true;
        }
        return false;
    }

    // Cancel order
    cancelOrder(orderId, reason) {
        const order = this.orders.find(o => o.id === orderId);
        if (order && ['confirmed', 'processing'].includes(order.status)) {
            order.status = 'cancelled';
            order.cancellationReason = reason;
            order.cancelledAt = new Date().toISOString();
            this.saveOrders();
            return true;
        }
        return false;
    }
}

// Initialize managers
const paymentManager = new PaymentManager();
const orderManager = new OrderManager();