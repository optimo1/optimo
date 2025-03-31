// Main Application Module
const app = {
    init() {
        this.setupNavigation();
        this.setupModals();
        this.handleInitialHash();
    },

    setupNavigation() {
        // Handle navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
            });
        });

        // Handle Get Started button
        const getStartedBtn = document.getElementById('getStartedBtn');
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', () => {
                if (auth.currentUser) {
                    this.showDashboardModal();
                } else {
                    const registerModal = document.getElementById('registerModal');
                    if (registerModal) registerModal.classList.remove('hidden');
                }
            });
        }

        // Handle hash changes
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.substring(1);
            this.scrollToSection(hash);
        });
    },

    setupModals() {
        // Setup login button
        const loginBtn = document.getElementById('loginBtn');
        const loginModal = document.getElementById('loginModal');
        if (loginBtn && loginModal) {
            loginBtn.addEventListener('click', () => {
                loginModal.classList.remove('hidden');
            });
        }

        // Setup register button
        const registerBtn = document.getElementById('registerBtn');
        const registerModal = document.getElementById('registerModal');
        if (registerBtn && registerModal) {
            registerBtn.addEventListener('click', () => {
                registerModal.classList.remove('hidden');
            });
        }

        // Setup close buttons
        document.querySelectorAll('.close, .close-modal').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                const modal = closeBtn.closest('.modal');
                if (modal) modal.classList.add('hidden');
            });
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.add('hidden');
            }
        });
    },

    showDashboardModal() {
        const dashboardModal = document.getElementById('dashboardModal');
        if (dashboardModal) {
            dashboardModal.classList.remove('hidden');
            if (dashboard && auth.currentUser) {
                dashboard.updateDashboard();
            }
        }
    },

    scrollToSection(sectionId) {
        if (sectionId === 'dashboard') {
            if (auth.currentUser) {
                this.showDashboardModal();
            } else {
                const loginModal = document.getElementById('loginModal');
                if (loginModal) loginModal.classList.remove('hidden');
            }
        } else {
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        }
    },

    handleInitialHash() {
        const hash = window.location.hash.substring(1);
        if (hash && hash !== 'dashboard') { // Only scroll to non-dashboard sections on initial load
            this.scrollToSection(hash);
        }
        // Remove automatic dashboard opening on page load
    }
};

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

window.app = app; 
