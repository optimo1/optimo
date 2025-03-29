// Authentication Module
const auth = {
    currentUser: null,
    users: JSON.parse(localStorage.getItem('users')) || [],

    // Initialize authentication state
    init() {
        this.checkAuthState();
        this.setupEventListeners();
    },

    // Check if user is logged in
    checkAuthState() {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            this.currentUser = JSON.parse(currentUser);
            this.updateUIForLoggedInUser();
        }
    },

    // Setup event listeners for auth buttons and forms
    setupEventListeners() {
        // Login button
        document.getElementById('loginBtn').addEventListener('click', () => {
            document.getElementById('loginModal').classList.remove('hidden');
        });

        // Register button
        document.getElementById('registerBtn').addEventListener('click', () => {
            document.getElementById('registerModal').classList.remove('hidden');
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Close buttons for modals
        document.querySelectorAll('.close').forEach(button => {
            button.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.add('hidden');
            });
        });

        // Login form submission
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.elements[0].value;
            const password = e.target.elements[1].value;
            this.login(email, password);
        });

        // Register form submission
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = e.target.elements[0].value;
            const email = e.target.elements[1].value;
            const password = e.target.elements[2].value;
            const confirmPassword = e.target.elements[3].value;
            this.register(name, email, password, confirmPassword);
        });
    },

    // Register new user
    register(name, email, password, confirmPassword) {
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (this.users.find(user => user.email === email)) {
            alert('Email already registered');
            return;
        }

        const user = {
            id: Date.now().toString(),
            name,
            email,
            password: this.hashPassword(password),
            transactions: []
        };

        this.users.push(user);
        localStorage.setItem('users', JSON.stringify(this.users));
        this.login(email, password);
    },

    // Login user
    login(email, password) {
        const user = this.users.find(user => 
            user.email === email && 
            user.password === this.hashPassword(password)
        );

        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.updateUIForLoggedInUser();
            document.getElementById('loginModal').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
            window.location.hash = '#dashboard';
        } else {
            alert('Invalid email or password');
        }
    },

    // Logout user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUIForLoggedOutUser();
        window.location.hash = '#home';
    },

    // Update UI for logged in user
    updateUIForLoggedInUser() {
        document.getElementById('loginBtn').classList.add('hidden');
        document.getElementById('registerBtn').classList.add('hidden');
        document.getElementById('logoutBtn').classList.remove('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
    },

    // Update UI for logged out user
    updateUIForLoggedOutUser() {
        document.getElementById('loginBtn').classList.remove('hidden');
        document.getElementById('registerBtn').classList.remove('hidden');
        document.getElementById('logoutBtn').classList.add('hidden');
        document.getElementById('dashboard').classList.add('hidden');
    },

    // Simple password hashing (in production, use a proper hashing algorithm)
    hashPassword(password) {
        return btoa(password);
    }
};

// Initialize authentication when the page loads
document.addEventListener('DOMContentLoaded', () => {
    auth.init();
}); 
