// Modal functionality (for index.html)
document.addEventListener('DOMContentLoaded', () => {
    // Modal elements
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    
    if (loginModal && registerModal) {
        setupModals();
    } else if (document.querySelector('.dashboard')) {
        setupDashboard();
    }
});

function setupModals() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const getStartedBtn = document.getElementById('getStartedBtn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const closeLogin = document.getElementById('closeLogin');
    const closeRegister = document.getElementById('closeRegister');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    loginBtn.addEventListener('click', () => loginModal.style.display = 'flex');
    registerBtn.addEventListener('click', () => registerModal.style.display = 'flex');
    getStartedBtn.addEventListener('click', () => registerModal.style.display = 'flex');
    closeLogin.addEventListener('click', () => loginModal.style.display = 'none');
    closeRegister.addEventListener('click', () => registerModal.style.display = 'none');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
            window.location.href = 'dashboard.html';
        } else {
            alert('Login failed!');
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        if (response.ok) {
            window.location.href = 'dashboard.html';
        } else {
            alert('Registration failed!');
        }
    });
}

function setupDashboard() {
    const logoutBtn = document.getElementById('logoutBtn');
    const transactionForm = document.getElementById('transactionForm');
    let transactions = [];

    logoutBtn.addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = 'index.html';
    });

    transactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const transaction = {
            type: document.getElementById('transactionType').value,
            category: document.getElementById('category').value,
            amount: parseFloat(document.getElementById('amount').value),
            date: document.getElementById('date').value
        };

        const response = await fetch('/api/transaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction)
        });

        if (response.ok) {
            transactions.push(transaction);
            updateDashboard();
            generateRecommendations();
        }
    });

    function updateDashboard() {
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;
        document.getElementById('totalExpenses').textContent = `$${totalExpenses.toFixed(2)}`;
        document.getElementById('netSavings').textContent = `$${(totalIncome - totalExpenses).toFixed(2)}`;

        const tableBody = document.getElementById('transactionsTable');
        tableBody.innerHTML = transactions.map(t => `
            <tr>
                <td>${t.type}</td>
                <td>${t.category}</td>
                <td>$${t.amount.toFixed(2)}</td>
                <td>${t.date}</td>
            </tr>
        `).join('');
    }

    function generateRecommendations() {
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const recommendations = [];
        if (totalExpenses > totalIncome * 0.8) {
            recommendations.push('Your expenses are exceeding 80% of your income. Consider reducing discretionary spending.');
        }
        if (totalIncome > 0 && totalExpenses / totalIncome < 0.5) {
            recommendations.push('Great job! You’re saving significantly. Consider investing surplus funds.');
        }

        document.getElementById('recommendationsList').innerHTML = recommendations
            .map(rec => `<li>${rec}</li>`)
            .join('');
    }

    // Load initial data
    fetch('/api/transactions')
        .then(res => res.json())
        .then(data => {
            transactions = data;
            updateDashboard();
            generateRecommendations();
        });
}
