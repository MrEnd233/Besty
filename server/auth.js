const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'monopoly-secret-key-2024-chelyabinsk';
const JWT_EXPIRES_IN = '24h';

function register(username, password, email = null) {
    if (!username || username.trim().length < 3) return { success: false, message: 'Логин должен быть минимум 3 символа' };
    if (username.trim().length > 20) return { success: false, message: 'Логин не больше 20 символов' };
    if (!password || password.length < 4) return { success: false, message: 'Пароль минимум 4 символа' };
    
    const existing = db.getUserByUsername(username.trim());
    if (existing) return { success: false, message: 'Пользователь уже существует' };
    
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const user = db.createUser(username.trim(), passwordHash, email);
    const token = generateToken(user.id, user.username);
    
    return { success: true, message: 'Регистрация успешна!', user: { id: user.id, username: user.username, avatar: user.avatar, color: user.color }, token };
}

function login(username, password) {
    const user = db.getUserByUsername(username);
    if (!user) return { success: false, message: 'Неверный логин или пароль' };
    if (!bcrypt.compareSync(password, user.password)) return { success: false, message: 'Неверный логин или пароль' };
    
    db.updateLastLogin(user.id);
    const token = generateToken(user.id, user.username);
    return { success: true, message: 'Вход выполнен!', user: { id: user.id, username: user.username, avatar: user.avatar, color: user.color, email: user.email, created_at: user.created_at }, token };
}

function guestLogin(username) {
    const safeUsername = (username || 'Гость').trim().slice(0, 20) || 'Гость';
    const guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const token = jwt.sign({ userId: guestId, username: safeUsername, isGuest: true }, JWT_SECRET, { expiresIn: '12h' });
    return { success: true, user: { id: guestId, username: safeUsername, avatar: '🚗', color: '#e53935', isGuest: true }, token };
}

function generateToken(userId, username) {
    return jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
    try { return jwt.verify(token, JWT_SECRET); } catch (e) { return null; }
}

function getProfile(userId) {
    const user = db.getUserById(userId);
    if (!user) return null;
    const achievements = db.getUserAchievements(userId);
    return { id: user.id, username: user.username, avatar: user.avatar, color: user.color, email: user.email, created_at: user.created_at, achievements_count: achievements.length };
}

module.exports = { register, login, guestLogin, verifyToken, getProfile };