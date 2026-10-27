const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1️⃣ إعداد وإشراك قاعدة البيانات SQLite
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        createTables();
    }
});

// إنشاء الجداول (المستخدمين والمهام)
function createTables() {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        user_id INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
}

// 2️⃣ مسارات المصادقة (Authentication Endpoints)

// تسجيل حساب جديد
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function (err) {
            if (err) {
                return res.status(400).json({ error: 'Username already exists' });
            }
            res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// تسجيل الدخول
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err || !user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        res.json({ message: 'Login successful', userId: user.id, username: user.username });
    });
});

// 3️⃣ مسارات إدارة المهام (Tasks Endpoints Linked to Database)

// جلب مهام مستخدم معين
app.get('/api/tasks/:userId', (req, res) => {
    const userId = req.params.userId;
    db.all(`SELECT * FROM tasks WHERE user_id = ?`, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// إضافة مهمة
app.post('/api/tasks', (req, res) => {
    const { title, userId } = req.body;
    if (!title || !userId) {
        return res.status(400).json({ error: 'Title and userId are required' });
    }

    db.run(`INSERT INTO tasks (title, user_id) VALUES (?, ?)`, [title, userId], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, title, user_id: userId });
    });
});

// حذف مهمة
app.delete('/api/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    db.run(`DELETE FROM tasks WHERE id = ?`, [taskId], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Task deleted successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});