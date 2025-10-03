// Enhanced Checkout System
class CheckoutManager {
    constructor() {
        this.currentStep = 1;
        this.checkoutData = {
            items: [],
            shippingAddress: null,
            paymentMethod: null,
            total: 0
        };
    }

    // Initialize checkout process
    initializeCheckout(cartItems) {
        this.checkoutData.items = cartItems;
        this.checkoutData.total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        this.showCheckoutModal();
    }

    // Show checkout modal
    showCheckoutModal() {
        const modal = document.getElementById('checkoutModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            this.renderCheckoutStep();
        }
    }

    // Close checkout modal
    closeCheckoutModal() {
        const modal = document.getElementById('checkoutModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            this.currentStep = 1;
        }
    }

    // Render current checkout step
    renderCheckoutStep() {
        const stepContent = document.getElementById('checkoutStepContent');
        const stepIndicator = document.getElementById('checkoutSteps');
        
        // Update step indicators
        stepIndicator.innerHTML = `
            <div class="step ${this.currentStep >= 1 ? 'active' : ''} ${this.currentStep > 1 ? 'completed' : ''}">
                <span class="step-number">1</span>
                <span class="step-label">Address</span>
            </div>
            <div class="step ${this.currentStep >= 2 ? 'active' : ''} ${this.currentStep > 2 ? 'completed' : ''}">
                <span class="step-number">2</span>
                <span class="step-label">Payment</span>
            </div>
            <div class="step ${this.currentStep >= 3 ? 'active' : ''}">
                <span class="step-number">3</span>
                <span class="step-label">Review</span>
            </div>
        `;

        // Render step content
        switch (this.currentStep) {
            case 1:
                this.renderAddressStep(stepContent);
                break;
            case 2:
                this.renderPaymentStep(stepContent);
                break;
            case 3:
                this.renderReviewStep(stepContent);
                break;
        }
    }

    // Render address selection step
    renderAddressStep(container) {
        const savedAddresses = locationManager.savedAddresses;
        
        container.innerHTML = `
            <div class="checkout-step-content">
                <h3>Shipping Address</h3>
                
                <div class="location-section">
                    <button class="btn btn-secondary detect-location-btn" onclick="checkoutManager.detectLocation()">
                        <i class="fas fa-map-marker-alt"></i> Detect My Location
                    </button>
                </div>

                <div class="saved-addresses">
                    ${savedAddresses.length > 0 ? `
                        <h4>Saved Addresses</h4>
                        ${savedAddresses.map(addr => `
                            <div class="address-card ${addr.isDefault ? 'default' : ''}" onclick="checkoutManager.selectAddress(${addr.id})">
                                <div class="address-info">
                                    <strong>${addr.name}</strong>
                                    <p>${addr.street}, ${addr.city}, ${addr.state} ${addr.postalCode}</p>
                                    <p>${addr.phone}</p>
                                    ${addr.isDefault ? '<span class="default-badge">Default</span>' : ''}
                                </div>
                            </div>
                        `).join('')}
                    ` : ''}
                </div>

                <div class="add-new-address">
                    <button class="btn btn-outline" onclick="checkoutManager.showAddressForm()">
                        <i class="fas fa-plus"></i> Add New Address
                    </button>
                </div>

                <div class="address-form" id="addressForm" style="display: none;">
                    <h4>Add New Address</h4>
                    <form id="newAddressForm">
                        <div class="form-row">
                            <input type="text" id="addressName" placeholder="Full Name" required>
                            <input type="tel" id="addressPhone" placeholder="Phone Number" required>
                        </div>
                        <input type="text" id="addressStreet" placeholder="Street Address" required>
                        <div class="form-row">
                            <input type="text" id="addressCity" placeholder="City" required>
                            <input type="text" id="addressState" placeholder="State" required>
                        </div>
                        <div class="form-row">
                            <input type="text" id="addressPostal" placeholder="Postal Code" required>
                            <input type="text" id="addressCountry" placeholder="Country" required>
                        </div>
                        <label>
                            <input type="checkbox" id="setAsDefault"> Set as default address
                        </label>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="checkoutManager.hideAddressForm()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Address</button>
                        </div>
                    </form>
                </div>

                <div class="step-actions">
                    <button class="btn btn-primary" onclick="checkoutManager.nextStep()" ${!this.checkoutData.shippingAddress ? 'disabled' : ''}>
                        Continue to Payment
                    </button>
                </div>
            </div>
        `;

        // Add form submit handler
        const form = document.getElementById('newAddressForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveNewAddress();
            });
        }
    }

    // Render payment step
    renderPaymentStep(container) {
        container.innerHTML = `
            <div class="checkout-step-content">
                <h3>Payment Method</h3>
                
                <div class="payment-methods">
                    ${paymentManager.supportedMethods.map(method => `
                        <div class="payment-method-card" onclick="checkoutManager.selectPaymentMethod('${method.id}')">
                            <div class="payment-icon">${method.icon}</div>
                            <div class="payment-name">${method.name}</div>
                            <input type="radio" name="paymentMethod" value="${method.id}">
                        </div>
                    `).join('')}
                </div>

                <div class="payment-form" id="paymentForm" style="display: none;">
                    <!-- Payment form will be rendered based on selected method -->
                </div>

                <div class="step-actions">
                    <button class="btn btn-secondary" onclick="checkoutManager.previousStep()">Back</button>
                    <button class="btn btn-primary" onclick="checkoutManager.nextStep()" ${!this.checkoutData.paymentMethod ? 'disabled' : ''}>
                        Review Order
                    </button>
                </div>
            </div>
        `;
    }

    // Render review step
    renderReviewStep(container) {
        const { items, shippingAddress, paymentMethod, total } = this.checkoutData;
        const shipping = 5.99;
        const tax = total * 0.08;
        const finalTotal = total + shipping + tax;

        container.innerHTML = `
            <div class="checkout-step-content">
                <h3>Order Review</h3>
                
                <div class="order-summary">
                    <div class="summary-section">
                        <h4>Items (${items.length})</h4>
                        ${items.map(item => `
                            <div class="order-item">
                                <span class="item-emoji">${item.image}</span>
                                <div class="item-details">
                                    <div class="item-name">${item.title}</div>
                                    <div class="item-qty">Qty: ${item.quantity}</div>
                                </div>
                                <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="summary-section">
                        <h4>Shipping Address</h4>
                        <div class="address-summary">
                            <strong>${shippingAddress.name}</strong><br>
                            ${shippingAddress.street}<br>
                            ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}<br>
                            ${shippingAddress.phone}
                        </div>
                    </div>

                    <div class="summary-section">
                        <h4>Payment Method</h4>
                        <div class="payment-summary">
                            ${paymentMethod.name}
                            ${paymentMethod.type === 'card' ? `**** **** **** ${paymentMethod.last4}` : ''}
                        </div>
                    </div>

                    <div class="summary-section price-breakdown">
                        <div class="price-row">
                            <span>Subtotal:</span>
                            <span>$${total.toFixed(2)}</span>
                        </div>
                        <div class="price-row">
                            <span>Shipping:</span>
                            <span>$${shipping.toFixed(2)}</span>
                        </div>
                        <div class="price-row">
                            <span>Tax:</span>
                            <span>$${tax.toFixed(2)}</span>
                        </div>
                        <div class="price-row total">
                            <span><strong>Total:</strong></span>
                            <span><strong>$${finalTotal.toFixed(2)}</strong></span>
                        </div>
                    </div>
                </div>

                <div class="step-actions">
                    <button class="btn btn-secondary" onclick="checkoutManager.previousStep()">Back</button>
                    <button class="btn btn-primary place-order-btn" onclick="checkoutManager.placeOrder()">
                        <i class="fas fa-credit-card"></i> Place Order
                    </button>
                </div>
            </div>
        `;
    }

    // Detect user location
    async detectLocation() {
        const btn = document.querySelector('.detect-location-btn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detecting...';
        btn.disabled = true;

        try {
            const location = await locationManager.getCurrentLocation();
            
            if (location.address) {
                // Pre-fill form with detected address
                document.getElementById('addressStreet').value = location.address.street || '';
                document.getElementById('addressCity').value = location.address.city || '';
                document.getElementById('addressState').value = location.address.state || '';
                document.getElementById('addressPostal').value = location.address.postalCode || '';
                document.getElementById('addressCountry').value = location.address.country || '';
                
                this.showAddressForm();
                cart.showSuccessMessage('Location detected! Please verify and complete the address.');
            }
        } catch (error) {
            alert('Unable to detect location. Please enter your address manually.');
        } finally {
            btn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Detect My Location';
            btn.disabled = false;
        }
    }

    // Show address form
    showAddressForm() {
        document.getElementById('addressForm').style.display = 'block';
    }

    // Hide address form
    hideAddressForm() {
        document.getElementById('addressForm').style.display = 'none';
    }

    // Save new address
    saveNewAddress() {
        const addressData = {
            name: document.getElementById('addressName').value,
            phone: document.getElementById('addressPhone').value,
            street: document.getElementById('addressStreet').value,
            city: document.getElementById('addressCity').value,
            state: document.getElementById('addressState').value,
            postalCode: document.getElementById('addressPostal').value,
            country: document.getElementById('addressCountry').value,
            isDefault: document.getElementById('setAsDefault').checked
        };

        const newAddress = locationManager.addAddress(addressData);
        this.selectAddress(newAddress.id);
        this.hideAddressForm();
        this.renderAddressStep(document.getElementById('checkoutStepContent'));
    }

    // Select address
    selectAddress(addressId) {
        const address = locationManager.savedAddresses.find(addr => addr.id === addressId);
        if (address) {
            this.checkoutData.shippingAddress = address;
            this.renderCheckoutStep();
        }
    }

    // Select payment method
    selectPaymentMethod(methodId) {
        const method = paymentManager.supportedMethods.find(m => m.id === methodId);
        if (method) {
            this.checkoutData.paymentMethod = method;
            
            // Update radio button
            document.querySelector(`input[value="${methodId}"]`).checked = true;
            
            // Show payment form if needed
            if (methodId === 'card') {
                this.showCardForm();
            } else {
                document.getElementById('paymentForm').style.display = 'none';
            }
            
            this.renderCheckoutStep();
        }
    }

    // Show card payment form
    showCardForm() {
        const paymentForm = document.getElementById('paymentForm');
        paymentForm.innerHTML = `
            <div class="card-form">
                <h4>Card Details</h4>
                <input type="text" id="cardNumber" placeholder="Card Number" maxlength="19">
                <div class="form-row">
                    <input type="text" id="cardExpiry" placeholder="MM/YY" maxlength="5">
                    <input type="text" id="cardCvv" placeholder="CVV" maxlength="4">
                </div>
                <input type="text" id="cardName" placeholder="Cardholder Name">
            </div>
        `;
        paymentForm.style.display = 'block';

        // Add card number formatting
        document.getElementById('cardNumber').addEventListener('input', this.formatCardNumber);
        document.getElementById('cardExpiry').addEventListener('input', this.formatExpiry);
    }

    // Format card number
    formatCardNumber(e) {
        let value = e.target.value.replace(/\s/g, '');
        let formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
        e.target.value = formattedValue;
    }

    // Format expiry date
    formatExpiry(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    }

    // Navigate to next step
    nextStep() {
        if (this.currentStep < 3) {
            this.currentStep++;
            this.renderCheckoutStep();
        }
    }

    // Navigate to previous step
    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.renderCheckoutStep();
        }
    }

    // Place order
    async placeOrder() {
        const btn = document.querySelector('.place-order-btn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        btn.disabled = true;

        try {
            // Process payment
            const paymentResult = await paymentManager.processPayment({
                amount: this.checkoutData.total + 5.99 + (this.checkoutData.total * 0.08),
                method: this.checkoutData.paymentMethod
            });

            if (paymentResult.success) {
                // Create order
                const order = orderManager.createOrder({
                    items: this.checkoutData.items,
                    total: paymentResult.amount,
                    shippingAddress: this.checkoutData.shippingAddress,
                    paymentMethod: this.checkoutData.paymentMethod,
                    transactionId: paymentResult.transactionId
                });

                // Clear cart
                cart.clearCart();
                
                // Show success
                this.showOrderSuccess(order);
            } else {
                throw new Error(paymentResult.error);
            }
        } catch (error) {
            alert('Order failed: ' + error.message);
            btn.innerHTML = '<i class="fas fa-credit-card"></i> Place Order';
            btn.disabled = false;
        }
    }

    // Show order success
    showOrderSuccess(order) {
        const container = document.getElementById('checkoutStepContent');
        container.innerHTML = `
            <div class="order-success">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>Order Placed Successfully!</h2>
                <p>Thank you for your purchase. Your order has been confirmed.</p>
                
                <div class="order-details">
                    <div class="detail-row">
                        <span>Order ID:</span>
                        <span><strong>${order.id}</strong></span>
                    </div>
                    <div class="detail-row">
                        <span>Total Amount:</span>
                        <span><strong>$${order.total.toFixed(2)}</strong></span>
                    </div>
                    <div class="detail-row">
                        <span>Estimated Delivery:</span>
                        <span><strong>${new Date(order.estimatedDelivery).toLocaleDateString()}</strong></span>
                    </div>
                    <div class="detail-row">
                        <span>Tracking Number:</span>
                        <span><strong>${order.trackingNumber}</strong></span>
                    </div>
                </div>

                <div class="success-actions">
                    <button class="btn btn-primary" onclick="checkoutManager.closeCheckoutModal()">Continue Shopping</button>
                    <button class="btn btn-secondary" onclick="checkoutManager.viewOrders()">View Orders</button>
                </div>
            </div>
        `;
    }

    // View orders (placeholder)
    viewOrders() {
        alert('Order history feature coming soon!');
        this.closeCheckoutModal();
    }
}

// Initialize checkout manager
const checkoutManager = new CheckoutManager();