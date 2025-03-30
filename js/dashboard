// Dashboard Module
const dashboard = {
    // Initialize dashboard
    init() {
        this.setupEventListeners();
        this.updateDashboard();
    },

    // Setup event listeners for dashboard functionality
    setupEventListeners() {
        // Add income button
        document.getElementById('addIncomeBtn').addEventListener('click', () => {
            document.getElementById('transactionType').value = 'income';
            document.getElementById('addTransactionModal').classList.remove('hidden');
        });

        // Add expense button
        document.getElementById('addExpenseBtn').addEventListener('click', () => {
            document.getElementById('transactionType').value = 'expense';
            document.getElementById('addTransactionModal').classList.remove('hidden');
        });

        // Transaction form submission
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction();
        });
    },

    // Add new transaction
    addTransaction() {
        const type = document.getElementById('transactionType').value;
        const amount = parseFloat(document.getElementById('transactionForm').elements[1].value);
        const description = document.getElementById('transactionForm').elements[2].value;
        const date = document.getElementById('transactionForm').elements[3].value;

        const transaction = {
            id: Date.now().toString(),
            type,
            amount,
            description,
            date
        };

        // Add transaction to user's data
        auth.currentUser.transactions.push(transaction);
        
        // Update localStorage
        const users = JSON.parse(localStorage.getItem('users'));
        const userIndex = users.findIndex(user => user.id === auth.currentUser.id);
        users[userIndex] = auth.currentUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(auth.currentUser));

        // Update dashboard
        this.updateDashboard();
        document.getElementById('addTransactionModal').classList.add('hidden');
        document.getElementById('transactionForm').reset();
    },

    // Update dashboard display
    updateDashboard() {
        if (!auth.currentUser) return;

        const transactions = auth.currentUser.transactions;
        const income = this.calculateTotal(transactions, 'income');
        const expenses = this.calculateTotal(transactions, 'expense');
        const balance = income - expenses;

        // Update totals
        document.getElementById('totalIncome').textContent = this.formatCurrency(income);
        document.getElementById('totalExpenses').textContent = this.formatCurrency(expenses);
        document.getElementById('currentBalance').textContent = this.formatCurrency(balance);

        // Update transactions list
        this.updateTransactionsList(transactions);

        // Update AI recommendations
        this.updateAIRecommendations(income, expenses, balance);
    },

    // Calculate total for a specific transaction type
    calculateTotal(transactions, type) {
        return transactions
            .filter(t => t.type === type)
            .reduce((sum, t) => sum + t.amount, 0);
    },

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    // Update transactions list
    updateTransactionsList(transactions) {
        const container = document.getElementById('transactionsList');
        container.innerHTML = '';

        // Sort transactions by date (newest first)
        const sortedTransactions = [...transactions].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );

        sortedTransactions.forEach(transaction => {
            const transactionElement = document.createElement('div');
            transactionElement.className = `transaction ${transaction.type}`;
            transactionElement.innerHTML = `
                <div class="transaction-info">
                    <span class="description">${transaction.description}</span>
                    <span class="date">${new Date(transaction.date).toLocaleDateString()}</span>
                </div>
                <span class="amount">${this.formatCurrency(transaction.amount)}</span>
            `;
            container.appendChild(transactionElement);
        });
    },

    // Update AI recommendations
    updateAIRecommendations(income, expenses, balance) {
        const recommendations = document.getElementById('aiRecommendations');
        let recommendationsHTML = '';

        // Basic financial recommendations based on user's data
        if (balance < 0) {
            recommendationsHTML += '<p>⚠️ Your expenses exceed your income. Consider reducing non-essential expenses.</p>';
        }

        const savingsRate = (income - expenses) / income;
        if (savingsRate < 0.2) {
            recommendationsHTML += '<p>💡 Try to save at least 20% of your income for future goals.</p>';
        }

        if (expenses > income * 0.5) {
            recommendationsHTML += '<p>📊 Your expenses are high relative to your income. Look for areas to cut back.</p>';
        }

        if (income > 0 && expenses === 0) {
            recommendationsHTML += '<p>🎯 Great job! You have no expenses this period. Consider setting up an emergency fund.</p>';
        }

        recommendations.innerHTML = recommendationsHTML || '<p>Keep up the good work! Your finances look healthy.</p>';
    }
};

// Initialize dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    dashboard.init();
}); 
