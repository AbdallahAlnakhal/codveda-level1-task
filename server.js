const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory Database for Level 1 Tasks
let tasks = [
    { id: 1, title: 'Environment Setup & Git Init', completed: true },
    { id: 2, title: 'Build Express REST API', completed: true }
];

// GET: Fetch all tasks
app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

// POST: Add new task
app.post('/api/tasks', (req, res) => {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    
    const newTask = { id: tasks.length + 1, title, completed: false };
    tasks.push(newTask);
    res.status(201).json(newTask);
});

// DELETE: Remove task
app.delete('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    tasks = tasks.filter(t => t.id !== taskId);
    res.json({ message: 'Task deleted successfully' });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});