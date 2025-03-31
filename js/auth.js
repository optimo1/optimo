// Authentication Module
const auth = {
    currentUser: null,
    users: JSON.parse(localStorage.getItem('users')) || {},

    // Initialize authentication state
    init() {
        console.log('Auth init'); // Debug
        this.checkCurrentUser();
        this.setupEventListeners();
    },

    // Check if user is logged in
    isLoggedIn() {
        return !!this.currentUser;
    },

    // Check current user from localStorage
    checkCurrentUser() {
        const userEmail = localStorage.getItem('currentUserEmail');
        if (userEmail) {
            const users = JSON.parse(localStorage.getItem('users')) || {};
            if (users[userEmail]) {
                this.currentUser = users[userEmail];
                this.updateUIForLoggedInUser();
            }
        }
    },

    // Setup event listeners
    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const logoutBtn = document.getElementById('logoutBtn');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        } else {
            console.error('Login form not found');
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        } else {
            console.error('Register form not found');
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        } else {
            console.error('Logout button not found');
        }

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    },

    // Handle login
    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const users = JSON.parse(localStorage.getItem('users')) || {};
        const user = users[email];

        if (user && user.password === password) {
            // Ensure user has transactions array
            if (!user.transactions) {
                user.transactions = [];
            }
            
            this.currentUser = user;
            localStorage.setItem('currentUserEmail', email);
            
            // Update users in localStorage to ensure we have the latest data
            users[email] = user;
            localStorage.setItem('users', JSON.stringify(users));

            this.updateUIForLoggedInUser();
            document.getElementById('loginModal').classList.add('hidden');
            document.getElementById('loginForm').reset();

            // Update dashboard if it exists
            if (window.dashboard) {
                window.dashboard.updateDashboard();
            }
        } else {
            alert('Invalid email or password');
        }
    },

    // Handle registration
    async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName')?.value;
        const email = document.getElementById('registerEmail')?.value;
        const password = document.getElementById('registerPassword')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        console.log('Register attempt:', email); // Debug

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (this.register(name, email, password)) {
            const registerModal = document.getElementById('registerModal');
            if (registerModal) registerModal.classList.add('hidden');
            this.updateUIForLoggedInUser();
            if (window.main) {
                window.main.showDashboardModal();
            }
        } else {
            alert('Email already registered');
        }
    },

    // Handle logout
    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('currentUserEmail');
        this.updateUIForLoggedOutUser();
    },

    // Login user
    login(email, password) {
        if (this.users[email] && this.users[email].password === password) { // Simplified for demo
            this.currentUser = this.users[email];
            localStorage.setItem('currentUser', email);
            return true;
        }
        return false;
    },

    // Register new user
    register(name, email, password) {
        if (this.users[email]) {
            return false;
        }

        this.users[email] = {
            name,
            email,
            password,
            transactions: []
        };

        localStorage.setItem('users', JSON.stringify(this.users));
        this.currentUser = this.users[email];
        localStorage.setItem('currentUserEmail', email);
        return true;
    },

    // Logout user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUIForLoggedOutUser();
    },

    // Update UI for logged in user
    updateUIForLoggedInUser() {
        if (this.currentUser) {
            const userName = document.getElementById('userName');
            if (userName) userName.textContent = this.currentUser.name;
        }

        // Update navigation
        document.querySelectorAll('.nav-links a').forEach(link => {
            if (link.getAttribute('href') === '#dashboard') {
                link.style.display = 'block';
            }
        });

        // Update auth buttons
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.classList.remove('hidden');
    },

    // Update UI for logged out user
    updateUIForLoggedOutUser() {
        const userName = document.getElementById('userName');
        if (userName) userName.textContent = 'Guest';

        // Update navigation
        document.querySelectorAll('.nav-links a').forEach(link => {
            if (link.getAttribute('href') === '#dashboard') {
                link.style.display = 'none';
            }
        });

        // Update auth buttons
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.classList.add('hidden');
    },

    // Hash password using SHA-256
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    },

    // Verify password
    async verifyPassword(password, hashedPassword) {
        const hashedInput = await this.hashPassword(password);
        return hashedInput === hashedPassword;
    }
};

// Initialize authentication when the page loads
document.addEventListener('DOMContentLoaded', () => {
    auth.init();
});

window.auth = auth; 
