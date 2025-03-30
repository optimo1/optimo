const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

const USERS_FILE = path.join(__dirname, 'data', 'users.json');

async function getUsers() {
    try {
        const data = await fs.readFile(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return {};
    }
}

async function saveUsers(users) {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    const users = await getUsers();
    
    if (users[email]) {
        return res.status(400).json({ error: 'User exists' });
    }

    users[email] = { name, password, transactions: [] };
    await saveUsers(users);
    req.session = { email };
    res.status(200).json({ success: true });
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const users = await getUsers();
    
    if (users[email] && users[email].password === password) {
        req.session = { email };
        res.status(200).json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.post('/api/transaction', async (req, res) => {
    if (!req.session?.email) return res.status(401).json({ error: 'Unauthorized' });
    
    const users = await getUsers();
    users[req.session.email].transactions.push(req.body);
    await saveUsers(users);
    res.status(200).json({ success: true });
});

app.get('/api/transactions', async (req, res) => {
    if (!req.session?.email) return res.status(401).json({ error: 'Unauthorized' });
    
    const users = await getUsers();
    res.json(users[req.session.email].transactions);
});

app.listen(3000, () => console.log('Server running on port 3000'));
