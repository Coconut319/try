// ============================================
// COOKIE CONSENT MANAGEMENT
// GDPR/DSGVO Compliant
// ============================================

const CookieConsent = {
    // Configuration
    config: {
        cookieName: 'synoriya_cookie_consent',
        cookieExpiry: 365, // days
        categories: {
            essential: {
                name: 'Essential',
                description: 'These cookies are required for the basic functions of the website.',
                required: true,
                enabled: true
            },
            analytics: {
                name: 'Analytics',
                description: 'These cookies help us understand how visitors use the website.',
                required: false,
                enabled: false
            }
        }
    },

    // Initialize
    init() {
        this.loadConsent();
        this.createBanner();
        this.attachEventListeners();

        // Load analytics if consent was previously given
        if (this.hasConsent('analytics')) {
            this.loadAnalytics();
        }
    },

    // Load saved consent from localStorage
    loadConsent() {
        const saved = localStorage.getItem(this.config.cookieName);
        if (saved) {
            try {
                const consent = JSON.parse(saved);
                this.config.categories.analytics.enabled = consent.analytics || false;
            } catch (e) {
                console.error('Error loading consent:', e);
            }
        }
    },

    // Save consent to localStorage
    saveConsent() {
        const consent = {
            essential: true, // Always true
            analytics: this.config.categories.analytics.enabled,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(this.config.cookieName, JSON.stringify(consent));
    },

    // Check if user has given consent for a category
    hasConsent(category) {
        return this.config.categories[category]?.enabled || false;
    },

    // Create banner HTML
    createBanner() {
        const consent = localStorage.getItem(this.config.cookieName);
        if (consent) return; // Don't show if already answered

        const banner = document.createElement('div');
        banner.className = 'cookie-consent-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Cookie Consent');
        banner.innerHTML = `
            <div class="cookie-consent-content">
                <div class="cookie-consent-text">
                    <h2 class="cookie-consent-title">🍪 Cookie Settings</h2>
                    <p class="cookie-consent-description">
                        We use cookies to provide you with the best experience on our website. 
                        Essential cookies are always active. You can choose whether to allow analytics cookies.
                        For more information, see our <a href="/privacy/">Privacy Policy</a>.
                    </p>
                </div>
                <div class="cookie-consent-buttons">
                    <button class="cookie-btn cookie-btn-accept" id="cookie-accept-all">
                        Accept All
                    </button>
                    <button class="cookie-btn cookie-btn-reject" id="cookie-reject-all">
                        Essential Only
                    </button>
                    <button class="cookie-btn cookie-btn-settings" id="cookie-settings-btn">
                        Settings
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(banner);

        // Create settings modal
        this.createSettingsModal();
    },

    // Create settings modal
    createSettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'cookie-settings-modal hidden';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-label', 'Cookie Settings');
        modal.innerHTML = `
            <div class="cookie-settings-content">
                <div class="cookie-settings-header">
                    <h2 class="cookie-settings-title">Cookie Settings</h2>
                    <button class="cookie-settings-close" aria-label="Close">&times;</button>
                </div>

                <div class="cookie-category">
                    <div class="cookie-category-header">
                        <span class="cookie-category-name">Essential</span>
                        <label class="cookie-toggle">
                            <input type="checkbox" checked disabled>
                            <span class="cookie-toggle-slider"></span>
                        </label>
                    </div>
                    <p class="cookie-category-description">
                        These cookies are required for the basic functions of the website and cannot be disabled.
                    </p>
                </div>

                <div class="cookie-category">
                    <div class="cookie-category-header">
                        <span class="cookie-category-name">Analytics</span>
                        <label class="cookie-toggle">
                            <input type="checkbox" id="analytics-toggle">
                            <span class="cookie-toggle-slider"></span>
                        </label>
                    </div>
                    <p class="cookie-category-description">
                        These cookies help us understand how visitors interact with the website by collecting information anonymously.
                    </p>
                </div>

                <div class="cookie-settings-actions">
                    <button class="cookie-btn cookie-btn-accept" id="cookie-save-settings">
                        Save Settings
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    // Attach event listeners
    attachEventListeners() {
        // Accept all button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'cookie-accept-all') {
                this.acceptAll();
            }
        });

        // Reject all button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'cookie-reject-all') {
                this.rejectAll();
            }
        });

        // Settings button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'cookie-settings-btn') {
                this.showSettings();
            }
        });

        // Close settings
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cookie-settings-close')) {
                this.hideSettings();
            }
        });

        // Save settings
        document.addEventListener('click', (e) => {
            if (e.target.id === 'cookie-save-settings') {
                this.saveSettings();
            }
        });

        // Close modal on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cookie-settings-modal')) {
                this.hideSettings();
            }
        });
    },

    // Accept all cookies
    acceptAll() {
        this.config.categories.analytics.enabled = true;
        this.saveConsent();
        this.hideBanner();
        this.loadAnalytics();
    },

    // Reject all (only essential)
    rejectAll() {
        this.config.categories.analytics.enabled = false;
        this.saveConsent();
        this.hideBanner();
    },

    // Show settings modal
    showSettings() {
        const modal = document.querySelector('.cookie-settings-modal');
        const toggle = document.getElementById('analytics-toggle');
        if (toggle) {
            toggle.checked = this.config.categories.analytics.enabled;
        }
        modal?.classList.remove('hidden');
    },

    // Hide settings modal
    hideSettings() {
        const modal = document.querySelector('.cookie-settings-modal');
        modal?.classList.add('hidden');
    },

    // Save custom settings
    saveSettings() {
        const toggle = document.getElementById('analytics-toggle');
        this.config.categories.analytics.enabled = toggle?.checked || false;
        this.saveConsent();
        this.hideSettings();
        this.hideBanner();

        if (this.config.categories.analytics.enabled) {
            this.loadAnalytics();
        } else {
            this.removeAnalytics();
        }
    },

    // Hide banner
    hideBanner() {
        const banner = document.querySelector('.cookie-consent-banner');
        if (banner) {
            banner.classList.add('hidden');
            setTimeout(() => banner.remove(), 300);
        }
    },

    // Load analytics scripts (only if consent given)
    loadAnalytics() {
        if (!this.hasConsent('analytics')) return;

        // Google Analytics 4
        // IMPORTANT: Replace 'G-XXXXXXXXXX' with your actual GA4 Measurement ID
        const gaScript = document.createElement('script');
        gaScript.async = true;
        gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
        document.head.appendChild(gaScript);

        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'G-XXXXXXXXXX', {
            'anonymize_ip': true, // GDPR compliance
            'cookie_flags': 'SameSite=None;Secure'
        });

        console.log('✅ Analytics loaded with consent');
    },

    // Remove analytics scripts
    removeAnalytics() {
        // Remove GA scripts
        const scripts = document.querySelectorAll('script[src*="googletagmanager"]');
        scripts.forEach(script => script.remove());

        // Clear dataLayer
        if (window.dataLayer) {
            window.dataLayer = [];
        }

        console.log('🚫 Analytics removed');
    },

    // Track event (only if consent given)
    trackEvent(eventName, eventParams = {}) {
        if (!this.hasConsent('analytics')) return;

        if (typeof gtag === 'function') {
            gtag('event', eventName, eventParams);
        }
    }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CookieConsent.init());
} else {
    CookieConsent.init();
}

// Export for use in other scripts
window.CookieConsent = CookieConsent;
