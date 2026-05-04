const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

let db = null;
let dbInitPromise = null;
const DB_PATH = path.join(__dirname, 'monopoly.db');

async function getDatabase() {
    if (db) return db;
    const SQL = await initSqlJs();
    
    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }
    
    db.run('PRAGMA foreign_keys = ON');
    return db;
}

function saveDatabase() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
    }
}

function initDatabase() {
    if (dbInitPromise) return dbInitPromise;

    dbInitPromise = getDatabase().then(database => {
        db = database;
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL, email TEXT, avatar TEXT DEFAULT '🚗',
                color TEXT DEFAULT '#e53935', created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME
            )
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS games (
                id TEXT PRIMARY KEY, room_code TEXT UNIQUE,
                status TEXT DEFAULT 'waiting', created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                finished_at DATETIME, winner_id TEXT, turn_count INTEGER DEFAULT 0
            )
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS game_players (
                id INTEGER PRIMARY KEY AUTOINCREMENT, game_id TEXT NOT NULL,
                user_id TEXT, player_name TEXT NOT NULL, token TEXT DEFAULT '🚗',
                color TEXT DEFAULT '#e53935', money INTEGER DEFAULT 1500,
                position INTEGER DEFAULT 0, is_bot INTEGER DEFAULT 0,
                is_host INTEGER DEFAULT 0, jail_turns INTEGER DEFAULT 0,
                has_jail_card INTEGER DEFAULT 0, is_bankrupt INTEGER DEFAULT 0
            )
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS game_properties (
                id INTEGER PRIMARY KEY AUTOINCREMENT, game_id TEXT NOT NULL,
                position INTEGER NOT NULL, owner_index INTEGER,
                houses INTEGER DEFAULT 0, is_mortgaged INTEGER DEFAULT 0
            )
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS game_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT, game_id TEXT NOT NULL,
                turn_number INTEGER, player_name TEXT, action TEXT,
                message TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS achievements (
                id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL,
                achievement_id TEXT NOT NULL, unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS saves (
                id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL,
                slot INTEGER NOT NULL, game_state TEXT NOT NULL,
                saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, slot)
            )
        `);
        saveDatabase();
        console.log('✅ База данных инициализирована (sql.js)');
        return db;
    }).catch(error => {
        dbInitPromise = null;
        throw error;
    });

    return dbInitPromise;
}

// ==================== ПОЛЬЗОВАТЕЛИ ====================
function createUser(username, passwordHash, email = null) {
    const id = uuidv4();
    db.run('INSERT INTO users (id, username, password, email) VALUES (?,?,?,?)', [id, username, passwordHash, email]);
    saveDatabase();
    return getUserById(id);
}

function getUserByUsername(username) {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    stmt.bind([username]);
    if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return row;
    }
    stmt.free();
    return null;
}

function getUserById(id) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    stmt.bind([id]);
    if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return row;
    }
    stmt.free();
    return null;
}

function updateLastLogin(userId) {
    db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [userId]);
    saveDatabase();
}

// ==================== ИГРЫ ====================
function createGame(roomCode) {
    const id = uuidv4();
    db.run('INSERT INTO games (id, room_code) VALUES (?,?)', [id, roomCode]);
    saveDatabase();
    return id;
}

function getGameByRoomCode(code) {
    const stmt = db.prepare('SELECT * FROM games WHERE room_code = ?');
    stmt.bind([code]);
    if (stmt.step()) { const r = stmt.getAsObject(); stmt.free(); return r; }
    stmt.free(); return null;
}

function getGameById(id) {
    const stmt = db.prepare('SELECT * FROM games WHERE id = ?');
    stmt.bind([id]);
    if (stmt.step()) { const r = stmt.getAsObject(); stmt.free(); return r; }
    stmt.free(); return null;
}

function updateGameStatus(gameId, status, winnerId = null) {
    if (winnerId) {
        db.run('UPDATE games SET status=?, winner_id=?, finished_at=CURRENT_TIMESTAMP WHERE id=?', [status, winnerId, gameId]);
    } else {
        db.run('UPDATE games SET status=? WHERE id=?', [status, gameId]);
    }
    saveDatabase();
}

function incrementTurnCount(gameId) {
    db.run('UPDATE games SET turn_count = turn_count + 1 WHERE id = ?', [gameId]);
    saveDatabase();
}

// ==================== ИГРОКИ ====================
function addPlayer(gameId, userId, playerName, token, color, isBot, isHost) {
    db.run('INSERT INTO game_players (game_id, user_id, player_name, token, color, is_bot, is_host) VALUES (?,?,?,?,?,?,?)',
        [gameId, userId, playerName, token, color, isBot ? 1 : 0, isHost ? 1 : 0]);
    saveDatabase();
}

function getGamePlayers(gameId) {
    const stmt = db.prepare('SELECT * FROM game_players WHERE game_id=? ORDER BY id');
    stmt.bind([gameId]);
    const results = [];
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    return results;
}

function updatePlayerMoney(gameId, playerIndex, money) {
    const players = getGamePlayers(gameId);
    if (playerIndex < players.length) {
        db.run('UPDATE game_players SET money=? WHERE id=?', [money, players[playerIndex].id]);
        saveDatabase();
    }
}

function updatePlayerPosition(gameId, playerIndex, position) {
    const players = getGamePlayers(gameId);
    if (playerIndex < players.length) {
        db.run('UPDATE game_players SET position=? WHERE id=?', [position, players[playerIndex].id]);
        saveDatabase();
    }
}

function updatePlayerJail(gameId, playerIndex, jailTurns, hasJailCard) {
    const players = getGamePlayers(gameId);
    if (playerIndex < players.length) {
        db.run('UPDATE game_players SET jail_turns=?, has_jail_card=? WHERE id=?',
            [jailTurns, hasJailCard ? 1 : 0, players[playerIndex].id]);
        saveDatabase();
    }
}

function bankruptPlayer(gameId, playerIndex) {
    const players = getGamePlayers(gameId);
    if (playerIndex < players.length) {
        db.run('UPDATE game_players SET is_bankrupt=1, money=0 WHERE id=?', [players[playerIndex].id]);
        saveDatabase();
    }
}

// ==================== НЕДВИЖИМОСТЬ ====================
function initGameProperties(gameId) {
    for (let i = 0; i < 40; i++) {
        db.run('INSERT INTO game_properties (game_id, position) VALUES (?,?)', [gameId, i]);
    }
    saveDatabase();
}

function getGameProperties(gameId) {
    const stmt = db.prepare('SELECT * FROM game_properties WHERE game_id = ? ORDER BY position');
    stmt.bind([gameId]);
    const results = [];
    while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push({
            owner_index: row.owner_index,
            houses: row.houses,
            is_mortgaged: row.is_mortgaged
        });
    }
    stmt.free();
    return results;
}

function updatePropertyOwner(gameId, position, ownerIndex) {
    console.log(`💾 БД: Обновляем владельца клетки ${position} на игрока ${ownerIndex} в игре ${gameId}`);
    
    // Если ownerIndex null - убираем владельца
    if (ownerIndex === null || ownerIndex === undefined) {
        db.run('UPDATE game_properties SET owner_index = NULL WHERE game_id = ? AND position = ?', 
            [gameId, position]);
    } else {
        db.run('UPDATE game_properties SET owner_index = ? WHERE game_id = ? AND position = ?', 
            [ownerIndex, gameId, position]);
    }
    saveDatabase();
    
    // Проверяем, что обновилось
    const stmt = db.prepare('SELECT * FROM game_properties WHERE game_id = ? AND position = ?');
    stmt.bind([gameId, position]);
    if (stmt.step()) {
        const row = stmt.getAsObject();
        console.log(`   ✓ БД: клетка ${position} теперь принадлежит игроку ${row.owner_index}`);
    }
    stmt.free();
}

function updatePropertyHouses(gameId, position, houses) {
    db.run('UPDATE game_properties SET houses=? WHERE game_id=? AND position=?', [houses, gameId, position]);
    saveDatabase();
}

function updatePropertyMortgage(gameId, position, isMortgaged) {
    db.run('UPDATE game_properties SET is_mortgaged=? WHERE game_id=? AND position=?', [isMortgaged ? 1 : 0, gameId, position]);
    saveDatabase();
}

function resetPlayerProperties(gameId, playerIndex) {
    db.run('UPDATE game_properties SET owner_index=NULL, houses=0, is_mortgaged=0 WHERE game_id=? AND owner_index=?', [gameId, playerIndex]);
    saveDatabase();
}

// ==================== ЛОГ ====================
function addGameLog(gameId, turnNumber, playerName, action, message) {
    db.run('INSERT INTO game_log (game_id, turn_number, player_name, action, message) VALUES (?,?,?,?,?)',
        [gameId, turnNumber, playerName, action, message]);
    saveDatabase();
}

function getGameLog(gameId, limit = 50) {
    const stmt = db.prepare('SELECT * FROM game_log WHERE game_id=? ORDER BY id DESC LIMIT ?');
    stmt.bind([gameId, limit]);
    const results = [];
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    return results;
}

// ==================== ДОСТИЖЕНИЯ ====================
function unlockAchievement(userId, achievementId) {
    const stmt = db.prepare('SELECT * FROM achievements WHERE user_id=? AND achievement_id=?');
    stmt.bind([userId, achievementId]);
    if (!stmt.step()) {
        stmt.free();
        db.run('INSERT INTO achievements (user_id, achievement_id) VALUES (?,?)', [userId, achievementId]);
        saveDatabase();
        return true;
    }
    stmt.free();
    return false;
}

function getUserAchievements(userId) {
    const stmt = db.prepare('SELECT * FROM achievements WHERE user_id=?');
    stmt.bind([userId]);
    const results = [];
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    return results;
}

// ==================== СОХРАНЕНИЯ ====================
function saveGame(userId, slot, gameState) {
    db.run('INSERT OR REPLACE INTO saves (user_id, slot, game_state, saved_at) VALUES (?,?,?,CURRENT_TIMESTAMP)',
        [userId, slot, gameState]);
    saveDatabase();
}

function loadGame(userId, slot) {
    const stmt = db.prepare('SELECT * FROM saves WHERE user_id=? AND slot=?');
    stmt.bind([userId, slot]);
    if (stmt.step()) { const r = stmt.getAsObject(); stmt.free(); return r; }
    stmt.free(); return null;
}

function getUserSaves(userId) {
    const stmt = db.prepare('SELECT id, slot, saved_at FROM saves WHERE user_id=? ORDER BY slot');
    stmt.bind([userId]);
    const results = [];
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    return results;
}

function deleteSave(userId, slot) {
    db.run('DELETE FROM saves WHERE user_id=? AND slot=?', [userId, slot]);
    saveDatabase();
}

module.exports = {
    initDatabase, createUser, getUserByUsername, getUserById, updateLastLogin,
    createGame, getGameByRoomCode, getGameById, updateGameStatus, incrementTurnCount,
    addPlayer, getGamePlayers, updatePlayerMoney, updatePlayerPosition, updatePlayerJail, bankruptPlayer,
    initGameProperties, getGameProperties, updatePropertyOwner, updatePropertyHouses, updatePropertyMortgage, resetPlayerProperties,
    addGameLog, getGameLog, unlockAchievement, getUserAchievements,
    saveGame, loadGame, getUserSaves, deleteSave
};