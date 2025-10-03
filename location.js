// Location and Address Management
class LocationManager {
    constructor() {
        this.userLocation = null;
        this.savedAddresses = this.loadAddresses();
    }

    // Load saved addresses from localStorage
    loadAddresses() {
        const saved = localStorage.getItem('userAddresses');
        return saved ? JSON.parse(saved) : [];
    }

    // Save addresses to localStorage
    saveAddresses() {
        localStorage.setItem('userAddresses', JSON.stringify(this.savedAddresses));
    }

    // Get user's current location
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    this.userLocation = { latitude, longitude };
                    
                    try {
                        // Reverse geocoding to get address
                        const address = await this.reverseGeocode(latitude, longitude);
                        this.userLocation.address = address;
                        resolve(this.userLocation);
                    } catch (error) {
                        // If reverse geocoding fails, still return coordinates
                        resolve(this.userLocation);
                    }
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            );
        });
    }

    // Reverse geocoding using a free service
    async reverseGeocode(lat, lng) {
        try {
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
            const data = await response.json();
            
            return {
                street: data.locality || '',
                city: data.city || data.principalSubdivision || '',
                state: data.principalSubdivision || '',
                country: data.countryName || '',
                postalCode: data.postcode || '',
                fullAddress: data.display_name || `${lat}, ${lng}`
            };
        } catch (error) {
            console.error('Reverse geocoding failed:', error);
            return {
                street: '',
                city: '',
                state: '',
                country: '',
                postalCode: '',
                fullAddress: `${lat}, ${lng}`
            };
        }
    }

    // Add new address
    addAddress(address) {
        const newAddress = {
            id: Date.now(),
            ...address,
            isDefault: this.savedAddresses.length === 0
        };
        this.savedAddresses.push(newAddress);
        this.saveAddresses();
        return newAddress;
    }

    // Update address
    updateAddress(id, updatedAddress) {
        const index = this.savedAddresses.findIndex(addr => addr.id === id);
        if (index !== -1) {
            this.savedAddresses[index] = { ...this.savedAddresses[index], ...updatedAddress };
            this.saveAddresses();
            return this.savedAddresses[index];
        }
        return null;
    }

    // Delete address
    deleteAddress(id) {
        this.savedAddresses = this.savedAddresses.filter(addr => addr.id !== id);
        this.saveAddresses();
    }

    // Set default address
    setDefaultAddress(id) {
        this.savedAddresses.forEach(addr => {
            addr.isDefault = addr.id === id;
        });
        this.saveAddresses();
    }

    // Get default address
    getDefaultAddress() {
        return this.savedAddresses.find(addr => addr.isDefault) || this.savedAddresses[0];
    }
}

// Initialize location manager
const locationManager = new LocationManager();