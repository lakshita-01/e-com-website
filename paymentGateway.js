// Enhanced Payment Gateway System
class PaymentGatewayManager {
    constructor() {
        this.gateways = {
            stripe: new StripeGateway(),
            paypal: new PayPalGateway(),
            razorpay: new RazorpayGateway(),
            square: new SquareGateway()
        };
        this.activeGateway = 'stripe';
    }

    // Process payment through selected gateway
    async processPayment(paymentData) {
        const gateway = this.gateways[this.activeGateway];
        if (!gateway) {
            throw new Error('Payment gateway not available');
        }

        return await gateway.processPayment(paymentData);
    }

    // Set active gateway
    setActiveGateway(gatewayName) {
        if (this.gateways[gatewayName]) {
            this.activeGateway = gatewayName;
            return true;
        }
        return false;
    }

    // Get available gateways
    getAvailableGateways() {
        return Object.keys(this.gateways).map(key => ({
            id: key,
            name: this.gateways[key].name,
            logo: this.gateways[key].logo,
            supported: this.gateways[key].isSupported()
        }));
    }
}

// Base Payment Gateway Class
class PaymentGateway {
    constructor(name, logo) {
        this.name = name;
        this.logo = logo;
    }

    async processPayment(paymentData) {
        throw new Error('processPayment method must be implemented');
    }

    isSupported() {
        return true;
    }

    validatePaymentData(paymentData) {
        const required = ['amount', 'currency', 'paymentMethod'];
        for (const field of required) {
            if (!paymentData[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        return true;
    }
}

// Stripe Payment Gateway
class StripeGateway extends PaymentGateway {
    constructor() {
        super('Stripe', '💳');
        this.publishableKey = 'pk_test_demo'; // Demo key
    }

    async processPayment(paymentData) {
        this.validatePaymentData(paymentData);
        
        return new Promise((resolve) => {
            // Simulate Stripe payment processing
            setTimeout(() => {
                const success = Math.random() > 0.05; // 95% success rate
                
                if (success) {
                    resolve({
                        success: true,
                        transactionId: 'stripe_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        amount: paymentData.amount,
                        currency: paymentData.currency || 'USD',
                        gateway: 'stripe',
                        timestamp: new Date().toISOString(),
                        paymentMethod: paymentData.paymentMethod,
                        fees: paymentData.amount * 0.029 + 0.30 // Stripe fees
                    });
                } else {
                    resolve({
                        success: false,
                        error: 'Payment declined by bank',
                        errorCode: 'card_declined'
                    });
                }
            }, 2000);
        });
    }

    // Create payment intent (simulation)
    async createPaymentIntent(amount, currency = 'USD') {
        return {
            clientSecret: 'pi_demo_' + Math.random().toString(36),
            amount: amount * 100, // Stripe uses cents
            currency: currency.toLowerCase()
        };
    }
}

// PayPal Payment Gateway
class PayPalGateway extends PaymentGateway {
    constructor() {
        super('PayPal', '🅿️');
        this.clientId = 'demo_paypal_client_id';
    }

    async processPayment(paymentData) {
        this.validatePaymentData(paymentData);
        
        return new Promise((resolve) => {
            // Simulate PayPal payment processing
            setTimeout(() => {
                const success = Math.random() > 0.03; // 97% success rate
                
                if (success) {
                    resolve({
                        success: true,
                        transactionId: 'pp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        amount: paymentData.amount,
                        currency: paymentData.currency || 'USD',
                        gateway: 'paypal',
                        timestamp: new Date().toISOString(),
                        paymentMethod: 'paypal',
                        fees: paymentData.amount * 0.0349 + 0.49 // PayPal fees
                    });
                } else {
                    resolve({
                        success: false,
                        error: 'PayPal payment failed',
                        errorCode: 'paypal_error'
                    });
                }
            }, 1500);
        });
    }

    // Create PayPal order (simulation)
    async createOrder(amount, currency = 'USD') {
        return {
            orderId: 'paypal_order_' + Math.random().toString(36),
            amount: amount,
            currency: currency,
            approvalUrl: 'https://paypal.com/approve/demo'
        };
    }
}

// Razorpay Payment Gateway (for Indian market)
class RazorpayGateway extends PaymentGateway {
    constructor() {
        super('Razorpay', '💰');
        this.keyId = 'rzp_test_demo';
    }

    async processPayment(paymentData) {
        this.validatePaymentData(paymentData);
        
        return new Promise((resolve) => {
            // Simulate Razorpay payment processing
            setTimeout(() => {
                const success = Math.random() > 0.04; // 96% success rate
                
                if (success) {
                    resolve({
                        success: true,
                        transactionId: 'rzp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        amount: paymentData.amount,
                        currency: paymentData.currency || 'INR',
                        gateway: 'razorpay',
                        timestamp: new Date().toISOString(),
                        paymentMethod: paymentData.paymentMethod,
                        fees: paymentData.amount * 0.02 // Razorpay fees
                    });
                } else {
                    resolve({
                        success: false,
                        error: 'Payment failed',
                        errorCode: 'payment_failed'
                    });
                }
            }, 1800);
        });
    }

    // Create Razorpay order (simulation)
    async createOrder(amount, currency = 'INR') {
        return {
            orderId: 'order_' + Math.random().toString(36),
            amount: amount * 100, // Razorpay uses paise
            currency: currency
        };
    }
}

// Square Payment Gateway
class SquareGateway extends PaymentGateway {
    constructor() {
        super('Square', '⬜');
        this.applicationId = 'sq_demo_app_id';
    }

    async processPayment(paymentData) {
        this.validatePaymentData(paymentData);
        
        return new Promise((resolve) => {
            // Simulate Square payment processing
            setTimeout(() => {
                const success = Math.random() > 0.06; // 94% success rate
                
                if (success) {
                    resolve({
                        success: true,
                        transactionId: 'sq_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        amount: paymentData.amount,
                        currency: paymentData.currency || 'USD',
                        gateway: 'square',
                        timestamp: new Date().toISOString(),
                        paymentMethod: paymentData.paymentMethod,
                        fees: paymentData.amount * 0.026 + 0.10 // Square fees
                    });
                } else {
                    resolve({
                        success: false,
                        error: 'Square payment declined',
                        errorCode: 'declined'
                    });
                }
            }, 2200);
        });
    }
}

// Cryptocurrency Payment Gateway (Bonus)
class CryptoGateway extends PaymentGateway {
    constructor() {
        super('Crypto Pay', '₿');
        this.supportedCoins = ['BTC', 'ETH', 'USDT', 'USDC'];
    }

    async processPayment(paymentData) {
        this.validatePaymentData(paymentData);
        
        return new Promise((resolve) => {
            // Simulate crypto payment processing
            setTimeout(() => {
                const success = Math.random() > 0.02; // 98% success rate
                
                if (success) {
                    resolve({
                        success: true,
                        transactionId: 'crypto_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        amount: paymentData.amount,
                        currency: paymentData.currency || 'USD',
                        gateway: 'crypto',
                        timestamp: new Date().toISOString(),
                        paymentMethod: 'cryptocurrency',
                        fees: paymentData.amount * 0.01, // Low crypto fees
                        blockchainHash: '0x' + Math.random().toString(16).substr(2, 64)
                    });
                } else {
                    resolve({
                        success: false,
                        error: 'Cryptocurrency transaction failed',
                        errorCode: 'crypto_error'
                    });
                }
            }, 3000); // Longer processing time for crypto
        });
    }
}

// Initialize payment gateway manager
const paymentGatewayManager = new PaymentGatewayManager();