const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// استيراد مسارات الـ API
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

app.use('/api', authRoutes);
app.use('/api/tasks', taskRoutes);

app.listen(PORT, () => {
    console.log(`Enterprise Server is running at http://localhost:${PORT}`);
});