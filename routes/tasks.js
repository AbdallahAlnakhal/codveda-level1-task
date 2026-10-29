const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// جلب مهام المستخدم الحالي (أو كل المهام لو كان Admin)
router.get('/', verifyToken, (req, res) => {
    if (req.user.role === 'admin') {
        db.all(`SELECT tasks.*, users.username FROM tasks JOIN users ON tasks.user_id = users.id`, [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    } else {
        db.all(`SELECT * FROM tasks WHERE user_id = ?`, [req.user.id], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    }
});

// إضافة مهمة جديدة
router.post('/', verifyToken, (req, res) => {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    db.run(`INSERT INTO tasks (title, user_id) VALUES (?, ?)`, [title, req.user.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, title, user_id: req.user.id });
    });
});

// تعديل مهمة
router.put('/:id', verifyToken, (req, res) => {
    const { title } = req.body;
    const taskId = req.params.id;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    db.run(`UPDATE tasks SET title = ? WHERE id = ?`, [title, taskId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Task updated successfully' });
    });
});

// حذف مهمة
router.delete('/:id', verifyToken, (req, res) => {
    const taskId = req.params.id;
    db.run(`DELETE FROM tasks WHERE id = ?`, [taskId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Task deleted successfully' });
    });
});

// مسار خاص بالـ Admin فقط (اختبار لصلاحيات الـ Admin)
router.get('/admin/stats', verifyAdmin, (req, res) => {
    db.get(`SELECT COUNT(*) as totalUsers FROM users`, [], (err, userRow) => {
        db.get(`SELECT COUNT(*) as totalTasks FROM tasks`, [], (err, taskRow) => {
            res.json({
                totalUsers: userRow.totalUsers,
                totalTasks: taskRow.totalTasks,
                message: 'Welcome Admin, full access granted!'
            });
        });
    });
});

module.exports = router;