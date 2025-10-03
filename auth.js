// User Authentication System
class AuthManager {
    constructor() {
        this.currentUser = this.loadCurrentUser();
        this.users = this.loadUsers();
        this.otpStorage = new Map();
        this.updateAuthUI();
    }

    // Load current user from localStorage
    loadCurrentUser() {
        const saved = localStorage.getItem('currentUser');
        return saved ? JSON.parse(saved) : null;
    }

    // Save current user to localStorage
    saveCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.updateAuthUI();
    }

    // Load all users from localStorage
    loadUsers() {
        const saved = localStorage.getItem('allUsers');
        return saved ? JSON.parse(saved) : [];
    }

    // Save users to localStorage
    saveUsers() {
        localStorage.setItem('allUsers', JSON.stringify(this.users));
    }

    // Generate OTP
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Send OTP (simulation)
    async sendOTP(mobileNumber) {
        return new Promise((resolve) => {
            const otp = this.generateOTP();
            
            // Store OTP with expiry (5 minutes)
            this.otpStorage.set(mobileNumber, {
                otp: otp,
                expiry: Date.now() + 5 * 60 * 1000,
                attempts: 0
            });

            // Simulate SMS sending delay
            setTimeout(() => {
                console.log(`OTP for ${mobileNumber}: ${otp}`); // In real app, this would be sent via SMS
                resolve({
                    success: true,
                    message: `OTP sent to ${mobileNumber}`,
                    // For demo purposes, show OTP in alert
                    otp: otp
                });
            }, 1000);
        });
    }

    // Verify OTP
    verifyOTP(mobileNumber, enteredOTP) {
        const otpData = this.otpStorage.get(mobileNumber);
        
        if (!otpData) {
            return { success: false, message: 'OTP not found. Please request a new OTP.' };
        }

        if (Date.now() > otpData.expiry) {
            this.otpStorage.delete(mobileNumber);
            return { success: false, message: 'OTP has expired. Please request a new OTP.' };
        }

        otpData.attempts++;
        
        if (otpData.attempts > 3) {
            this.otpStorage.delete(mobileNumber);
            return { success: false, message: 'Too many attempts. Please request a new OTP.' };
        }

        if (otpData.otp === enteredOTP) {
            this.otpStorage.delete(mobileNumber);
            return { success: true, message: 'OTP verified successfully!' };
        }

        return { success: false, message: 'Invalid OTP. Please try again.' };
    }

    // Register or login user
    async authenticateUser(mobileNumber, name = '') {
        let user = this.users.find(u => u.mobile === mobileNumber);
        
        if (!user && name) {
            // Create new user
            user = {
                id: Date.now(),
                mobile: mobileNumber,
                name: name,
                email: '',
                joinDate: new Date().toISOString(),
                orders: [],
                addresses: [],
                paymentMethods: []
            };
            this.users.push(user);
            this.saveUsers();
        } else if (!user) {
            return { success: false, message: 'User not found. Please provide your name to create an account.' };
        }

        this.saveCurrentUser(user);
        return { success: true, user: user, message: 'Login successful!' };
    }

    // Logout user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateAuthUI();
        
        // Clear cart and redirect to home
        cart.clearCart();
        this.closeAuthModal();
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Update user profile
    updateUserProfile(updates) {
        if (this.currentUser) {
            Object.assign(this.currentUser, updates);
            
            // Update in users array
            const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
            if (userIndex !== -1) {
                this.users[userIndex] = this.currentUser;
                this.saveUsers();
            }
            
            this.saveCurrentUser(this.currentUser);
            return true;
        }
        return false;
    }

    // Update auth UI
    updateAuthUI() {
        const authButton = document.getElementById('authButton');
        const userMenu = document.getElementById('userMenu');
        
        if (this.currentUser) {
            if (authButton) {
                authButton.innerHTML = `
                    <i class="fas fa-user-circle"></i>
                    <span>${this.currentUser.name || this.currentUser.mobile}</span>
                `;
                authButton.onclick = () => this.toggleUserMenu();
            }
            
            if (userMenu) {
                userMenu.style.display = 'block';
            }
        } else {
            if (authButton) {
                authButton.innerHTML = `
                    <i class="fas fa-sign-in-alt"></i>
                    <span>Login</span>
                `;
                authButton.onclick = () => this.showAuthModal();
            }
            
            if (userMenu) {
                userMenu.style.display = 'none';
            }
        }
    }

    // Show authentication modal
    showAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            this.renderAuthStep('mobile');
        }
    }

    // Close authentication modal
    closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Render authentication steps
    renderAuthStep(step, data = {}) {
        const content = document.getElementById('authContent');
        
        switch (step) {
            case 'mobile':
                content.innerHTML = `
                    <div class="auth-step">
                        <h3>Login / Sign Up</h3>
                        <p>Enter your mobile number to continue</p>
                        
                        <form id="mobileForm">
                            <div class="input-group">
                                <input type="tel" id="mobileInput" placeholder="Enter mobile number" 
                                       pattern="[0-9]{10}" maxlength="10" required>
                            </div>
                            <div class="input-group" id="nameGroup" style="display: none;">
                                <input type="text" id="nameInput" placeholder="Enter your full name">
                            </div>
                            <button type="submit" class="btn btn-primary auth-btn">
                                Send OTP
                            </button>
                        </form>
                        
                        <p class="auth-note">
                            We'll send you a verification code via SMS
                        </p>
                    </div>
                `;
                
                document.getElementById('mobileForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleMobileSubmit();
                });
                break;
                
            case 'otp':
                content.innerHTML = `
                    <div class="auth-step">
                        <h3>Verify OTP</h3>
                        <p>Enter the 6-digit code sent to ${data.mobile}</p>
                        
                        <form id="otpForm">
                            <div class="otp-inputs">
                                <input type="text" class="otp-input" maxlength="1" pattern="[0-9]">
                                <input type="text" class="otp-input" maxlength="1" pattern="[0-9]">
                                <input type="text" class="otp-input" maxlength="1" pattern="[0-9]">
                                <input type="text" class="otp-input" maxlength="1" pattern="[0-9]">
                                <input type="text" class="otp-input" maxlength="1" pattern="[0-9]">
                                <input type="text" class="otp-input" maxlength="1" pattern="[0-9]">
                            </div>
                            
                            <button type="submit" class="btn btn-primary auth-btn">
                                Verify OTP
                            </button>
                        </form>
                        
                        <div class="auth-actions">
                            <button class="btn btn-outline resend-btn" onclick="authManager.resendOTP('${data.mobile}')">
                                Resend OTP
                            </button>
                            <button class="btn btn-outline" onclick="authManager.renderAuthStep('mobile')">
                                Change Number
                            </button>
                        </div>
                        
                        <p class="auth-note demo-note">
                            <strong>Demo OTP: ${data.otp}</strong><br>
                            In production, this would be sent via SMS
                        </p>
                    </div>
                `;
                
                this.setupOTPInputs();
                document.getElementById('otpForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleOTPSubmit(data.mobile, data.name);
                });
                break;
        }
    }

    // Handle mobile number submission
    async handleMobileSubmit() {
        const mobile = document.getElementById('mobileInput').value;
        const name = document.getElementById('nameInput').value;
        
        if (!/^[0-9]{10}$/.test(mobile)) {
            alert('Please enter a valid 10-digit mobile number');
            return;
        }

        const btn = document.querySelector('.auth-btn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending OTP...';
        btn.disabled = true;

        try {
            const result = await this.sendOTP(mobile);
            if (result.success) {
                this.renderAuthStep('otp', { mobile, name, otp: result.otp });
            }
        } catch (error) {
            alert('Failed to send OTP. Please try again.');
        } finally {
            btn.innerHTML = 'Send OTP';
            btn.disabled = false;
        }
    }

    // Handle OTP submission
    async handleOTPSubmit(mobile, name) {
        const otpInputs = document.querySelectorAll('.otp-input');
        const otp = Array.from(otpInputs).map(input => input.value).join('');
        
        if (otp.length !== 6) {
            alert('Please enter complete OTP');
            return;
        }

        const btn = document.querySelector('.auth-btn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
        btn.disabled = true;

        const verifyResult = this.verifyOTP(mobile, otp);
        
        if (verifyResult.success) {
            const authResult = await this.authenticateUser(mobile, name);
            if (authResult.success) {
                cart.showSuccessMessage(authResult.message);
                this.closeAuthModal();
            } else {
                alert(authResult.message);
            }
        } else {
            alert(verifyResult.message);
        }

        btn.innerHTML = 'Verify OTP';
        btn.disabled = false;
    }

    // Setup OTP inputs
    setupOTPInputs() {
        const inputs = document.querySelectorAll('.otp-input');
        
        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (e.target.value && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    inputs[index - 1].focus();
                }
            });
        });
    }

    // Resend OTP
    async resendOTP(mobile) {
        const btn = document.querySelector('.resend-btn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resending...';
        btn.disabled = true;

        try {
            const result = await this.sendOTP(mobile);
            if (result.success) {
                cart.showSuccessMessage('OTP resent successfully!');
                // Update demo OTP display
                const demoNote = document.querySelector('.demo-note');
                if (demoNote) {
                    demoNote.innerHTML = `
                        <strong>Demo OTP: ${result.otp}</strong><br>
                        In production, this would be sent via SMS
                    `;
                }
            }
        } catch (error) {
            alert('Failed to resend OTP. Please try again.');
        } finally {
            btn.innerHTML = 'Resend OTP';
            btn.disabled = false;
        }
    }

    // Toggle user menu
    toggleUserMenu() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        }
    }

    // Show user profile
    showUserProfile() {
        alert('User profile feature coming soon!');
    }

    // Show order history
    showOrderHistory() {
        if (orderHistoryManager) {
            orderHistoryManager.showOrderHistory();
        }
    }
}

// Initialize auth manager
const authManager = new AuthManager();