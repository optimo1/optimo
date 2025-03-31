// Dashboard Module
const dashboard = {
    // Initialize dashboard
    init() {
        this.setupEventListeners();
        // Update dashboard if user is logged in
        if (auth.currentUser) {
            this.updateDashboard();
        }
    },

    // Setup event listeners for dashboard functionality
    setupEventListeners() {
        // Setup transaction form
        const transactionForm = document.getElementById('transactionForm');
        if (transactionForm) {
            transactionForm.addEventListener('submit', (e) => this.handleTransactionSubmit(e));
        }

        // Setup Add Income buttons
        const addIncomeButtons = document.querySelectorAll('.add-income-btn');
        addIncomeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.showTransactionModal('income'));
        });

        // Setup Add Expense buttons
        const addExpenseButtons = document.querySelectorAll('.add-expense-btn');
        addExpenseButtons.forEach(btn => {
            btn.addEventListener('click', () => this.showTransactionModal('expense'));
        });

        // Setup close buttons for modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                if (modal) {
                    modal.classList.add('hidden');
                    if (transactionForm) transactionForm.reset();
                }
            });
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.add('hidden');
                if (transactionForm) transactionForm.reset();
            }
        });

        // Setup transaction list event delegation
        const transactionsList = document.getElementById('transactionsList');
        if (transactionsList) {
            transactionsList.addEventListener('click', (e) => {
                const editBtn = e.target.closest('.edit-transaction');
                const deleteBtn = e.target.closest('.delete-transaction');
                
                if (editBtn) {
                    const transactionId = editBtn.dataset.id;
                    this.editTransaction(transactionId);
                } else if (deleteBtn) {
                    const transactionId = deleteBtn.dataset.id;
                    this.deleteTransaction(transactionId);
                }
            });
        }
    },

    showTransactionModal(type) {
        const modal = document.getElementById('addTransactionModal');
        const typeSelect = document.getElementById('transactionType');
        if (modal && typeSelect) {
            typeSelect.value = type;
            modal.classList.remove('hidden');
            const dateInput = document.getElementById('transactionDate');
            if (dateInput) {
                dateInput.value = new Date().toISOString().split('T')[0];
            }
        }
    },

    // Handle transaction submission
    handleTransactionSubmit(e) {
        e.preventDefault();
        if (!auth.currentUser) {
            alert('Please log in first');
            return;
        }

        const type = document.getElementById('transactionType').value;
        const amount = parseFloat(document.getElementById('transactionAmount').value);
        const category = document.getElementById('transactionCategory').value;
        const description = document.getElementById('transactionDescription').value;
        const date = document.getElementById('transactionDate').value;

        // Validation
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        if (!category) {
            alert('Please select a category');
            return;
        }
        if (!description) {
            alert('Please enter a description');
            return;
        }
        if (!date) {
            alert('Please select a date');
            return;
        }

        // Initialize transactions array if it doesn't exist
        if (!auth.currentUser.transactions) {
            auth.currentUser.transactions = [];
        }

        const editId = e.target.dataset.editId;
        const transaction = {
            id: editId || `transaction_${Date.now()}`,
            type,
            amount,
            category,
            description,
            date
        };

        if (editId) {
            // Update existing transaction
            const index = auth.currentUser.transactions.findIndex(t => t.id === editId);
            if (index !== -1) {
                auth.currentUser.transactions[index] = transaction;
            }
        } else {
            // Add new transaction
            auth.currentUser.transactions.push(transaction);
        }

        // Update the user data in localStorage
        const users = JSON.parse(localStorage.getItem('users')) || {};
        users[auth.currentUser.email] = auth.currentUser;
        localStorage.setItem('users', JSON.stringify(users));

        // Update the dashboard display
        this.updateDashboard();

        // Close the modal and reset the form
        const modal = document.getElementById('addTransactionModal');
        if (modal) {
            modal.classList.add('hidden');
            e.target.reset();
            delete e.target.dataset.editId;
        }

        alert(editId ? 'Transaction updated successfully!' : 'Transaction added successfully!');
    },

    // Update dashboard display
    updateDashboard() {
        if (!auth.currentUser) return;

        const transactions = auth.currentUser.transactions || [];
        const income = this.calculateTotal(transactions, 'income');
        const expenses = this.calculateTotal(transactions, 'expense');
        const balance = income - expenses;

        // Update dashboard section
        const dashboardTotalIncome = document.getElementById('totalIncome');
        const dashboardTotalExpenses = document.getElementById('totalExpenses');
        const dashboardCurrentBalance = document.getElementById('currentBalance');
        const dashboardTransactionsList = document.getElementById('transactionsList');

        if (dashboardTotalIncome) dashboardTotalIncome.textContent = this.formatCurrency(income);
        if (dashboardTotalExpenses) dashboardTotalExpenses.textContent = this.formatCurrency(expenses);
        if (dashboardCurrentBalance) dashboardCurrentBalance.textContent = this.formatCurrency(balance);
        if (dashboardTransactionsList) this.updateTransactionsList(transactions, dashboardTransactionsList);

        // Update modal section
        const modalTotalIncome = document.getElementById('modalTotalIncome');
        const modalTotalExpenses = document.getElementById('modalTotalExpenses');
        const modalNetBalance = document.getElementById('modalNetBalance');
        const modalTransactionsList = document.getElementById('modalTransactionsList');

        if (modalTotalIncome) modalTotalIncome.textContent = this.formatCurrency(income);
        if (modalTotalExpenses) modalTotalExpenses.textContent = this.formatCurrency(expenses);
        if (modalNetBalance) modalNetBalance.textContent = this.formatCurrency(balance);
        if (modalTransactionsList) this.updateTransactionsList(transactions, modalTransactionsList);

        // Update AI recommendations
        this.updateAIRecommendations(income, expenses, transactions);
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
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    },

    // Update transactions list
    updateTransactionsList(transactions, container) {
        if (!container) return;

        container.innerHTML = '';
        if (transactions.length === 0) {
            container.innerHTML = '<p class="no-transactions">No transactions yet.</p>';
            return;
        }

        // Sort transactions by date (newest first)
        const sortedTransactions = [...transactions].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );

        sortedTransactions.forEach(t => {
            const div = document.createElement('div');
            div.className = `transaction-item ${t.type}`;
            div.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-header">
                        <span class="description">${t.description}</span>
                        <span class="category">${t.category}</span>
                    </div>
                    <span class="date">${new Date(t.date).toLocaleDateString()}</span>
                </div>
                <div class="transaction-actions">
                    <span class="transaction-amount ${t.type}">${this.formatCurrency(t.amount)}</span>
                    <div class="transaction-buttons">
                        <button class="edit-transaction" data-id="${t.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-transaction" data-id="${t.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });

        // Add event listeners for edit and delete buttons
        container.querySelectorAll('.edit-transaction').forEach(button => {
            button.addEventListener('click', (e) => {
                const transactionId = e.currentTarget.dataset.id;
                this.editTransaction(transactionId);
            });
        });

        container.querySelectorAll('.delete-transaction').forEach(button => {
            button.addEventListener('click', (e) => {
                const transactionId = e.currentTarget.dataset.id;
                this.deleteTransaction(transactionId);
            });
        });
    },

    editTransaction(transactionId) {
        if (!auth.currentUser || !auth.currentUser.transactions) return;

        const transaction = auth.currentUser.transactions.find(t => t.id === transactionId);
        if (!transaction) return;

        // Show the transaction modal with pre-filled data
        const modal = document.getElementById('addTransactionModal');
        const form = document.getElementById('transactionForm');
        const typeSelect = document.getElementById('transactionType');
        const amountInput = document.getElementById('transactionAmount');
        const categoryInput = document.getElementById('transactionCategory');
        const descriptionInput = document.getElementById('transactionDescription');
        const dateInput = document.getElementById('transactionDate');

        // Pre-fill the form
        typeSelect.value = transaction.type;
        amountInput.value = transaction.amount;
        categoryInput.value = transaction.category;
        descriptionInput.value = transaction.description;
        dateInput.value = transaction.date;

        // Add transaction ID to the form for reference
        form.dataset.editId = transactionId;

        // Show the modal
        modal.classList.remove('hidden');
    },

    deleteTransaction(transactionId) {
        if (!auth.currentUser || !auth.currentUser.transactions) return;

        // Remove the transaction from the user's transactions
        auth.currentUser.transactions = auth.currentUser.transactions.filter(t => t.id !== transactionId);

        // Update the user data in localStorage
        const users = JSON.parse(localStorage.getItem('users')) || {};
        users[auth.currentUser.email] = auth.currentUser;
        localStorage.setItem('users', JSON.stringify(users));

        // Update the dashboard display
        this.updateDashboard();
    },

    // Update AI recommendations
    updateAIRecommendations(income, expenses, transactions) {
        const container = document.getElementById('recommendationsContent');
        if (!container) return;

        container.innerHTML = '<div class="loading">Loading recommendations...</div>';

        // Calculate savings rate
        const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

        // Get top expense categories
        const expenseCategories = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {});

        const topExpenses = Object.entries(expenseCategories)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);

        // Generate recommendations
        setTimeout(() => {
            let recommendations = '<div class="recommendations-content">';

            // Savings rate recommendation
            if (savingsRate < 20) {
                recommendations += `
                    <p><strong>Savings Rate:</strong> Your current savings rate is ${savingsRate.toFixed(1)}%. 
                    Consider increasing it to at least 20% for better financial security.</p>
                `;
            }

            // Top expenses recommendation
            if (topExpenses.length > 0) {
                recommendations += `
                    <p><strong>Top Expenses:</strong> Your highest spending categories are:
                    ${topExpenses.map(([category, amount]) => 
                        `${category} (${this.formatCurrency(amount)})`
                    ).join(', ')}. Review these areas for potential savings.</p>
                `;
            }

            // Budget recommendation
            if (expenses > income) {
                recommendations += `
                    <p><strong>Budget Alert:</strong> Your expenses exceed your income. 
                    Consider creating a detailed budget to track and reduce spending.</p>
                `;
            }

            recommendations += '</div>';
            container.innerHTML = recommendations;
        }, 1000);
    }
};

// Initialize dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    dashboard.init();
});

window.dashboard = dashboard; 
