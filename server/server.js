const path = require('path');
const db = require('./database');
const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const auth = require('./auth');
const { boardCells, houseCosts, rentWithHouses, chanceCards, chestCards } = require('./gameData');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const gameRuntime = new Map();

app.use(express.static(path.join(__dirname, '..')));

function broadcastAll(gameId, message, wss) {
    let count = 0;
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client.gameId === gameId) {
            client.send(JSON.stringify(message));
            count++;
        }
    });
    console.log(`📤 Отправлено ${count} клиентам в игре ${gameId}: ${message.type}`);
}

function ensureGameRuntime(gameId) {
    if (!gameRuntime.has(gameId)) {
        gameRuntime.set(gameId, { 
            canRoll: true,
            chanceDeck: [...chanceCards].sort(() => Math.random() - 0.5),
            chestDeck: [...chestCards].sort(() => Math.random() - 0.5)
        });
    }
    return gameRuntime.get(gameId);
}

function getTurnContext(gameId) {
    const game = db.getGameById(gameId);
    const allPlayers = db.getGamePlayers(gameId);
    const alivePlayers = allPlayers.filter(p => !p.is_bankrupt);
    if (alivePlayers.length === 0) {
        return { game, players: allPlayers, currentIndex: 0, player: null };
    }
    const aliveIndex = game.turn_count % alivePlayers.length;
    const player = alivePlayers[aliveIndex];
    const currentIndex = allPlayers.findIndex(p => p.id === player.id);
    return { game, players: allPlayers, currentIndex, player };
}

function getSocketPlayerIndex(ws, players) {
    return players.findIndex((player) => player.id === ws.dbPlayerId);
}

function isCurrentPlayersSocket(ws, players, currentIndex) {
    return Boolean(players[currentIndex] && ws.dbPlayerId === players[currentIndex].id);
}

function isPropertyCell(cell) {
    return cell && ['street', 'railroad', 'utility'].includes(cell.type);
}

function syncGameState(gameId, extra = {}) {
    broadcastAll(gameId, {
        type: 'SYNC_STATE',
        ...extra,
        gameState: getFullGameState(gameId)
    }, wss);
}

function calculateRent(position, properties) {
    const cell = boardCells[position];
    const prop = properties[position];
    if (!prop || prop.owner_index === null || prop.is_mortgaged) return 0;
    
    if (cell.type === 'street') {
        if (prop.houses === 0) {
            const groupCells = boardCells.map((c, i) => c.group === cell.group ? i : -1).filter(i => i !== -1);
            const isMonopoly = groupCells.every(i => properties[i]?.owner_index === prop.owner_index);
            return isMonopoly ? cell.rent * 2 : cell.rent;
        }
        return rentWithHouses[cell.group][prop.houses] || cell.rent;
    }
    if (cell.type === 'railroad') {
        const railroads = [5, 15, 25, 35];
        const ownedCount = railroads.filter(i => properties[i]?.owner_index === prop.owner_index).length;
        return 25 * Math.pow(2, ownedCount - 1);
    }
    if (cell.type === 'utility') {
        const utilities = [12, 28];
        const ownedCount = utilities.filter(i => properties[i]?.owner_index === prop.owner_index).length;
        return ownedCount === 2 ? 100 : 40;
    }
    return 0;
}

function formatPlayer(p) {
    return {
        id: p.id, name: p.player_name, token: p.token, color: p.color,
        money: p.money, position: p.position, isBankrupt: !!p.is_bankrupt,
        isBot: !!p.is_bot, isHost: !!p.is_host, ready: true
    };
}

function getFullGameState(gameId) {
    const game = db.getGameById(gameId);
    const allPlayers = db.getGamePlayers(gameId);
    const properties = db.getGameProperties(gameId);
    const alivePlayers = allPlayers.filter(p => !p.is_bankrupt);
    let currentIndex = 0;
    if (alivePlayers.length > 0) {
        const aliveIndex = game.turn_count % alivePlayers.length;
        const currentPlayer = alivePlayers[aliveIndex];
        currentIndex = allPlayers.findIndex(p => p.id === currentPlayer.id);
    }
    const runtime = ensureGameRuntime(gameId);

    return {
        gameId: gameId,
        players: allPlayers.map(p => ({ id: p.id, name: p.player_name, token: p.token, color: p.color, money: p.money, position: p.position, isBot: !!p.is_bot })),
        currentPlayerIndex: currentIndex,
        properties: properties.map(p => ({ owner: p.owner_index, houses: p.houses, mortgaged: !!p.is_mortgaged })),
        turnCount: game.turn_count,
        gameActive: game.status === 'active',
        canRoll: runtime.canRoll,
        jailStatus: allPlayers.map(p => ({ inJail: p.position === 10, turnsInJail: p.jail_turns || 0, hasGetOutOfJailCard: !!p.has_jail_card })),
        auctionActive: false, auctionProperty: null, auctionCurrentBid: 0, auctionBidder: null, auctionPassed: []
    };
}

function applyCardAction(gameId, playerIndex, player, card, cardType) {
    const players = db.getGamePlayers(gameId);
    const runtime = ensureGameRuntime(gameId);
    
    if (card.action === 'money') {
        db.updatePlayerMoney(gameId, playerIndex, player.money + card.value);
        db.addGameLog(gameId, 0, player.player_name, cardType, card.text);
    } else if (card.action === 'pay') {
        db.updatePlayerMoney(gameId, playerIndex, Math.max(0, player.money - card.value));
        db.addGameLog(gameId, 0, player.player_name, cardType, card.text);
    } else if (card.action === 'gotojail') {
        db.updatePlayerPosition(gameId, playerIndex, 10);
        db.updatePlayerJail(gameId, playerIndex, 0, false);
        db.addGameLog(gameId, 0, player.player_name, cardType, 'Отправлен в тюрьму');
    } else if (card.action === 'gostart') {
        db.updatePlayerPosition(gameId, playerIndex, 0);
        db.updatePlayerMoney(gameId, playerIndex, player.money + 200);
        db.addGameLog(gameId, 0, player.player_name, cardType, 'На СТАРТ +200$');
    } else if (card.action === 'jailcard') {
        db.updatePlayerJail(gameId, playerIndex, player.jail_turns || 0, true);
        db.addGameLog(gameId, 0, player.player_name, cardType, 'Получил карту освобождения');
    } else if (card.action === 'birthday') {
        let total = 0;
        players.forEach((p, i) => {
            if (i !== playerIndex && p.money >= card.value) {
                db.updatePlayerMoney(gameId, i, p.money - card.value);
                total += card.value;
            }
        });
        db.updatePlayerMoney(gameId, playerIndex, player.money + total);
        db.addGameLog(gameId, 0, player.player_name, cardType, `День рождения +${total}$`);
    }
    
    // Обновляем canRoll после карты
    runtime.canRoll = false;
}

wss.on('connection', (ws) => {
    const playerId = uuidv4();
    ws.playerId = playerId;
    ws.gameId = null;
    ws.dbPlayerId = null;
    console.log(`🟢 Подключён: ${playerId.substring(0, 8)}`);
    ws.send(JSON.stringify({ type: 'CONNECTED', playerId }));

    ws.on('message', (data) => {
        try { handleMessage(ws, playerId, JSON.parse(data)); }
        catch (e) { ws.send(JSON.stringify({ type: 'ERROR', message: 'Неверный формат' })); }
    });

    ws.on('close', () => console.log(`🔴 Отключён: ${playerId.substring(0, 8)}`));
});

function handleMessage(ws, playerId, message) {
    switch (message.type) {
        case 'REGISTER': {
            const r = auth.register(message.username, message.password, message.email);
            ws.send(JSON.stringify({ type: 'AUTH_RESULT', ...r }));
            break;
        }
        case 'LOGIN': {
            const r = auth.login(message.username, message.password);
            ws.send(JSON.stringify({ type: 'AUTH_RESULT', ...r }));
            break;
        }
        case 'GUEST_LOGIN': {
            const r = auth.guestLogin(message.username);
            ws.send(JSON.stringify({ type: 'AUTH_RESULT', ...r }));
            break;
        }
        case 'GET_PROFILE': {
            const decoded = auth.verifyToken(message.token);
            if (decoded?.userId) {
                const profile = decoded.isGuest
                    ? { id: decoded.userId, username: decoded.username, avatar: '🚗', color: '#e53935', isGuest: true }
                    : auth.getProfile(decoded.userId);
                ws.send(JSON.stringify({ type: 'PROFILE', profile }));
            } else ws.send(JSON.stringify({ type: 'PROFILE', profile: null }));
            break;
        }
        case 'CREATE_ROOM': {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const gameId = db.createGame(roomCode);
    ws.gameId = gameId;
    
    db.addPlayer(gameId, message.userId || null, message.name || 'Игрок 1', message.token || '🚗', message.color || '#e53935', false, true);
    db.initGameProperties(gameId);
    
    const players = db.getGamePlayers(gameId);
    const myPlayerRow = players[players.length - 1];
    ws.dbPlayerId = myPlayerRow.id;
    ensureGameRuntime(gameId);
    
    ws.send(JSON.stringify({
        type: 'ROOM_CREATED',
        roomId: roomCode,
        gameId,
        yourPlayerId: myPlayerRow.id,  // ← ВАЖНО!
        players: players.map(formatPlayer),
        isHost: true
    }));
    break;
}
        case 'JOIN_ROOM': {
            const game = db.getGameByRoomCode(message.roomId);
            if (!game) { ws.send(JSON.stringify({ type: 'ERROR', message: 'Комната не найдена!' })); return; }
            const players = db.getGamePlayers(game.id);
            if (players.length >= 4) { ws.send(JSON.stringify({ type: 'ERROR', message: 'Комната заполнена!' })); return; }
            ws.gameId = game.id;
            const tokens = ['🚗', '🐕', '🎩', '🚢'], colors = ['#e53935', '#1e88e5', '#43a047', '#fb8c00'];
            db.addPlayer(game.id, message.userId || null, message.name || `Игрок ${players.length+1}`, message.token || tokens[players.length], message.color || colors[players.length], false, false);
            const upd = db.getGamePlayers(game.id).map(formatPlayer);
            broadcastAll(game.id, { type: 'PLAYERS_UPDATED', players: upd }, wss);
            console.log(`👤 +1 в ${message.roomId}`);
            const updatedPlayers = db.getGamePlayers(game.id);
            const myPlayerRow = updatedPlayers[updatedPlayers.length - 1];
            ws.dbPlayerId = myPlayerRow.id;
            ensureGameRuntime(game.id);

            ws.send(JSON.stringify({
                type: 'JOINED_ROOM',
                roomId: message.roomId,
                gameId: game.id,
                yourPlayerId: myPlayerRow.id,
                players: updatedPlayers.map(formatPlayer),
                isHost: false
            }));
            break;
        }
        case 'START_GAME': {
            if (!ws.gameId) return;
            const players = db.getGamePlayers(ws.gameId);
            const hostPlayer = players.find((player) => player.is_host);
            if (!hostPlayer || hostPlayer.id !== ws.dbPlayerId) {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Только хост может начать игру' }));
                return;
            }
            db.updateGameStatus(ws.gameId, 'active');
            const runtime = ensureGameRuntime(ws.gameId);
            runtime.canRoll = true;
            runtime.chanceDeck = [...chanceCards].sort(() => Math.random() - 0.5);
            runtime.chestDeck = [...chestCards].sort(() => Math.random() - 0.5);
            broadcastAll(ws.gameId, {
                type: 'GAME_STARTED',
                gameId: ws.gameId,
                gameState: getFullGameState(ws.gameId)
            }, wss);
            break;
        }
        case 'ROLL_DICE': {
            if (!ws.gameId) {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Не в игре' }));
                return;
            }
            
            const { game, players, currentIndex, player } = getTurnContext(ws.gameId);
            const runtime = ensureGameRuntime(ws.gameId);
            if (!game || game.status !== 'active') {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Игра не активна' }));
                return;
            }

            if (!isCurrentPlayersSocket(ws, players, currentIndex)) {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Сейчас ход другого игрока' }));
                return;
            }

            if (!runtime.canRoll) {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Кубики уже брошены. Завершите ход.' }));
                return;
            }

            const properties = db.getGameProperties(ws.gameId);
            
            // Проверка: игрок в тюрьме?
            if (player.position === 10) {
                const jailTurns = player.jail_turns || 0;
                const hasJailCard = !!player.has_jail_card;
                
                if (hasJailCard) {
                    db.updatePlayerJail(ws.gameId, currentIndex, 0, false);
                    broadcastAll(ws.gameId, {
                        type: 'JAIL_FREE_CARD',
                        playerIndex: currentIndex,
                        playerName: player.player_name,
                        message: `${player.player_name} освободился по карте!`,
                        gameState: getFullGameState(ws.gameId)
                    }, wss);
                    return;
                }
                
                const d1 = Math.floor(Math.random() * 6) + 1;
                const d2 = Math.floor(Math.random() * 6) + 1;
                const isDouble = d1 === d2;
                const newJailTurns = jailTurns + 1;
                
                if (isDouble) {
                    db.updatePlayerJail(ws.gameId, currentIndex, 0, false);
                    const newPos = (player.position + d1 + d2) % 40;
                    db.updatePlayerPosition(ws.gameId, currentIndex, newPos);
                    if (player.position + d1 + d2 >= 40) {
                        db.updatePlayerMoney(ws.gameId, currentIndex, player.money + 200);
                    }
                    
                    broadcastAll(ws.gameId, {
                        type: 'JAIL_DOUBLE',
                        playerIndex: currentIndex,
                        playerName: player.player_name,
                        dice1: d1, dice2: d2,
                        newPosition: newPos,
                        message: `${player.player_name} выбросил дубль и освободился!`,
                        gameState: getFullGameState(ws.gameId)
                    }, wss);
                    return;
                }
                
                if (newJailTurns >= 3) {
                    const newMoney = Math.max(0, player.money - 50);
                    db.updatePlayerMoney(ws.gameId, currentIndex, newMoney);
                    db.updatePlayerJail(ws.gameId, currentIndex, 0, false);
                    const newPos = (player.position + d1 + d2) % 40;
                    db.updatePlayerPosition(ws.gameId, currentIndex, newPos);
                    
                    broadcastAll(ws.gameId, {
                        type: 'JAIL_PAID',
                        playerIndex: currentIndex,
                        playerName: player.player_name,
                        dice1: d1, dice2: d2,
                        newPosition: newPos,
                        message: `${player.player_name} заплатил 50$ и вышел из тюрьмы`,
                        gameState: getFullGameState(ws.gameId)
                    }, wss);
                    return;
                }
                
                db.updatePlayerJail(ws.gameId, currentIndex, newJailTurns, hasJailCard);
                runtime.canRoll = false;
                
                broadcastAll(ws.gameId, {
                    type: 'JAIL_STAY',
                    playerIndex: currentIndex,
                    playerName: player.player_name,
                    jailTurns: newJailTurns,
                    dice1: d1, dice2: d2,
                    message: `${player.player_name} в тюрьме (ход ${newJailTurns}/3)`,
                    gameState: getFullGameState(ws.gameId)
                }, wss);
                return;
            }
            
            // Обычный бросок (не в тюрьме)
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            const steps = d1 + d2;
            const oldPos = player.position;
            let newPos = (oldPos + steps) % 40;
            const passedStart = oldPos + steps >= 40;
            let money = player.money + (passedStart ? 200 : 0);
            let cellActionResult = null;

            const landedCell = boardCells[newPos];
            const landedProperty = properties[newPos];

            // Проверка на ПОЛИЦИЮ (клетка 30)
            if (newPos === 30) {
                newPos = 10;
                db.updatePlayerJail(ws.gameId, currentIndex, 0, false);
                cellActionResult = { type: 'gotojail' };
            }

            db.updatePlayerPosition(ws.gameId, currentIndex, newPos);
            db.updatePlayerMoney(ws.gameId, currentIndex, money);

            // Проверяем, попал ли игрок на Шанс или Казна
            if (landedCell.type === 'chance' || landedCell.type === 'chest') {
                let card;
                if (landedCell.type === 'chance') {
                    if (!runtime.chanceDeck || runtime.chanceDeck.length === 0) {
                        runtime.chanceDeck = [...chanceCards].sort(() => Math.random() - 0.5);
                    }
                    card = runtime.chanceDeck.pop();
                } else {
                    if (!runtime.chestDeck || runtime.chestDeck.length === 0) {
                        runtime.chestDeck = [...chestCards].sort(() => Math.random() - 0.5);
                    }
                    card = runtime.chestDeck.pop();
                }
                
                // Применяем действие карты
                applyCardAction(ws.gameId, currentIndex, player, card, landedCell.type);
                
                // Отправляем ВСЕМ игрокам событие карты
                broadcastAll(ws.gameId, {
                    type: 'CARD_DRAW',
                    playerIndex: currentIndex,
                    playerName: player.player_name,
                    cardType: landedCell.type,
                    cardText: card.text,
                    cardAction: card.action,
                    cardValue: card.value || 0,
                    dice1: d1, dice2: d2,
                    oldPosition: oldPos, newPosition: newPos,
                    gameState: getFullGameState(ws.gameId)
                }, wss);
                
                console.log(`🃏 Игрок ${player.player_name} тянет карту ${landedCell.type}: ${card.text}`);
                return;
            }

            // Обработка аренды/налога для обычных клеток
            if (isPropertyCell(landedCell) && landedProperty?.owner_index !== null && landedProperty.owner_index !== currentIndex && !landedProperty.is_mortgaged) {
                const rent = Math.min(calculateRent(newPos, properties), money);
                money -= rent;
                const owner = players[landedProperty.owner_index];
                if (owner) {
                    db.updatePlayerMoney(ws.gameId, landedProperty.owner_index, owner.money + rent);
                }
                cellActionResult = { type: 'rent', amount: rent, ownerIndex: landedProperty.owner_index };
            } else if (landedCell?.type === 'tax') {
                const taxAmount = Math.min(landedCell.rent || 0, money);
                money -= taxAmount;
                cellActionResult = { type: 'tax', amount: taxAmount };
            }

            db.updatePlayerMoney(ws.gameId, currentIndex, money);
            runtime.canRoll = false;
            
            broadcastAll(ws.gameId, {
                type: 'DICE_RESULT',
                playerIndex: currentIndex,
                dice1: d1, dice2: d2,
                oldPosition: oldPos, newPosition: newPos,
                passedStart,
                cellActionResult,
                gameState: getFullGameState(ws.gameId)
            }, wss);
            
            console.log(`🎲 Игрок ${player.player_name} выбросил ${d1}+${d2}=${steps}`);
            break;
        }
        case 'BUY_PROPERTY': {
            if (!ws.gameId) return;
            const { game, players, currentIndex, player } = getTurnContext(ws.gameId);
            const runtime = ensureGameRuntime(ws.gameId);
            if (!game || !isCurrentPlayersSocket(ws, players, currentIndex)) {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Покупать может только текущий игрок' }));
                return;
            }
            if (runtime.canRoll) {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Сначала бросьте кубики' }));
                return;
            }
            const cell = boardCells[player.position];
            const properties = db.getGameProperties(ws.gameId);
            const prop = properties[player.position];
            if (!isPropertyCell(cell) || !prop || prop.owner_index !== null) {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Эту клетку нельзя купить' }));
                return;
            }
            if (player.money >= cell.price) {
                db.updatePlayerMoney(ws.gameId, currentIndex, player.money-cell.price);
                db.updatePropertyOwner(ws.gameId, player.position, currentIndex);
                db.addGameLog(ws.gameId, game.turn_count, player.player_name, 'buy', `${player.player_name} купил ${cell.name}`);
            } else {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Недостаточно денег для покупки' }));
                return;
            }
            broadcastAll(ws.gameId, { type:'PROPERTY_BOUGHT', playerIndex:currentIndex, position:player.position, price:cell.price, gameState:getFullGameState(ws.gameId) }, wss);
            break;
        }
        case 'BUILD_HOUSE': {
            if (!ws.gameId) return;
            const { game, players, currentIndex, player } = getTurnContext(ws.gameId);
            if (!game || !isCurrentPlayersSocket(ws, players, currentIndex)) {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Строить может только текущий игрок' }));
                return;
            }
            const position = Number(message.position);
            const cell = boardCells[position];
            const properties = db.getGameProperties(ws.gameId);
            const prop = properties[position];
            const cost = houseCosts[cell?.group] || 100;
            if (!prop || !cell || cell.type !== 'street' || prop.owner_index !== currentIndex || prop.is_mortgaged || prop.houses >= 5) {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Здесь нельзя строить' }));
                return;
            }
            if (player.money < cost) {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Недостаточно денег для строительства' }));
                return;
            }
            db.updatePlayerMoney(ws.gameId, currentIndex, player.money - cost);
            db.updatePropertyHouses(ws.gameId, position, prop.houses + 1);
            syncGameState(ws.gameId, { message: `${player.player_name} построил дом на ${cell.name}` });
            break;
        }
        case 'SELL_HOUSE': {
            if (!ws.gameId) return;
            const { game, players, currentIndex, player } = getTurnContext(ws.gameId);
            if (!game || !isCurrentPlayersSocket(ws, players, currentIndex)) {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Продавать дом может только текущий игрок' }));
                return;
            }
            const position = Number(message.position);
            const cell = boardCells[position];
            const properties = db.getGameProperties(ws.gameId);
            const prop = properties[position];
            const refund = Math.floor((houseCosts[cell?.group] || 100) / 2);
            if (!prop || !cell || cell.type !== 'street' || prop.owner_index !== currentIndex || prop.houses <= 0) {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Здесь нечего продавать' }));
                return;
            }
            db.updatePropertyHouses(ws.gameId, position, prop.houses - 1);
            db.updatePlayerMoney(ws.gameId, currentIndex, player.money + refund);
            syncGameState(ws.gameId, { message: `${player.player_name} продал дом на ${cell.name}` });
            break;
        }
        case 'MORTGAGE_PROPERTY':
        case 'UNMORTGAGE_PROPERTY': {
            if (!ws.gameId) return;
            const { game, players, currentIndex, player } = getTurnContext(ws.gameId);
            if (!game || !isCurrentPlayersSocket(ws, players, currentIndex)) {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Менять залог может только текущий игрок' }));
                return;
            }
            const position = Number(message.position);
            const cell = boardCells[position];
            const properties = db.getGameProperties(ws.gameId);
            const prop = properties[position];
            if (!prop || !cell || !isPropertyCell(cell) || prop.owner_index !== currentIndex) {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Эта недвижимость вам не принадлежит' }));
                return;
            }
            if (message.type === 'MORTGAGE_PROPERTY') {
                if (prop.houses > 0 || prop.is_mortgaged) {
                    ws.send(JSON.stringify({ type: 'ERROR', message: 'Нельзя заложить эту недвижимость' }));
                    return;
                }
                db.updatePropertyMortgage(ws.gameId, position, true);
                db.updatePlayerMoney(ws.gameId, currentIndex, player.money + Math.floor(cell.price / 2));
                syncGameState(ws.gameId, { message: `${player.player_name} заложил ${cell.name}` });
            } else {
                const unmortgageCost = Math.floor(cell.price * 0.55);
                if (!prop.is_mortgaged || player.money < unmortgageCost) {
                    ws.send(JSON.stringify({ type: 'ERROR', message: 'Недостаточно денег для выкупа' }));
                    return;
                }
                db.updatePropertyMortgage(ws.gameId, position, false);
                db.updatePlayerMoney(ws.gameId, currentIndex, player.money - unmortgageCost);
                syncGameState(ws.gameId, { message: `${player.player_name} выкупил ${cell.name}` });
            }
            break;
        }
        case 'END_TURN': {
            if (!ws.gameId) return;
            const { players, currentIndex } = getTurnContext(ws.gameId);
            if (!isCurrentPlayersSocket(ws, players, currentIndex)) {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Завершать ход может только текущий игрок' }));
                return;
            }
            db.incrementTurnCount(ws.gameId);
            ensureGameRuntime(ws.gameId).canRoll = true;
            const g = db.getGameById(ws.gameId);
            const updatedPlayers = db.getGamePlayers(ws.gameId);
            const newIndex = g.turn_count % updatedPlayers.length;
            
            broadcastAll(ws.gameId, { 
                type: 'TURN_ENDED', 
                nextPlayerIndex: newIndex, 
                turnCount: g.turn_count, 
                gameState: getFullGameState(ws.gameId) 
            }, wss);
            break;
        }
        case 'CHAT_MESSAGE': {
            if (!ws.gameId) return;
            broadcastAll(ws.gameId, { type:'CHAT_MESSAGE', playerName: message.playerName || 'Игрок', text: message.text?.substring(0,200) || '' }, wss);
            break;
        }
        case 'AUCTION_BID': {
            if (!ws.gameId) return;
            const { players } = getTurnContext(ws.gameId);
            const bidderIndex = players.findIndex(p => p.id === ws.dbPlayerId);
            const bidder = players[bidderIndex];
            if (!bidder) {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Игрок не найден' }));
                return;
            }
            const amount = Number(message.amount) || 0;
            if (amount <= 0) {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Сумма ставки должна быть больше 0' }));
                return;
            }
            if (bidder.money < amount) {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Недостаточно денег для ставки' }));
                return;
            }
            const runtime = ensureGameRuntime(ws.gameId);
            if (!runtime.auction) {
                runtime.auction = { currentBid: 0, highestBidder: null, highestBidderName: null, propertyIndex: null, passedPlayers: [] };
            }
            if (amount <= runtime.auction.currentBid) {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Ставка должна быть больше текущей!' }));
                return;
            }
            if (runtime.auction.passedPlayers.includes(bidderIndex)) {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Вы уже пасанули!' }));
                return;
            }
            runtime.auction.currentBid = amount;
            runtime.auction.highestBidder = bidderIndex;
            runtime.auction.highestBidderName = bidder.player_name;
            broadcastAll(ws.gameId, {
                type: 'AUCTION_BID_PLACED',
                playerIndex: bidderIndex,
                playerName: bidder.player_name,
                amount: amount,
                currentBid: amount,
                highestBidder: bidder.player_name,
                gameState: getFullGameState(ws.gameId)
            }, wss);
            db.addGameLog(ws.gameId, 0, bidder.player_name, 'auction', `${bidder.player_name} ставит ${amount}$`);
            break;
        }
        case 'AUCTION_PASS': {
            if (!ws.gameId) return;
            const { players } = getTurnContext(ws.gameId);
            const passerIndex = players.findIndex(p => p.id === ws.dbPlayerId);
            const passer = players[passerIndex];
            if (!passer) {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Игрок не найден' }));
                return;
            }
            const runtime = ensureGameRuntime(ws.gameId);
            if (!runtime.auction) {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Аукцион не активен' }));
                return;
            }
            if (runtime.auction.passedPlayers.includes(passerIndex)) {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Вы уже пасанули!' }));
                return;
            }
            runtime.auction.passedPlayers.push(passerIndex);
            const activePlayers = players.filter((p, i) => !runtime.auction.passedPlayers.includes(i) && !p.is_bankrupt);
            broadcastAll(ws.gameId, {
                type: 'AUCTION_PASSED',
                playerIndex: passerIndex,
                playerName: passer.player_name,
                passedCount: runtime.auction.passedPlayers.length,
                gameState: getFullGameState(ws.gameId)
            }, wss);
            if (activePlayers.length <= 1 && runtime.auction.highestBidder !== null) {
                const winner = players[runtime.auction.highestBidder];
                const propertyIndex = runtime.auction.propertyIndex;
                const cell = boardCells[propertyIndex];
                const newMoney = winner.money - runtime.auction.currentBid;
                db.updatePlayerMoney(ws.gameId, runtime.auction.highestBidder, newMoney);
                db.updatePropertyOwner(ws.gameId, propertyIndex, runtime.auction.highestBidder);
                const finalGameState = getFullGameState(ws.gameId);
                broadcastAll(ws.gameId, {
                    type: 'AUCTION_ENDED',
                    winnerIndex: runtime.auction.highestBidder,
                    winnerName: winner.player_name,
                    propertyIndex: propertyIndex,
                    propertyName: cell ? cell.name : 'Неизвестно',
                    finalBid: runtime.auction.currentBid,
                    message: `${winner.player_name} выиграл аукцион за ${cell ? cell.name : 'клетку'} за ${runtime.auction.currentBid}$!`,
                    gameState: finalGameState
                }, wss);
                db.addGameLog(ws.gameId, 0, winner.player_name, 'auction', `${winner.player_name} выиграл аукцион за ${cell ? cell.name : 'клетку'}`);
                runtime.auction = null;
            } else if (activePlayers.length === 0 && runtime.auction.highestBidder === null) {
                broadcastAll(ws.gameId, {
                    type: 'AUCTION_ENDED',
                    winnerIndex: null,
                    winnerName: null,
                    propertyIndex: runtime.auction.propertyIndex,
                    propertyName: boardCells[runtime.auction.propertyIndex]?.name || 'Неизвестно',
                    finalBid: 0,
                    message: 'Аукцион отменён - никто не сделал ставку',
                    gameState: getFullGameState(ws.gameId)
                }, wss);
                runtime.auction = null;
            }
            break;
        }
        case 'START_AUCTION': {
            if (!ws.gameId) return;
            const { players, currentIndex, player } = getTurnContext(ws.gameId);
            const propertyIndex = message.position || player.position;
            
            console.log(`🔨 Запущен аукцион за клетку ${propertyIndex} для всех игроков`);
            
            const runtime = ensureGameRuntime(ws.gameId);
            runtime.auction = {
                currentBid: Math.floor(boardCells[propertyIndex].price / 2),
                highestBidder: null,
                highestBidderName: null,
                propertyIndex: propertyIndex,
                passedPlayers: []
            };
            
            broadcastAll(ws.gameId, {
                type: 'AUCTION_STARTED',
                propertyIndex: propertyIndex,
                propertyName: boardCells[propertyIndex].name,
                startPrice: runtime.auction.currentBid,
                gameState: getFullGameState(ws.gameId)
            }, wss);
            
            db.addGameLog(ws.gameId, 0, player.player_name, 'auction', 
                `Аукцион за ${boardCells[propertyIndex].name}! Начальная цена: ${runtime.auction.currentBid}$`);
            break;
        }
        case 'TRADE_PROPOSAL': {
            if (!ws.gameId) return;
            const players = db.getGamePlayers(ws.gameId);
            const fromPlayer = players.find(p => p.id === ws.dbPlayerId);
            const toPlayer = players.find(p => p.id === message.toPlayerId);
            if (!fromPlayer || !toPlayer) {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Игрок не найден' }));
                return;
            }
            let sent = false;
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN && client.gameId === ws.gameId && client.dbPlayerId === message.toPlayerId) {
                    client.send(JSON.stringify({
                        type: 'TRADE_PROPOSAL',
                        fromPlayerId: ws.dbPlayerId,
                        fromPlayerName: fromPlayer.player_name,
                        myProperties: message.myProperties || [],
                        partnerProperties: message.partnerProperties || [],
                        myMoney: message.myMoney || 0,
                        partnerMoney: message.partnerMoney || 0,
                        gameState: getFullGameState(ws.gameId)
                    }));
                    sent = true;
                }
            });
            if (sent) {
                ws.send(JSON.stringify({ type: 'TRADE_PROPOSAL_SENT', message: 'Предложение отправлено' }));
            } else {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Не удалось отправить предложение. Игрок не в сети.' }));
            }
            break;
        }
        case 'TRADE_RESPONSE': {
            if (!ws.gameId) { ws.send(JSON.stringify({ type: 'ERROR', message: 'Вы не в игре' })); return; }
            const players = db.getGamePlayers(ws.gameId);
            const fromPlayer = players.find(p => p.id === message.fromPlayerId);
            const toPlayer = players.find(p => p.id === ws.dbPlayerId);
            if (!fromPlayer || !toPlayer) {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Игрок не найден' }));
                return;
            }
            const fromIndex = players.indexOf(fromPlayer);
            const toIndex = players.indexOf(toPlayer);
            if (message.accepted) {
                const myMoney = Number(message.myMoney) || 0;
                const partnerMoney = Number(message.partnerMoney) || 0;
                const myProperties = message.myProperties || [];
                const partnerProperties = message.partnerProperties || [];
                const newFromMoney = fromPlayer.money - partnerMoney + myMoney;
                const newToMoney = toPlayer.money - myMoney + partnerMoney;
                db.updatePlayerMoney(ws.gameId, fromIndex, newFromMoney);
                db.updatePlayerMoney(ws.gameId, toIndex, newToMoney);
                myProperties.forEach(pos => db.updatePropertyOwner(ws.gameId, parseInt(pos), fromIndex));
                partnerProperties.forEach(pos => db.updatePropertyOwner(ws.gameId, parseInt(pos), toIndex));
                const updatedGameState = getFullGameState(ws.gameId);
                broadcastAll(ws.gameId, {
                    type: 'TRADE_COMPLETED',
                    fromPlayer: fromPlayer.player_name,
                    toPlayer: toPlayer.player_name,
                    message: `${fromPlayer.player_name} и ${toPlayer.player_name} совершили обмен!`,
                    gameState: updatedGameState
                }, wss);
                db.addGameLog(ws.gameId, 0, fromPlayer.player_name, 'trade', `${fromPlayer.player_name} и ${toPlayer.player_name} совершили обмен`);
            } else {
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN && client.gameId === ws.gameId && client.dbPlayerId === fromPlayer.id) {
                        client.send(JSON.stringify({ type: 'TRADE_REJECTED', message: `${toPlayer.player_name} отклонил предложение` }));
                    }
                });
            }
            break;
        }
        default:
            console.log(`⚠️ Неизвестный тип сообщения: ${message.type}`);
            ws.send(JSON.stringify({ type: 'ERROR', message: `Неизвестный тип: ${message.type}` }));
    }
}

const PORT = process.env.PORT || 3000;
db.initDatabase()
    .then(() => {
        server.listen(PORT, () => {
            console.log('╔══════════════════════════════════════╗');
            console.log('║   🎲 МОНОПОЛИЯ · MULTIPLAYER + БД  ║');
            console.log(`║   ws://localhost:${PORT}                   ║`);
            console.log('╚══════════════════════════════════════╝');
        });
    })
    .catch((error) => {
        console.error('❌ Не удалось инициализировать БД:', error);
        process.exit(1);
    });