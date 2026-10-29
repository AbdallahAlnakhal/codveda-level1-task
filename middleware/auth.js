const jwt = require('jsonwebtoken');
const SECRET_KEY = 'codveda_super_secret_key_change_in_production'; // مفتاح سري قوي

// التحقق من صحة الـ Token
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token.' });
        }
        req.user = user; // حفظ بيانات المستخدم داخل الطلب
        next();
    });
}

// التحقق من صلاحيات المدير (Admin Role)
function verifyAdmin(req, res, next) {
    verifyToken(req, res, () => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access forbidden. Admins only.' });
        }
        next();
    });
}

module.exports = { verifyToken, verifyAdmin, SECRET_KEY };