let tradeInProgress = false;
let authInProgress = false;

// ==================== ГЛОБАЛЬНОЕ СОСТОЯНИЕ ====================
let gameState = {
    players: [],
    currentPlayerIndex: 0,
    properties: Array(40).fill(null).map(() => ({ owner: null, houses: 0, mortgaged: false })),
    gameActive: false,
    canRoll: true,
    botTimeout: null,
    playerColors: ['#e53935', '#1e88e5', '#43a047', '#fb8c00'],
    jailStatus: [],
    chanceDeck: [],
    chestDeck: [],
    turnCount: 0,
    gameStartTime: null,
    auctionActive: false,
    auctionProperty: null,
    auctionCurrentBid: 0,
    auctionBidder: null,
    auctionPassed: [],
    tradeProposal: null,
    logEntries: []
};

let settings = {
    startingMoney: 1500,
    botCount: 2,
    animationSpeed: 1,
    soundEnabled: true,
    fastMode: false
};

const achievements = [
    { id: 'first_buy', name: '🏠 Первая покупка', desc: 'Купите первую недвижимость', unlocked: false },
    { id: 'monopoly', name: '🎯 Монополист', desc: 'Соберите все улицы одного цвета', unlocked: false },
    { id: 'hotel', name: '🏨 Отельер', desc: 'Постройте отель', unlocked: false },
    { id: 'jail_escape', name: '🔓 Побег', desc: 'Выйдите из тюрьмы по дублю', unlocked: false },
    { id: 'bankrupt', name: '💀 Банкрот', desc: 'Обанкротьте соперника', unlocked: false },
    { id: 'rich', name: '💰 Богач', desc: 'Накопите 5000$', unlocked: false },
    { id: 'trader', name: '🤝 Делец', desc: 'Совершите обмен', unlocked: false },
    { id: 'collector', name: '🚂 Коллекционер', desc: 'Соберите все 4 станции', unlocked: false },
    { id: 'risk', name: '🎲 Риск', desc: 'Выиграйте на аукционе', unlocked: false },
    { id: 'winner', name: '👑 Победитель', desc: 'Выиграйте игру', unlocked: false }
];

// ==================== ПЕРЕКЛЮЧЕНИЕ ФОРМ АВТОРИЗАЦИИ ====================
function showRegisterForm() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
    document.getElementById('auth-error').classList.add('hidden');
}

function showLoginForm() {
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('auth-error').classList.add('hidden');
}

function showAuthError(message) {
    const errorDiv = document.getElementById('auth-error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
}

// Глобальные ссылки для HTML
window.showRegisterForm = showRegisterForm;
window.showLoginForm = showLoginForm;

// ==================== ДАННЫЕ ИГРЫ ====================
const boardCells = [
    { name: 'СТАРТ', name_en: 'GO', type: 'corner', price: 0, rent: 0, color: null, group: null },
    { name: 'Житная ул.', name_en: 'Mediterranean Ave', type: 'street', price: 60, rent: 2, color: '#8B4513', group: 'brown' },
    { name: 'Шанс', name_en: 'Chance', type: 'chance', price: 0, rent: 0, color: null, group: null },
    { name: 'Нагатинская', name_en: 'Baltic Ave', type: 'street', price: 60, rent: 4, color: '#8B4513', group: 'brown' },
    { name: 'Налог', name_en: 'Income Tax', type: 'tax', price: 0, rent: 200, color: null, group: null },
    { name: 'Рижская ж/д', name_en: 'Reading Railroad', type: 'railroad', price: 200, rent: 25, color: '#000', group: 'railroad' },
    { name: 'Полянка', name_en: 'Oriental Ave', type: 'street', price: 100, rent: 6, color: '#87CEEB', group: 'lightblue' },
    { name: 'Казна', name_en: 'Community Chest', type: 'chest', price: 0, rent: 0, color: null, group: null },
    { name: 'Сретенка', name_en: 'Vermont Ave', type: 'street', price: 100, rent: 6, color: '#87CEEB', group: 'lightblue' },
    { name: 'Ростовская', name_en: 'Connecticut Ave', type: 'street', price: 120, rent: 8, color: '#87CEEB', group: 'lightblue' },
    { name: 'ТЮРЬМА', name_en: 'JAIL', type: 'jail', price: 0, rent: 0, color: null, group: null },
    { name: 'Пушкинская', name_en: 'St. Charles Pl', type: 'street', price: 140, rent: 10, color: '#FF69B4', group: 'pink' },
    { name: 'Электростанция', name_en: 'Electric Company', type: 'utility', price: 150, rent: 0, color: '#ddd', group: 'utility' },
    { name: 'Маяковская', name_en: 'States Ave', type: 'street', price: 140, rent: 10, color: '#FF69B4', group: 'pink' },
    { name: 'Тверская', name_en: 'Virginia Ave', type: 'street', price: 160, rent: 12, color: '#FF69B4', group: 'pink' },
    { name: 'Курская ж/д', name_en: 'Pennsylvania RR', type: 'railroad', price: 200, rent: 25, color: '#000', group: 'railroad' },
    { name: 'Арбат', name_en: 'St. James Pl', type: 'street', price: 180, rent: 14, color: '#FFA500', group: 'orange' },
    { name: 'Казна', name_en: 'Community Chest', type: 'chest', price: 0, rent: 0, color: null, group: null },
    { name: 'Бронная', name_en: 'Tennessee Ave', type: 'street', price: 180, rent: 14, color: '#FFA500', group: 'orange' },
    { name: 'Смоленская', name_en: 'New York Ave', type: 'street', price: 200, rent: 16, color: '#FFA500', group: 'orange' },
    { name: 'ПАРКОВКА', name_en: 'FREE PARKING', type: 'corner', price: 0, rent: 0, color: null, group: null },
    { name: 'Петровка', name_en: 'Kentucky Ave', type: 'street', price: 220, rent: 18, color: '#FF0000', group: 'red' },
    { name: 'Шанс', name_en: 'Chance', type: 'chance', price: 0, rent: 0, color: null, group: null },
    { name: 'Неглинная', name_en: 'Indiana Ave', type: 'street', price: 220, rent: 18, color: '#FF0000', group: 'red' },
    { name: 'Кузнецкий', name_en: 'Illinois Ave', type: 'street', price: 240, rent: 20, color: '#FF0000', group: 'red' },
    { name: 'Октябрьская', name_en: 'B&O Railroad', type: 'railroad', price: 200, rent: 25, color: '#000', group: 'railroad' },
    { name: 'Грузинская', name_en: 'Atlantic Ave', type: 'street', price: 260, rent: 22, color: '#FFFF00', group: 'yellow' },
    { name: 'Казна', name_en: 'Community Chest', type: 'chest', price: 0, rent: 0, color: null, group: null },
    { name: 'Тверская-Ям', name_en: 'Ventnor Ave', type: 'street', price: 260, rent: 22, color: '#FFFF00', group: 'yellow' },
    { name: 'Ленинградский', name_en: 'Marvin Gardens', type: 'street', price: 280, rent: 24, color: '#FFFF00', group: 'yellow' },
    { name: 'ПОЛИЦИЯ', name_en: 'GO TO JAIL', type: 'corner', price: 0, rent: 0, color: null, group: null },
    { name: 'Кутузовский', name_en: 'Pacific Ave', type: 'street', price: 300, rent: 26, color: '#008000', group: 'green' },
    { name: 'Шанс', name_en: 'Chance', type: 'chance', price: 0, rent: 0, color: null, group: null },
    { name: 'Ленинский', name_en: 'North Carolina Ave', type: 'street', price: 300, rent: 26, color: '#008000', group: 'green' },
    { name: 'Комсомольский', name_en: 'Pennsylvania Ave', type: 'street', price: 320, rent: 28, color: '#008000', group: 'green' },
    { name: 'Киевская ж/д', name_en: 'Short Line RR', type: 'railroad', price: 200, rent: 25, color: '#000', group: 'railroad' },
    { name: 'Щелковская', name_en: 'Park Place', type: 'street', price: 350, rent: 35, color: '#00008B', group: 'blue' },
    { name: 'Казна', name_en: 'Community Chest', type: 'chest', price: 0, rent: 0, color: null, group: null },
    { name: 'Варшавская', name_en: 'Boardwalk', type: 'street', price: 400, rent: 50, color: '#00008B', group: 'blue' },
    { name: 'Шанс', name_en: 'Chance', type: 'chance', price: 0, rent: 0, color: null, group: null }
];

const houseCosts = {
    brown: 50, lightblue: 50, pink: 100, orange: 100,
    red: 150, yellow: 150, green: 200, blue: 200
};
const rentWithHouses = {
    brown: [2, 10, 30, 90, 160, 250],
    lightblue: [6, 30, 90, 270, 400, 550],
    pink: [10, 50, 150, 450, 625, 750],
    orange: [14, 70, 200, 550, 750, 950],
    red: [18, 90, 250, 700, 875, 1050],
    yellow: [22, 110, 330, 800, 975, 1150],
    green: [26, 130, 390, 900, 1100, 1275],
    blue: [35, 175, 500, 1100, 1300, 1500]
};

const fieldHistory = {
    0: "Вы стоите на пороге великой финансовой империи.",
    1: "В XVII веке здесь находились житные дворы с зерном для всей Москвы.",
    2: "Жизнь — игра, а здесь решается ваша судьба.",
    3: "Нагатино — древнее село с плодородной землей.",
    4: "Заплати налоги — и спи спокойно!",
    5: "Вокзал, откуда уходят поезда в Прибалтику.",
    6: "На Полянке девки хороводы водили.",
    7: "Общественные деньги — дело тонкое.",
    8: "Названа в честь Сретенского монастыря.",
    9: "Ростовская слобода славилась огородничеством.",
    10: "Мрачные стены помнят невинно осужденных.",
    11: "Здесь был я счастлив... Район богемный и престижный.",
    12: "Да будет свет! Контролировать электричество — значит контролировать город.",
    13: "Энергия великого футуриста до сих пор витает в воздухе.",
    14: "Главная артерия города!",
    15: "Огромный транспортный узел.",
    16: "Ах, Арбат, мой Арбат...",
    17: "Казна — возьмите карту.",
    18: "Здесь жили бронники — мастера доспехов.",
    19: "Дорога на Смоленск. Здесь стоит знаменитая сталинская высотка.",
    20: "Оазис спокойствия.",
    21: "Петровка, 38 — адрес знает каждый.",
    22: "Шанс — испытайте удачу!",
    23: "Когда-то здесь текла река Неглинка.",
    24: "На Кузнецкий мост за покупками!",
    25: "Бывший Николаевский вокзал.",
    26: "Грузинская слобода появилась при царе Алексее Михайловиче.",
    27: "Казна — общественные фонды могут пополнить ваш бюджет.",
    28: "Ямщики, ямщики...",
    29: "Бывшее Петербургское шоссе.",
    30: "Свисток и жезл — орудия правосудия!",
    31: "Назван в честь полководца, победившего Наполеона.",
    32: "Фортуна переменчива. Тяните карту!",
    33: "Широк и прям, как стрела.",
    34: "Проспект ведет к площади трех вокзалов.",
    35: "Ворота в Европу.",
    36: "Дорога на восток.",
    37: "Казна — последняя клетка Казна.",
    38: "Южные ворота Москвы. Самая дорогая улица в игре!",
    39: "Последний шанс перед СТАРТОМ."
};

const chanceCards = [
    { text: "🎉 Вы выиграли в лотерею! Получите 150$", action: (p) => { p.money += 150; return "получил 150$"; } },
    { text: "🚗 Штраф за превышение. Заплатите 50$", action: (p) => { p.money = Math.max(0, p.money - 50); return "заплатил 50$"; } },
    { text: "🏦 Банковские дивиденды. Получите 100$", action: (p) => { p.money += 100; return "получил 100$"; } },
    { text: "🏥 Медицинская страховка. Заплатите 75$", action: (p) => { p.money = Math.max(0, p.money - 75); return "заплатил 75$"; } },
    { text: "🎁 День рождения! Каждый дарит вам по 20$", action: (p, gs) => { let t = 0; gs.players.forEach(o => { if (o !== p) { const g = Math.min(20, o.money); o.money -= g; t += g; } }); p.money += t; return `получил ${t}$`; } },
    { text: "🏠 Ремонт квартиры. Заплатите 100$", action: (p) => { p.money = Math.max(0, p.money - 100); return "заплатил 100$"; } },
    { text: "📈 Акции выросли! Получите 200$", action: (p) => { p.money += 200; return "получил 200$"; } },
    { text: "⚖️ Судебные издержки. Заплатите 125$", action: (p) => { p.money = Math.max(0, p.money - 125); return "заплатил 125$"; } },
    { text: "🚔 Вы арестованы! В тюрьму!", action: (p, gs, idx) => { p.position = 10; gs.jailStatus[idx] = { inJail: true, turnsInJail: 0 }; return "в тюрьму!"; } },
    { text: "🎫 Бесплатная поездка на СТАРТ!", action: (p) => { p.position = 0; p.money += 200; return "на СТАРТ +200$"; } },
    { text: "💰 Налоговая проверка. Заплатите 80$", action: (p) => { p.money = Math.max(0, p.money - 80); return "заплатил 80$"; } },
    { text: "🎰 Джекпот! Получите 300$", action: (p) => { p.money += 300; return "получил 300$"; } }
];

const chestCards = [
    { text: "📦 Банковская ошибка в вашу пользу +200$", action: (p) => { p.money += 200; return "получил 200$"; } },
    { text: "🏥 Счет от доктора -50$", action: (p) => { p.money = Math.max(0, p.money - 50); return "заплатил 50$"; } },
    { text: "🎓 Стипендия +100$", action: (p) => { p.money += 100; return "получил 100$"; } },
    { text: "🚗 Штраф за парковку -30$", action: (p) => { p.money = Math.max(0, p.money - 30); return "заплатил 30$"; } },
    { text: "🏆 Премия на конкурсе красоты +10$", action: (p) => { p.money += 10; return "получил 10$"; } },
    { text: "📚 Продажа книг +75$", action: (p) => { p.money += 75; return "получил 75$"; } },
    { text: "🔧 Ремонт техники -60$", action: (p) => { p.money = Math.max(0, p.money - 60); return "заплатил 60$"; } },
    { text: "🎂 Выиграли пирог +25$", action: (p) => { p.money += 25; return "получил 25$"; } },
    { text: "🔑 Освобождение из тюрьмы!", action: (p, gs, idx) => { gs.jailStatus[idx] = { ...gs.jailStatus[idx], hasGetOutOfJailCard: true }; return "карта освобождения!"; } },
    { text: "🚔 Вы арестованы! В тюрьму!", action: (p, gs, idx) => { p.position = 10; gs.jailStatus[idx] = { inJail: true, turnsInJail: 0 }; return "в тюрьму!"; } },
    { text: "🏦 Возврат налога +120$", action: (p) => { p.money += 120; return "получил 120$"; } },
    { text: "🎁 Подарок от бабушки +50$", action: (p) => { p.money += 50; return "получил 50$"; } }
];

// ==================== DOM-элементы ====================
const DOM = {};
function initDOM() {
    DOM.preloader = document.getElementById('preloader');
    DOM.mainMenu = document.getElementById('main-menu');
    DOM.gameContainer = document.getElementById('game-board-container');
    DOM.rulesModal = document.getElementById('rules-modal');
    DOM.tokenModal = document.getElementById('token-select-modal');
    DOM.settingsModal = document.getElementById('settings-modal');
    DOM.loadModal = document.getElementById('load-modal');
    DOM.diceOverlay = document.getElementById('dice-overlay');
    DOM.dice1 = document.getElementById('dice1');
    DOM.dice2 = document.getElementById('dice2');
    DOM.rollBtn = document.getElementById('roll-btn');
    DOM.endTurnBtn = document.getElementById('end-turn-btn');
    DOM.buildBtn = document.getElementById('build-btn');
    DOM.gameMessage = document.getElementById('game-message');
    DOM.propertyPanel = document.getElementById('property-action-panel');
    DOM.auctionPanel = document.getElementById('auction-panel');
    DOM.buildPanel = document.getElementById('build-panel');
    DOM.mortgagePanel = document.getElementById('mortgage-panel');
    DOM.tradePanel = document.getElementById('trade-panel');
    DOM.tradeResponsePanel = document.getElementById('trade-response-panel');
    DOM.propName = document.getElementById('prop-name');
    DOM.propPrice = document.getElementById('prop-price');
    DOM.propRent = document.getElementById('prop-rent');
    DOM.playersHeader = document.getElementById('players-header');
    DOM.board = document.getElementById('monopoly-board');
    DOM.progressFill = document.getElementById('progress-fill');
    DOM.logContent = document.getElementById('log-content');
    DOM.gameTime = document.getElementById('game-time');
    DOM.turnCounter = document.getElementById('turn-counter');
    DOM.tokenSelectContainer = document.getElementById('token-select-container');
    DOM.saveSlots = document.getElementById('save-slots');
    DOM.auctionPropName = document.getElementById('auction-prop-name');
    DOM.auctionStartPrice = document.getElementById('auction-start-price');
    DOM.auctionCurrentBid = document.getElementById('auction-current-bid');
    DOM.auctionBidder = document.getElementById('auction-bidder');
    DOM.buildableProperties = document.getElementById('buildable-properties');
    DOM.mortgageableProperties = document.getElementById('mortgageable-properties');
    DOM.tradePartnerSelect = document.getElementById('trade-partner-select');
    DOM.myPropertiesTrade = document.getElementById('my-properties-trade');
    DOM.partnerPropertiesTrade = document.getElementById('partner-properties-trade');
    DOM.tradeOfferText = document.getElementById('trade-offer-text');
    DOM.achievementName = document.getElementById('achievement-name');
    DOM.achievementToast = document.getElementById('achievement-toast');
    DOM.cellTooltip = document.getElementById('cell-tooltip');
}
// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
function addLog(msg, type = 'info') {
    gameState.logEntries.unshift({ message: msg, type, time: new Date().toLocaleTimeString() });
    if (gameState.logEntries.length > 50) gameState.logEntries.pop();
    updateLogDisplay();
}
function updateLogDisplay() {
    if (!DOM.logContent) return;
    DOM.logContent.innerHTML = gameState.logEntries.map(e => `<div class="log-entry ${e.type}">[${e.time}] ${e.message}</div>`).join('');
}
function playSound(type) {
    if (!settings.soundEnabled) return;
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        if (type === 'dice') { osc.frequency.value = 800; gain.gain.value = 0.1; }
        else if (type === 'buy') { osc.frequency.value = 600; gain.gain.value = 0.1; }
        else if (type === 'pay') { osc.frequency.value = 300; gain.gain.value = 0.1; }
        else if (type === 'win') { osc.frequency.value = 1000; gain.gain.value = 0.1; }
        osc.start(); osc.stop(ctx.currentTime + 0.1);
    } catch(e) {}
}
function showNotification(msg, type = 'info', duration = 3000) {
    const old = document.getElementById('custom-notification');
    if (old) old.remove();
    const icons = { info: '📢', success: '✅', error: '❌', warning: '⚠️', win: '🏆' };
    const colors = { info: '#1565c0', success: '#2e7d32', error: '#c62828', warning: '#f57c00', win: '#d4af37' };
    const notification = document.createElement('div');
    notification.id = 'custom-notification';
    notification.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.8);background:linear-gradient(135deg,#1a1a1a,#2d2d2d);color:white;padding:20px 30px;border-radius:20px;font-family:'Montserrat',sans-serif;font-size:16px;font-weight:600;z-index:10000;border:3px solid ${colors[type] || colors.info};box-shadow:0 15px 40px rgba(0,0,0,0.6);display:flex;align-items:center;gap:12px;min-width:300px;max-width:500px;text-align:center;animation:notificationIn 0.3s ease-out forwards;pointer-events:none;`;
    notification.innerHTML = `<span style="font-size:28px;">${icons[type] || icons.info}</span><span style="flex:1;">${msg}</span>`;
    document.body.appendChild(notification);
    requestAnimationFrame(() => notification.style.transform = 'translate(-50%,-50%) scale(1)');
    setTimeout(() => { notification.style.opacity = '0'; notification.style.transition = 'all 0.3s ease-in'; setTimeout(() => notification.remove(), 300); }, duration);
}
function showConfirm(msg, onConfirm) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;justify-content:center;align-items:center;';
    const notification = document.createElement('div');
    notification.style.cssText = 'background:linear-gradient(135deg,#1a1a1a,#2d2d2d);color:white;padding:30px 35px;border-radius:20px;font-family:"Montserrat",sans-serif;font-size:16px;font-weight:600;border:3px solid #d4af37;box-shadow:0 20px 50px rgba(0,0,0,0.7);text-align:center;min-width:350px;';
    notification.innerHTML = `<p style="margin-bottom:20px;font-size:18px;">${msg}</p><div style="display:flex;gap:15px;justify-content:center;"><button id="notify-yes" style="padding:12px 30px;background:linear-gradient(135deg,#2e7d32,#43a047);color:white;border:none;border-radius:30px;font-size:16px;font-weight:700;cursor:pointer;font-family:'Montserrat',sans-serif;box-shadow:0 4px 0 #1b5e20;">ДА</button><button id="notify-no" style="padding:12px 30px;background:linear-gradient(135deg,#c62828,#e53935);color:white;border:none;border-radius:30px;font-size:16px;font-weight:700;cursor:pointer;font-family:'Montserrat',sans-serif;box-shadow:0 4px 0 #8b0000;">НЕТ</button></div>`;
    overlay.appendChild(notification);
    document.body.appendChild(overlay);
    document.getElementById('notify-yes').onclick = () => { overlay.remove(); if (onConfirm) onConfirm(); };
    document.getElementById('notify-no').onclick = () => overlay.remove();
}
function unlockAchievement(idx) {
    if (achievements[idx].unlocked) return;
    achievements[idx].unlocked = true;
    
    const player = gameState.players[0]; // Игрок-человек всегда первый
    const playerName = player ? player.name : 'Игрок';
    
    DOM.achievementName.textContent = achievements[idx].name;
    DOM.achievementToast.classList.remove('hidden');
    playSound('win');
    
    // Показываем уведомление с именем игрока
    showNotification(`🏆 ${playerName}: ${achievements[idx].name}!`, 'win', 4000);
    
    setTimeout(() => DOM.achievementToast.classList.add('hidden'), 4000);
    addLog(`🏆 ${playerName} получает достижение: ${achievements[idx].name}!`, 'chance');
}
function checkAchievements() {
    const player = gameState.players[0];
    if (!achievements[0].unlocked && gameState.properties.some(p => p.owner === 0)) unlockAchievement(0);
    if (!achievements[4].unlocked && gameState.players.some((p, i) => i !== 0 && p.money <= 0)) unlockAchievement(4);
    if (!achievements[5].unlocked && player.money >= 5000) unlockAchievement(5);
    if (!achievements[7].unlocked && [5, 15, 25, 35].every(i => gameState.properties[i].owner === 0)) unlockAchievement(7);
}
function shuffleDecks() {
    gameState.chanceDeck = [...chanceCards].sort(() => Math.random() - 0.5);
    gameState.chestDeck = [...chestCards].sort(() => Math.random() - 0.5);
}
function isPropertyCell(cell) { return cell && ['street', 'railroad', 'utility'].includes(cell.type); }

// ==================== НАСТРОЙКИ ====================
function loadSettings() {
    const saved = localStorage.getItem('monopoly_settings');
    if (saved) settings = { ...settings, ...JSON.parse(saved) };
    // Применяем язык из настроек
    loadLanguage();
    // Обновляем селект языка в настройках
    const langSelect = document.getElementById('language-select');
    if (langSelect) langSelect.value = currentLang;
    // Обновляем все тексты сразу после загрузки
    setTimeout(() => updateAllTexts(), 100);
}

// ==================== АВТОРИЗАЦИЯ ====================
let authToken = localStorage.getItem('auth_token') || null;
let currentUser = null;

function loginUser() {
    if (authInProgress) return;
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    if (!username || !password) { showAuthError('Заполните все поля'); return; }
    sendToServer({ type: 'LOGIN', username, password });
}
window.loginUser = loginUser;

function registerUser() {
    if (authInProgress) return;
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const password2 = document.getElementById('reg-password2').value;
    if (!username || username.length < 3) { showAuthError('Логин минимум 3 символа'); return; }
    if (!password || password.length < 4) { showAuthError('Пароль минимум 4 символа'); return; }
    if (password !== password2) { showAuthError('Пароли не совпадают'); return; }
    sendToServer({ type: 'REGISTER', username, password });
}
window.registerUser = registerUser;

function guestLoginUser() {
    if (authInProgress) return;
    sendToServer({ type: 'GUEST_LOGIN', username: 'Гость' });
}
window.guestLoginUser = guestLoginUser;

function logoutUser() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('auth_token');
    document.getElementById('user-avatar').textContent = '🚗';
    document.getElementById('user-name-display').textContent = 'Гость';
    DOM.mainMenu.classList.add('hidden');
    document.getElementById('auth-modal').classList.remove('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
}
window.logoutUser = logoutUser;

function handleAuthResult(msg) {
    authInProgress = false;
    ['reg-username','reg-password','reg-password2','login-username','login-password'].forEach(id => {
        const el = document.getElementById(id); if (el) el.disabled = false;
    });
    document.querySelectorAll('.auth-btn').forEach(b => b.disabled = false);
    if (msg.success) {
        authToken = msg.token;
        currentUser = msg.user;
        localStorage.setItem('auth_token', msg.token);
        document.querySelectorAll('.auth-form input').forEach(i => i.value = '');
        document.getElementById('auth-modal').classList.add('hidden');
        DOM.mainMenu.classList.remove('hidden');
        updateUserProfileDisplay(msg.user);
    } else {
        showAuthError(msg.message);
    }
}

function updateUserProfileDisplay(user) {
    document.getElementById('user-avatar').textContent = user.avatar || '🚗';
    document.getElementById('user-name-display').textContent = user.username || 'Гость';
}

// ==================== ЗАГРУЗКА ====================
function simulateLoading() {
    let progress = 0;
    const fill = DOM.progressFill;
    const messages = ['Загрузка правил...', 'Подготовка поля...', 'Раздача карт...', 'Бросок кубиков...', 'Почти готово...'];
    const subtitle = document.querySelector('.preloader-subtitle');
    const interval = setInterval(() => {
        progress += Math.random() * 5 + 2;
        if (progress > 100) progress = 100;
        if (fill) fill.style.width = progress + '%';
        if (subtitle) {
            const msgIndex = Math.min(Math.floor(progress / 20), messages.length - 1);
            subtitle.textContent = messages[msgIndex];
        }
        if (progress >= 100) {
            clearInterval(interval);
            if (subtitle) subtitle.textContent = '✅ Готово!';
            setTimeout(() => {
                DOM.preloader.style.opacity = '0';
                DOM.preloader.style.transition = 'opacity 0.5s ease-out';
                setTimeout(() => {
                    DOM.preloader.classList.add('hidden');
                    DOM.preloader.style.opacity = '1';
                    
                    // ВСЕГДА показываем окно авторизации после загрузки
                    document.getElementById('auth-modal').classList.remove('hidden');
                    document.getElementById('login-form').classList.remove('hidden');
                    document.getElementById('register-form').classList.add('hidden');
                    document.getElementById('auth-error').classList.add('hidden');
                }, 500);
            }, 600);
        }
    }, 50);
}
let cardModal, fieldsModal;
function createCardModal() {
    cardModal = document.createElement('div');
    cardModal.className = 'modal hidden';
    cardModal.id = 'card-modal';
    cardModal.innerHTML = `<div class="modal-content"><h2 id="card-title">🎲 ШАНС</h2><p id="card-text"></p><button id="card-ok-btn" class="action-btn primary">OK</button></div>`;
    document.body.appendChild(cardModal);
    document.getElementById('card-ok-btn').onclick = () => cardModal.classList.add('hidden');
}
function createFieldsModal() {
    // Удаляем старую если есть
    const old = document.getElementById('fields-modal');
    if (old) old.remove();
    
    fieldsModal = document.createElement('div');
    fieldsModal.className = 'modal hidden';
    fieldsModal.id = 'fields-modal';
    fieldsModal.innerHTML = `
        <div class="modal-content" style="max-width:min(1200px,95vw);width:95vw;">
            <span class="close-btn" id="close-fields-btn">&times;</span>
            <h2>📋 ИНФОРМАЦИЯ О ПОЛЯХ</h2>
            <div class="legend-section">
                <h3>💰 ЛЕГЕНДА</h3>
                <div class="legend-items">
                    <div class="legend-item"><span class="legend-icon">🏠</span> Улица</div>
                    <div class="legend-item"><span class="legend-icon">🚂</span> Ж/д станция</div>
                    <div class="legend-item"><span class="legend-icon">💡</span> Коммунальное</div>
                    <div class="legend-item"><span class="legend-icon">🎲</span> Шанс</div>
                    <div class="legend-item"><span class="legend-icon">📦</span> Казна</div>
                    <div class="legend-item"><span class="legend-icon">💰</span> Налог</div>
                    <div class="legend-item"><span class="legend-icon">🔒</span> Тюрьма</div>
                    <div class="legend-item"><span class="legend-icon">🚔</span> Полиция</div>
                </div>
            </div>
            <div class="fields-list-section">
                <h3>📍 ВСЕ ПОЛЯ</h3>
                <div class="fields-grid" id="fields-grid"></div>
            </div>
        </div>`;
    document.body.appendChild(fieldsModal);
    document.getElementById('close-fields-btn').onclick = () => fieldsModal.classList.add('hidden');
}
function showFieldsInfo() {
    const grid = document.getElementById('fields-grid');
    if (!grid) return;
    grid.innerHTML = boardCells.map((c, i) => {
        const displayName = (typeof currentLang !== 'undefined' && currentLang === 'en' && c.name_en) ? c.name_en : c.name;
        return `<div class="field-card"><strong>${i}. ${displayName}</strong><br><small>${fieldHistory[i] || ''}</small></div>`;
    }).join('');
    fieldsModal.classList.remove('hidden');
}
function initTokenSelect() {
    document.getElementById('player-count-select').onchange = (e) => {
        const count = parseInt(e.target.value);
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `<div class="player-token-select"><h3>Игрок ${i+1}</h3><select class="token-dropdown">${['🚗','🐕','🎩','🚢'].map(t => `<option>${t}</option>`).join('')}</select></div>`;
        }
        DOM.tokenSelectContainer.innerHTML = html;
    };
    document.getElementById('player-count-select').dispatchEvent(new Event('change'));
}

// ==================== ПРИВЯЗКИ СОБЫТИЙ ====================
function bindAllEvents() {
    document.getElementById('btn-local').onclick = () => showTokenSelect('local');
    document.getElementById('btn-bot').onclick = () => startBotGame();
    document.getElementById('btn-load').onclick = showLoadModal;
    document.getElementById('btn-settings').onclick = () => DOM.settingsModal.classList.remove('hidden');
    document.getElementById('btn-rules').onclick = () => DOM.rulesModal.classList.remove('hidden');
    
    const allButtons = document.querySelectorAll('.menu-btn');
    allButtons.forEach(btn => {
        if (btn.textContent.includes('Создать онлайн') || btn.textContent.includes('Create Online')) btn.onclick = createOnlineRoom;
        if (btn.textContent.includes('Присоединиться') || btn.textContent.includes('Join Room')) btn.onclick = joinOnlineRoom;
    });
    
    document.getElementById('close-rules').onclick = () => DOM.rulesModal.classList.add('hidden');
    document.getElementById('close-settings').onclick = () => DOM.settingsModal.classList.add('hidden');
    document.getElementById('close-load').onclick = () => DOM.loadModal.classList.add('hidden');
    document.getElementById('cancel-load').onclick = () => DOM.loadModal.classList.add('hidden');
    document.getElementById('cancel-token-select').onclick = () => DOM.tokenModal.classList.add('hidden');
    document.getElementById('save-settings-btn').onclick = () => {
    // Сохраняем настройки
    settings.startingMoney = parseInt(document.getElementById('starting-money').value);
    settings.botCount = parseInt(document.getElementById('bot-count').value);
    settings.animationSpeed = parseFloat(document.getElementById('animation-speed').value);
    settings.soundEnabled = document.getElementById('sound-enabled').value === 'true';
    settings.fastMode = document.getElementById('fast-mode').value === 'true';
    
    // Сохраняем язык
    const newLang = document.getElementById('language-select').value;
    setLanguage(newLang);
    
    // Сохраняем в localStorage
    localStorage.setItem('monopoly_settings', JSON.stringify(settings));
    
    DOM.settingsModal.classList.add('hidden');
    showNotification('✅ ' + (currentLang === 'ru' ? 'Настройки сохранены!' : 'Settings saved!'), 'success');
};document.getElementById('start-local-game-btn').onclick = startLocalGame;
    
    DOM.rollBtn.onclick = () => {
        console.log('🖱️ Нажата БРОСИТЬ | canRoll:', gameState.canRoll, '| myTurn:', isMyMultiplayerTurn());
        rollDice();
    };
    DOM.endTurnBtn.onclick = () => {
        console.log('🖱️ Нажата ЗАВЕРШИТЬ | canRoll:', gameState.canRoll);
        endTurn();
    };
    DOM.buildBtn.onclick = () => {
        console.log('🖱️ Нажата СТРОИТЬ | disabled:', DOM.buildBtn.disabled);
        showBuildPanel();
    };
    
    document.getElementById('buy-property-btn').onclick = () => { console.log('🖱️ Нажата КУПИТЬ'); buyProperty(); };
    document.getElementById('auction-property-btn').onclick = () => {
        console.log('🖱️ Нажата АУКЦИОН');
        const pos = gameState.players[gameState.currentPlayerIndex]?.position;
        if (pos !== undefined) {
            if (isMultiplayer) sendToServer({ type: 'START_AUCTION', position: pos });
            else startAuction(pos);
            DOM.propertyPanel.classList.add('hidden');
        }
    };
    document.getElementById('save-game-btn').onclick = () => { console.log('🖱️ Нажата СОХРАНИТЬ'); showSaveDialog(); };
    document.getElementById('trade-btn').onclick = () => { console.log('🖱️ Нажата ТОРГОВЛЯ'); showTradePanel(); };
    document.getElementById('mortgage-btn').onclick = () => { console.log('🖱️ Нажата ЗАЛОГ'); showMortgagePanel(); };
    document.getElementById('place-bid-btn').onclick = () => { console.log('🖱️ Нажата СТАВКА'); placeBid(); };
    document.getElementById('pass-auction-btn').onclick = () => { console.log('🖱️ Нажата ПАС'); passAuction(); };
    document.getElementById('close-build-panel').onclick = () => DOM.buildPanel.classList.add('hidden');
    document.getElementById('close-mortgage-panel').onclick = () => DOM.mortgagePanel.classList.add('hidden');
    document.getElementById('close-trade-panel').onclick = () => DOM.tradePanel.classList.add('hidden');
    document.getElementById('propose-trade-btn').onclick = () => { console.log('🖱️ Нажата ПРЕДЛОЖИТЬ'); proposeTrade(); };
    document.getElementById('accept-trade-btn').onclick = () => { console.log('🖱️ Нажата ПРИНЯТЬ'); acceptTrade(); };
    document.getElementById('reject-trade-btn').onclick = () => { console.log('🖱️ Нажата ОТКЛОНИТЬ'); rejectTrade(); };
    document.getElementById('menu-back-btn').onclick = () => { console.log('🖱️ Нажата МЕНЮ'); showConfirm('Выйти в меню?', backToMenu); };
    
    const fieldsBtn = document.getElementById('fields-info-btn');
    if (fieldsBtn) fieldsBtn.onclick = () => { console.log('🖱️ Нажата ПОЛЯ'); showFieldsInfo(); };
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.onclick = () => { console.log('🖱️ Нажата ВЫХОД'); logoutUser(); };
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'r' || e.key === 'R') {
            if (!e.target.matches('input, textarea')) {
                gameState.canRoll = true;
                DOM.rollBtn.disabled = false;
                console.log('🔓 Ход принудительно разблокирован (клавиша R)');
            }
        }
    });
}
window.createOnlineRoom = createOnlineRoom;
window.joinOnlineRoom = joinOnlineRoom;

function createOnlineRoom() {
    console.log('🌐 createOnlineRoom вызвана. wsConnection:', wsConnection?.readyState);
    
    if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
        showNotification('❌ Нет подключения к серверу! Запустите сервер.', 'error', 4000);
        console.log('❌ WebSocket не подключён. readyState:', wsConnection?.readyState);
        return;
    }
    
    const name = currentUser?.username || 'Игрок';
    const avatar = currentUser?.avatar || '🚗';
    const color = currentUser?.color || '#e53935';
    
    console.log('📤 Отправляю CREATE_ROOM:', { name, avatar, color });
    sendToServer({ 
        type: 'CREATE_ROOM', 
        name: name, 
        token: avatar, 
        color: color, 
        userId: currentUser?.id 
    });
}

function joinOnlineRoom() {
    console.log('🔗 joinOnlineRoom вызвана');
    
    if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
        showNotification('❌ Нет подключения к серверу!', 'error', 4000);
        return;
    }
    
    showNotificationInput('Введите код комнаты:', '', (roomId) => {
        const name = currentUser?.username || 'Игрок';
        const avatar = currentUser?.avatar || '🐕';
        const color = currentUser?.color || '#1e88e5';
        
        console.log('📤 Отправляю JOIN_ROOM:', roomId.toUpperCase());
        sendToServer({ 
            type: 'JOIN_ROOM', 
            roomId: roomId.toUpperCase(), 
            name: name, 
            token: avatar, 
            color: color, 
            userId: currentUser?.id 
        });
    });
}

function showNotificationInput(msg, placeholder, onSubmit) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;justify-content:center;align-items:center;';
    const notification = document.createElement('div');
    notification.style.cssText = 'background:linear-gradient(135deg,#1a1a1a,#2d2d2d);color:white;padding:30px 35px;border-radius:20px;font-family:"Montserrat",sans-serif;font-size:16px;font-weight:600;border:3px solid #d4af37;box-shadow:0 20px 50px rgba(0,0,0,0.7);text-align:center;min-width:350px;max-width:min(92vw,520px);';
    notification.innerHTML = `<p style="margin-bottom:15px;font-size:18px;">${msg}</p><input type="text" id="notify-input" placeholder="${placeholder || ''}" style="width:100%;padding:12px 15px;border-radius:12px;border:2px solid #d4af37;background:#fffef5;font-size:16px;font-family:'Montserrat',sans-serif;margin-bottom:20px;outline:none;color:#1a1a1a;"><div style="display:flex;gap:15px;justify-content:center;flex-wrap:wrap;"><button id="notify-ok" style="padding:12px 30px;background:linear-gradient(135deg,#2e7d32,#43a047);color:white;border:none;border-radius:30px;font-size:16px;font-weight:700;cursor:pointer;font-family:'Montserrat',sans-serif;box-shadow:0 4px 0 #1b5e20;">OK</button><button id="notify-cancel" style="padding:12px 30px;background:linear-gradient(135deg,#c62828,#e53935);color:white;border:none;border-radius:30px;font-size:16px;font-weight:700;cursor:pointer;font-family:'Montserrat',sans-serif;box-shadow:0 4px 0 #8b0000;">ОТМЕНА</button></div>`;
    overlay.appendChild(notification);
    document.body.appendChild(overlay);
    const input = document.getElementById('notify-input');
    input.focus();
    document.getElementById('notify-ok').onclick = () => { const v = input.value.trim(); overlay.remove(); if (v && onSubmit) onSubmit(v); };
    document.getElementById('notify-cancel').onclick = () => overlay.remove();
    input.onkeypress = (e) => { if (e.key === 'Enter') { const v = input.value.trim(); overlay.remove(); if (v && onSubmit) onSubmit(v); } };
}

function showTokenSelect(mode) { DOM.tokenModal.classList.remove('hidden'); }

// ==================== РЕНДЕР ДОСКИ ====================
function renderBoard() {
    if (!DOM.board) return;
    DOM.board.innerHTML = '';
    
    for (let row = 0; row < 11; row++) {
        for (let col = 0; col < 11; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            const isTop = row === 0;
            const isBottom = row === 10;
            const isLeft = col === 0;
            const isRight = col === 10;
            const isCorner = (isTop || isBottom) && (isLeft || isRight);
            
            if (isTop || isBottom || isLeft || isRight) {
                let idx = -1;
                if (isBottom && !isCorner) idx = col;
                else if (isRight && !isCorner) idx = 10 + (10 - row);
                else if (isTop && !isCorner) idx = 20 + (10 - col);
                else if (isLeft && !isCorner) idx = 30 + row;
                
                if (row === 10 && col === 0) idx = 0;
                if (row === 10 && col === 10) idx = 10;
                if (row === 0 && col === 10) idx = 20;
                if (row === 0 && col === 0) idx = 30;

                const data = boardCells[idx];
                cell.id = `cell-${idx}`;
                cell.style.background = data.color ? data.color + '22' : '#c8e6c9';
                cell.innerHTML = `
                    <div class="color-bar" style="background:${data.color || '#ddd'}"></div>
                    <div class="tokens-container" id="tokens-${idx}"></div>
                    <div class="houses-container" id="houses-${idx}"></div>
                    <div class="cell-content">
                        <strong>${data.name}</strong>
                        <small>${data.price ? '$'+data.price : ''}</small>
                        <div class="owner-indicator" id="owner-${idx}"></div>
                    </div>`;
                cell.onmouseenter = (e) => {
    if (tooltipTimeout) clearTimeout(tooltipTimeout);
    showTooltip(e, idx);
};
cell.onmouseleave = () => {
    hideTooltip();
};
cell.onmousemove = (e) => {
    // Обновляем позицию при движении
    DOM.cellTooltip.style.left = (e.clientX + 15) + 'px';
    DOM.cellTooltip.style.top = (e.clientY + 15) + 'px';
};
                if ((col === 0 || col === 10) && !isTop && !isBottom) cell.style.writingMode = 'vertical-rl';
            } else {
                cell.style.background = 'transparent';
                cell.style.border = 'none';
                cell.style.pointerEvents = 'none';
            }
            DOM.board.appendChild(cell);
        }
    }
    // createCenterPanel() вызывается в initGame()
}

function createCenterPanel() {
    const old = document.querySelector('.center-panel');
    if (old) old.remove();
    
    const centerPanel = document.createElement('div');
    centerPanel.className = 'center-panel';
    centerPanel.innerHTML = `
        <div class="center-panel-header">
            <div class="center-logo">🎲</div>
            <div class="center-title">MONOPOLY</div>
        </div>
        <div class="center-game-info">
            <div class="center-info-item">
                <span class="center-label">Ход</span>
                <span class="center-value" id="center-turn">0</span>
            </div>
            <div class="center-info-item">
                <span class="center-label">Время</span>
                <span class="center-value" id="center-time">00:00</span>
            </div>
        </div>
        <div class="center-tabs">
            <button class="center-tab active" data-tab="players">👥 Игроки</button>
            <button class="center-tab" data-tab="log">📋 Лог</button>
            <button class="center-tab" data-tab="stats">📊 Статы</button>
        </div>
        <div class="center-tab-content" id="center-tab-content">
            <div class="center-tab-panel active" id="center-tab-players">
                <div class="center-players" id="center-players"></div>
            </div>
            <div class="center-tab-panel" id="center-tab-log">
                <div class="center-log-content" id="center-log-content"></div>
            </div>
            <div class="center-tab-panel" id="center-tab-stats">
                <div class="center-stats-content" id="center-stats-content">
                    <canvas id="center-wealth-chart" width="180" height="120"></canvas>
                </div>
            </div>
        </div>
        <div class="center-decks">
            <div class="center-deck chance-deck"><span>🃏</span><span>ШАНС</span></div>
            <div class="center-deck chest-deck"><span>📦</span><span>КАЗНА</span></div>
        </div>`;
    
    DOM.board.appendChild(centerPanel);
    
    // Обработчики вкладок
    centerPanel.querySelectorAll('.center-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            centerPanel.querySelectorAll('.center-tab').forEach(t => t.classList.remove('active'));
            centerPanel.querySelectorAll('.center-tab-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const target = document.getElementById('center-tab-' + tab.dataset.tab);
            if (target) target.classList.add('active');
        });
    });
    
    updateCenterPanel();
}
let tooltipTimeout = null;

function showTooltip(e, idx) {
    // Очищаем предыдущий таймаут
    if (tooltipTimeout) clearTimeout(tooltipTimeout);
    
    const cell = boardCells[idx];
    const prop = gameState.properties[idx];
    
    let text = `<b>${idx}. ${cell.name}</b><br>`;
    if (cell.price > 0) text += `💰 Цена: ${cell.price}$<br>`;
    if (prop && prop.owner !== null && gameState.players[prop.owner]) {
        text += `👤 Владелец: ${gameState.players[prop.owner].name}<br>`;
        if (prop.houses > 0) text += `🏠 Дома: ${prop.houses === 5 ? 'ОТЕЛЬ' : prop.houses}<br>`;
        if (prop.mortgaged) text += `🔒 ЗАЛОЖЕНО<br>`;
    }
    text += `<i>${fieldHistory[idx] || ''}</i>`;
    
    DOM.cellTooltip.innerHTML = text;
    
    // Позиционируем с учётом границ экрана
    let left = e.clientX + 15;
    let top = e.clientY + 15;
    
    const tooltipRect = DOM.cellTooltip.getBoundingClientRect();
    if (left + 250 > window.innerWidth) left = e.clientX - 260;
    if (top + 100 > window.innerHeight) top = e.clientY - 110;
    
    DOM.cellTooltip.style.left = left + 'px';
    DOM.cellTooltip.style.top = top + 'px';
    DOM.cellTooltip.classList.remove('hidden');
}

// Убираем тултип с задержкой
function hideTooltip() {
    tooltipTimeout = setTimeout(() => {
        DOM.cellTooltip.classList.add('hidden');
    }, 100);
}

// Показываем тултип без задержки при наведении
function showTooltipInstant(e, idx) {
    if (tooltipTimeout) clearTimeout(tooltipTimeout);
    showTooltip(e, idx);
}

// ==================== ОБНОВЛЕНИЕ ДОСКИ ====================
function updateTokensInstant() {
    for (let i = 0; i < 40; i++) { const c = document.getElementById(`tokens-${i}`); if (c) c.innerHTML = ''; }
    gameState.players.forEach((p, idx) => {
        const c = document.getElementById(`tokens-${p.position}`);
        if (c) {
            const t = document.createElement('div');
            t.className = 'cell-token';
            t.id = `player-token-${idx}`;
            t.textContent = p.token;
            t.title = p.name;
            t.style.cssText = `font-size:18px;filter:drop-shadow(0 2px 2px black);color:${p.color};background:white;border-radius:50%;width:25px;height:25px;display:flex;align-items:center;justify-content:center;border:2px solid ${p.color};margin:1px;`;
            c.appendChild(t);
        }
    });
}
function updateOwnerIndicator(idx, color) {
    const ind = document.getElementById(`owner-${idx}`);
    if (ind) {
        if (color) { ind.style.background = color; ind.style.boxShadow = `0 0 8px ${color}`; ind.style.display = 'block'; }
        else { ind.style.background = 'transparent'; ind.style.boxShadow = 'none'; ind.style.display = 'none'; }
    }
}
function updateHousesDisplay(idx) {
    const c = document.getElementById(`houses-${idx}`);
    if (!c) return;
    const prop = gameState.properties[idx];
    if (!prop || prop.owner === null || prop.houses === 0) { c.innerHTML = ''; return; }
    c.innerHTML = prop.houses === 5 ? '<span class="hotel-icon">🏨</span>' : Array(prop.houses).fill('<span class="house-icon">🏠</span>').join('');
}
function updateAllOwnerIndicators() {
    for (let i = 0; i < 40; i++) {
        const prop = gameState.properties[i];
        updateOwnerIndicator(i, prop && prop.owner !== null ? gameState.players[prop.owner]?.color : null);
    }
}
function updateAllHouses() { for (let i = 0; i < 40; i++) updateHousesDisplay(i); }

// ==================== АНИМАЦИЯ ====================
let isAnimating = false;
async function animateTokenMovement(playerIdx, oldPos, newPos) {
    const speed = Math.max(0.2, (settings.fastMode ? 0.35 : 0.5) * (settings.animationSpeed || 1));
    const token = document.getElementById(`player-token-${playerIdx}`);
    if (!token) return;
    const oldCell = document.getElementById(`cell-${oldPos}`);
    const newCell = document.getElementById(`cell-${newPos}`);
    if (!oldCell || !newCell) return;
    const oldRect = oldCell.getBoundingClientRect();
    const newRect = newCell.getBoundingClientRect();
    const flying = document.createElement('div');
    flying.textContent = token.textContent;
    flying.style.cssText = `position:fixed;left:${oldRect.left + oldRect.width/2 - 15}px;top:${oldRect.top + oldRect.height/2 - 15}px;font-size:22px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;background:white;border-radius:50%;border:3px solid ${gameState.players[playerIdx].color};color:${gameState.players[playerIdx].color};z-index:9999;filter:drop-shadow(0 5px 10px rgba(0,0,0,0.5));transition:all ${speed}s;pointer-events:none;`;
    document.body.appendChild(flying);
    token.style.opacity = '0';
    await new Promise(r => setTimeout(r, 80));
    flying.style.left = `${newRect.left + newRect.width/2 - 15}px`;
    flying.style.top = `${newRect.top + newRect.height/2 - 15}px`;
    await new Promise(r => setTimeout(r, speed * 1000));
    flying.remove();
    const oldC = document.getElementById(`tokens-${oldPos}`);
    const newC = document.getElementById(`tokens-${newPos}`);
    if (oldC && newC) { if (oldC.contains(token)) oldC.removeChild(token); newC.appendChild(token); token.style.opacity = '1'; }
}
// ==================== ОДИНОЧНАЯ ИГРОВАЯ ЛОГИКА ====================
function rollDiceSingle() {
    if (!gameState.gameActive || isAnimating || !gameState.canRoll) return;
    const player = gameState.players[gameState.currentPlayerIndex];
    if (gameState.jailStatus[gameState.currentPlayerIndex]?.inJail) { handleJailTurn(); return; }
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const steps = d1 + d2;
    DOM.dice1.textContent = ['⚀','⚁','⚂','⚃','⚄','⚅'][d1-1];
    DOM.dice2.textContent = ['⚀','⚁','⚂','⚃','⚄','⚅'][d2-1];
    playSound('dice');
    addLog(`${player.name} выбросил ${d1}+${d2}=${steps}`, 'info');
    gameState.canRoll = false;
    DOM.rollBtn.disabled = true;
    setTimeout(async () => { await movePlayer(steps); }, settings.fastMode ? 100 : 300);
}

function handleJailTurn() {
    const player = gameState.players[gameState.currentPlayerIndex];
    const js = gameState.jailStatus[gameState.currentPlayerIndex];
    js.turnsInJail++;
    if (js.hasGetOutOfJailCard) {
        js.inJail = false; js.turnsInJail = 0; js.hasGetOutOfJailCard = false;
        renderPlayersHeader(); DOM.rollBtn.disabled = false;
        addLog(`${player.name} освободился по карте`, 'jail');
        return;
    }
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    DOM.dice1.textContent = ['⚀','⚁','⚂','⚃','⚄','⚅'][d1-1];
    DOM.dice2.textContent = ['⚀','⚁','⚂','⚃','⚄','⚅'][d2-1];
    if (d1 === d2) {
        js.inJail = false; js.turnsInJail = 0;
        renderPlayersHeader();
        addLog(`${player.name} выбросил дубль!`, 'jail');
        if (!achievements[3].unlocked) unlockAchievement(3);
        setTimeout(async () => { await movePlayer(d1 + d2); }, 500);
    } else if (js.turnsInJail >= 3) {
        player.money = Math.max(0, player.money - 50);
        js.inJail = false; js.turnsInJail = 0;
        renderPlayersHeader(); updateUI();
        addLog(`${player.name} заплатил 50$`, 'pay');
        setTimeout(async () => { await movePlayer(d1 + d2); }, 500);
    } else {
        DOM.gameMessage.textContent = `${player.name} в тюрьме. Ход ${js.turnsInJail}/3`;
        renderPlayersHeader();
        addLog(`${player.name} в тюрьме`, 'jail');
        setTimeout(endTurnSingle, 1000);
    }
}

async function movePlayer(steps) {
    const player = gameState.players[gameState.currentPlayerIndex];
    const oldPos = player.position;
    isAnimating = true;
    gameState.canRoll = false;
    DOM.rollBtn.disabled = true;
    let cur = oldPos;
    for (let s = 1; s <= steps; s++) {
        const nxt = (oldPos + s) % 40;
        await animateTokenMovement(gameState.currentPlayerIndex, cur, nxt);
        cur = nxt;
        await new Promise(r => setTimeout(r, settings.fastMode ? 50 : 100));
    }
    player.position = (oldPos + steps) % 40;
    if (oldPos + steps >= 40) { player.money += 200; addLog(`${player.name} прошёл СТАРТ +200$`, 'buy'); }
    isAnimating = false;
    const cell = boardCells[player.position];
    updateUI();
    updateCenterPanel();
    if (cell.type === 'chance') showCard('chance');
    else if (cell.type === 'chest') showCard('chest');
    else if (cell.type === 'street' || cell.type === 'railroad' || cell.type === 'utility') {
        const prop = gameState.properties[player.position];
        if (prop.owner === null) {
            if (!player.isBot) {
                DOM.propName.textContent = cell.name;
                DOM.propPrice.textContent = `💰 Цена: ${cell.price}$`;
                DOM.propRent.textContent = `📈 Аренда: ${cell.rent}$`;
                DOM.propertyPanel.classList.remove('hidden');
            } else {
                setTimeout(() => { if (player.money > cell.price + 200) buyProperty(); else startAuction(player.position); }, 800);
            }
            return;
        } else if (prop.owner !== gameState.currentPlayerIndex && !prop.mortgaged) {
            let rent = cell.rent;
            if (cell.type === 'street' && prop.houses > 0) rent = rentWithHouses[cell.group][prop.houses];
            else if (cell.type === 'railroad') {
                const count = [5,15,25,35].filter(i => gameState.properties[i].owner === prop.owner).length;
                rent = 25 * Math.pow(2, count - 1);
            }
            rent = Math.min(rent, player.money);
            player.money -= rent;
            gameState.players[prop.owner].money += rent;
            addLog(`${player.name} платит ${rent}$ → ${gameState.players[prop.owner].name}`, 'pay');
        }
    } else if (cell.type === 'tax') {
        player.money = Math.max(0, player.money - cell.rent);
        addLog(`${player.name} платит налог ${cell.rent}$`, 'pay');
    }
    if (player.position === 30) {
        player.position = 10;
        gameState.jailStatus[gameState.currentPlayerIndex] = { inJail: true, turnsInJail: 0 };
        addLog(`${player.name} в тюрьму!`, 'jail');
        updateTokensInstant();
        renderPlayersHeader();
    }
    DOM.endTurnBtn.disabled = false;
    updateBuildButton();
    checkAchievements();
    if (player.isBot && DOM.propertyPanel.classList.contains('hidden')) {
        gameState.botTimeout = setTimeout(endTurnSingle, settings.fastMode ? 800 : 1500);
    }
}

// ==================== РУЛЕТКА ====================
function showCard(type) {
    const player = gameState.players[gameState.currentPlayerIndex];
    let card;
    if (type === 'chance') {
        if (!gameState.chanceDeck.length) gameState.chanceDeck = [...chanceCards].sort(() => Math.random() - 0.5);
        card = gameState.chanceDeck.pop();
    } else {
        if (!gameState.chestDeck.length) gameState.chestDeck = [...chestCards].sort(() => Math.random() - 0.5);
        card = gameState.chestDeck.pop();
    }
    console.log('🃏 Выпала карта:', card.text);
    gameState._pendingCard = { type, card };
    showRoulette(type);
}

function showRoulette(type) {
    const overlay = document.getElementById('roulette-overlay');
    const title = document.getElementById('roulette-title');
    const strip = document.getElementById('roulette-strip');
    const result = document.getElementById('roulette-result');
    
    if (!overlay || !strip) { applyPendingCardSimple(); return; }
    
    if (!strip.dataset.built) {
        let html = '';
        const items = ['💰', '💸', '🎁', '🔒', '🚀', '💎', '🎰', '🏆', '💣', '🌟'];
        for (let copy = 0; copy < 5; copy++) items.forEach(item => { html += `<div class="roulette-slot" style="font-size:35px;">${item}</div>`; });
        strip.innerHTML = html;
        strip.dataset.built = '1';
    }
    
    title.textContent = type === 'chance' ? '🎲 ШАНС' : '📦 КАЗНА';
    result.classList.add('hidden');
    overlay.classList.remove('hidden');
    overlay.style.display = 'flex';
    
    strip.style.transition = 'none';
    strip.style.transform = 'translateX(0)';
    void strip.offsetWidth;
    
    const randomSpins = 3000 + Math.floor(Math.random() * 2000);
    strip.style.transition = 'transform 4s cubic-bezier(0.15, 0.85, 0.20, 1.0)';
    strip.style.transform = `translateX(-${randomSpins}px)`;
    
    setTimeout(() => {
        const pending = gameState._pendingCard;
        if (!pending) return;
        
        const player = gameState.players[gameState.currentPlayerIndex];
        const card = pending.card;
        
        card.action(player, gameState, gameState.currentPlayerIndex);
        
        updateUI();
        updateCenterPanel();
        renderPlayersHeader();
        
        // Показываем результат с именем игрока
        const resultText = document.getElementById('roulette-result-text');
        if (result && resultText) {
            resultText.textContent = `${player.name}: ${card.text}`;
            result.classList.remove('hidden');
        }
        
        addLog(`${player.name}: ${card.text}`, type === 'chance' ? 'chance' : 'chest');
        
        // Уведомление ВСЕМ (в мультиплеере)
        if (isMultiplayer) {
            showNotification(`🎰 ${player.name}: ${card.text}`, 'info', 3000);
        }
        
        gameState._pendingCard = null;
    }, 4200);
}
function applyPendingCardSimple() {
    const pending = gameState._pendingCard;
    if (!pending) return;
    const player = gameState.players[gameState.currentPlayerIndex];
    const card = pending.card;
    const type = pending.type;
    card.action(player, gameState, gameState.currentPlayerIndex);
    updateUI();
    updateCenterPanel();
    renderPlayersHeader();
    addLog(`${player.name}: ${card.text}`, type === 'chance' ? 'chance' : 'chest');
    if (!player.isBot) DOM.endTurnBtn.disabled = false;
    else gameState.botTimeout = setTimeout(() => { if (isMultiplayer) sendToServer({ type: 'END_TURN' }); else endTurnSingle(); }, settings.fastMode ? 800 : 1500);
    gameState._pendingCard = null;
}

// ==================== ПОКУПКА, ХОД, БАНКРОТСТВО ====================
function buyPropertySingle() {
    const player = gameState.players[gameState.currentPlayerIndex];
    const cell = boardCells[player.position];
    const prop = gameState.properties[player.position];
    if (!isPropertyCell(cell) || prop.owner !== null) { showNotification('Эту клетку нельзя купить', 'warning'); return; }
    if (player.money >= cell.price) {
        player.money -= cell.price;
        gameState.properties[player.position].owner = gameState.currentPlayerIndex;
        updateOwnerIndicator(player.position, player.color);
        addLog(`${player.name} купил ${cell.name} за ${cell.price}$`, 'buy');
        showNotification(`🏠 ${player.name} купил ${cell.name}!`, 'success', 2000);
        playSound('buy');
        if (!achievements[0].unlocked) unlockAchievement(0);
    } else { showNotification('Недостаточно денег!', 'warning'); return; }
    DOM.propertyPanel.classList.add('hidden');
    updateUI();
    updateCenterPanel();
    DOM.endTurnBtn.disabled = false;
    updateBuildButton();
    if (player.isBot) gameState.botTimeout = setTimeout(endTurnSingle, 1000);
}

function endTurnSingle() {
    checkBankruptcies();
    if (!gameState.gameActive) return;
    if (!gameState.gameActive || isAnimating) return;
    if (gameState.botTimeout) { clearTimeout(gameState.botTimeout); gameState.botTimeout = null; }
     recordWealth(); 
    DOM.propertyPanel.classList.add('hidden');
    DOM.buildPanel.classList.add('hidden');
    DOM.auctionPanel.classList.add('hidden');
    DOM.mortgagePanel.classList.add('hidden');
    DOM.tradePanel.classList.add('hidden');
    let nextIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    let attempts = 0;
    while (gameState.players[nextIndex]?.isBankrupt && attempts < gameState.players.length) { nextIndex = (nextIndex + 1) % gameState.players.length; attempts++; }
    gameState.currentPlayerIndex = nextIndex;
    gameState.canRoll = true;
    gameState.turnCount++;
    DOM.rollBtn.disabled = false;
    DOM.endTurnBtn.disabled = true;
    DOM.buildBtn.disabled = true;
    DOM.turnCounter.textContent = `Ход: ${gameState.turnCount}`;
    updateUI();
    updateCenterPanel();
    renderPlayersHeader();
    updateBuildButton();
    updateAllOwnerIndicators();
    updateAllHouses();
    updateTokensInstant();
    const nextPlayer = gameState.players[gameState.currentPlayerIndex];
    const inJail = gameState.jailStatus[gameState.currentPlayerIndex]?.inJail;
    DOM.gameMessage.textContent = `🎯 Ход: ${nextPlayer.name}${inJail ? ' (в тюрьме)' : ''}`;
    if (nextPlayer.isBot && !nextPlayer.isBankrupt) {
        const delay = settings.fastMode ? 600 : 1000;
        gameState.botTimeout = setTimeout(() => { if (gameState.gameActive && gameState.canRoll && !isAnimating) rollDice(); }, delay);
    }
}

function checkBankruptcies() {
    for (let i = gameState.players.length - 1; i >= 0; i--) {
        const player = gameState.players[i];
        if (player.isBankrupt) continue;
        if (player.money > 0) continue;
        const hasProperty = gameState.properties.some((p, idx) => p.owner === i && !p.mortgaged && isPropertyCell(boardCells[idx]));
        if (!hasProperty) {
            player.isBankrupt = true;
            player.money = 0;
            gameState.properties.forEach((prop, idx) => { if (prop.owner === i) { prop.owner = null; prop.houses = 0; prop.mortgaged = false; updateOwnerIndicator(idx, null); updateHousesDisplay(idx); } });
            addLog(`💀 ${player.name} ОБАНКРОТИЛСЯ!`, 'pay');
            showNotification(`💀 ${player.name} обанкротился!`, 'error', 4000);
            const alivePlayers = gameState.players.filter(p => !p.isBankrupt);
            if (alivePlayers.length <= 1) {
                gameState.gameActive = false;
                const winner = alivePlayers[0];
                DOM.gameMessage.textContent = `🏆 ${winner.name} ПОБЕДИЛ!`;
                addLog(`🏆 ${winner.name} выиграл игру!`, 'win');
                DOM.rollBtn.disabled = true;
                DOM.endTurnBtn.disabled = true;
                DOM.buildBtn.disabled = true;
                showNotification(`🏆 ${winner.name} победил!`, 'win', 6000);
                if (!achievements[9].unlocked) unlockAchievement(9);
                if (!achievements[4].unlocked) unlockAchievement(4);
                updateUI();
                updateCenterPanel();
                renderPlayersHeader();
                updateTokensInstant();
                updateAllOwnerIndicators();
                updateAllHouses();
            }
        } else { if (!player.isBot) showNotification('⚠️ У вас нет денег! Заложите недвижимость.', 'warning', 4000); }
    }
}

// ==================== АУКЦИОН ====================
function startAuction(propertyIndex) {
    gameState.auctionActive = true;
    gameState.auctionProperty = propertyIndex;
    gameState.auctionCurrentBid = Math.floor(boardCells[propertyIndex].price / 2);
    gameState.auctionBidder = null;
    gameState.auctionPassed = [];
    DOM.auctionPropName.textContent = boardCells[propertyIndex].name;
    DOM.auctionStartPrice.textContent = gameState.auctionCurrentBid + '$';
    DOM.auctionCurrentBid.textContent = gameState.auctionCurrentBid + '$';
    DOM.auctionBidder.textContent = '-';
    DOM.auctionPanel.classList.remove('hidden');
    DOM.propertyPanel.classList.add('hidden');
    addLog(`🔨 Аукцион за ${boardCells[propertyIndex].name}!`, 'info');
    if (!isMultiplayer) startBotAuction();
}

function startBotAuction() {
    const botPlayers = gameState.players.map((p, i) => ({ player: p, index: i })).filter(p => p.player.isBot && !p.player.isBankrupt && p.player.money > 0);
    let botIndex = 0;
    function processNextBot() {
        if (!gameState.auctionActive) return;
        if (botIndex >= botPlayers.length) return;
        const { player, index } = botPlayers[botIndex];
        const delay = 800 + Math.random() * 1200;
        setTimeout(() => {
            if (!gameState.auctionActive || gameState.auctionPassed.includes(index)) { botIndex++; processNextBot(); return; }
            const maxBid = Math.floor(boardCells[gameState.auctionProperty].price * 0.8);
            if (gameState.auctionCurrentBid < maxBid && player.money > gameState.auctionCurrentBid + 10) {
                const newBid = Math.min(gameState.auctionCurrentBid + 10 + Math.floor(Math.random() * 40), player.money);
                gameState.auctionCurrentBid = newBid;
                gameState.auctionBidder = index;
                DOM.auctionCurrentBid.textContent = newBid + '$';
                DOM.auctionBidder.textContent = player.name;
                addLog(`${player.name} ставит ${newBid}$`, 'buy');
            } else {
                gameState.auctionPassed.push(index);
                addLog(`${player.name} пасует`, 'info');
                const activePlayers = gameState.players.filter((p, i) => !gameState.auctionPassed.includes(i) && p.money > 0 && !p.isBankrupt);
                if (activePlayers.length <= 1 && gameState.auctionBidder !== null) { endAuction(); return; }
                else if (activePlayers.length === 0) { gameState.auctionActive = false; DOM.auctionPanel.classList.add('hidden'); addLog('Аукцион отменён', 'info'); return; }
            }
            botIndex++;
            processNextBot();
        }, delay);
    }
    processNextBot();
}

function placeBidSingle() {
    const input = document.getElementById('auction-bid-input');
    const amount = parseInt(input.value);
    const player = gameState.players[gameState.currentPlayerIndex];
    if (amount <= gameState.auctionCurrentBid) { showNotification('Ставка должна быть больше!', 'warning'); return; }
    if (player.money < amount) { showNotification('Недостаточно денег!', 'warning'); return; }
    gameState.auctionCurrentBid = amount;
    gameState.auctionBidder = gameState.currentPlayerIndex;
    DOM.auctionCurrentBid.textContent = amount + '$';
    DOM.auctionBidder.textContent = player.name;
    input.value = amount + 10;
    addLog(`${player.name} ставит ${amount}$`, 'buy');
}

function passAuctionSingle() {
    const playerIdx = gameState.currentPlayerIndex;
    if (gameState.auctionPassed.includes(playerIdx)) return;
    gameState.auctionPassed.push(playerIdx);
    addLog(`${gameState.players[playerIdx].name} пасует`, 'info');
    const activePlayers = gameState.players.filter((p, i) => !gameState.auctionPassed.includes(i) && p.money > 0 && !p.isBankrupt);
    if (activePlayers.length <= 1) { if (gameState.auctionBidder !== null) endAuction(); else { gameState.auctionActive = false; DOM.auctionPanel.classList.add('hidden'); addLog('Аукцион отменён', 'info'); } }
    else endTurnSingle();
}

function endAuction() {
    if (gameState.auctionBidder !== null) {
        const winner = gameState.players[gameState.auctionBidder];
        const propIdx = gameState.auctionProperty;
        winner.money -= gameState.auctionCurrentBid;
        gameState.properties[propIdx].owner = gameState.auctionBidder;
        updateOwnerIndicator(propIdx, winner.color);
        addLog(`${winner.name} выиграл аукцион за ${boardCells[propIdx].name}`, 'buy');
        showNotification(`🔨 ${winner.name} выиграл аукцион!`, 'success', 3000);
        if (!achievements[8].unlocked) unlockAchievement(8);
    }
    gameState.auctionActive = false;
    DOM.auctionPanel.classList.add('hidden');
    updateUI();
    updateCenterPanel();
    DOM.endTurnBtn.disabled = false;
}
// ==================== СТРОИТЕЛЬСТВО, ЗАЛОГ, ТОРГОВЛЯ ====================
function buildHouseSingle(idx) {
    const player = gameState.players[gameState.currentPlayerIndex];
    const prop = gameState.properties[idx];
    const cell = boardCells[idx];
    const cost = houseCosts[cell.group] || 100;
    if (prop.owner !== gameState.currentPlayerIndex || prop.houses >= 5 || prop.mortgaged) return;
    if (player.money < cost) { showNotification('Недостаточно денег!', 'warning'); return; }
    player.money -= cost;
    prop.houses++;
    if (prop.houses === 5 && !achievements[2].unlocked) unlockAchievement(2);
    updateHousesDisplay(idx);
    updateUI();
    updateCenterPanel();
    addLog(`${player.name} построил дом на ${cell.name}`, 'buy');
    playSound('buy');
    showBuildPanel();
}
function sellHouseSingle(idx) {
    const player = gameState.players[gameState.currentPlayerIndex];
    const prop = gameState.properties[idx];
    const cell = boardCells[idx];
    const cost = houseCosts[cell.group] || 100;
    if (prop.owner !== gameState.currentPlayerIndex || prop.houses <= 0) return;
    player.money += Math.floor(cost / 2);
    prop.houses--;
    updateHousesDisplay(idx);
    updateUI();
    updateCenterPanel();
    addLog(`${player.name} продал дом на ${cell.name}`, 'info');
    showBuildPanel();
}
function toggleMortgageSingle(idx) {
    const player = gameState.players[gameState.currentPlayerIndex];
    const prop = gameState.properties[idx];
    const cell = boardCells[idx];
    if (prop.mortgaged) {
        const cost = Math.floor(cell.price * 0.55);
        if (player.money < cost) { showNotification('Недостаточно денег!', 'warning'); return; }
        player.money -= cost; prop.mortgaged = false;
        addLog(`${player.name} выкупил ${cell.name}`, 'info');
    } else {
        if (prop.houses > 0) { showNotification('Сначала продайте дома!', 'warning'); return; }
        player.money += Math.floor(cell.price / 2); prop.mortgaged = true;
        addLog(`${player.name} заложил ${cell.name}`, 'pay');
    }
    updateUI(); updateCenterPanel(); showMortgagePanel();
}
function proposeTradeSingle() {
    const player = gameState.players[gameState.currentPlayerIndex];
    const partnerIdx = parseInt(DOM.tradePartnerSelect.value);
    const partner = gameState.players[partnerIdx];
    const myProps = [...document.querySelectorAll('.my-prop:checked')].map(cb => parseInt(cb.value));
    const partnerProps = [...document.querySelectorAll('.partner-prop:checked')].map(cb => parseInt(cb.value));
    const myMoney = parseInt(document.getElementById('my-money-trade').value) || 0;
    const partnerMoney = parseInt(document.getElementById('partner-money-trade').value) || 0;
    if (myMoney > player.money) { showNotification('У вас недостаточно денег!', 'warning'); return; }
    gameState.tradeProposal = { from: gameState.currentPlayerIndex, to: partnerIdx, myProps, partnerProps, myMoney, partnerMoney };
    let text = `${player.name} предлагает:\n`;
    if (myProps.length) text += `Улицы: ${myProps.map(i => boardCells[i].name).join(', ')}\n`;
    if (myMoney) text += `Деньги: ${myMoney}$\n`;
    text += `\nВ обмен на:\n`;
    if (partnerProps.length) text += `Улицы: ${partnerProps.map(i => boardCells[i].name).join(', ')}\n`;
    if (partnerMoney) text += `Деньги: ${partnerMoney}$`;
    DOM.tradeOfferText.textContent = text;
    DOM.tradePanel.classList.add('hidden');
    DOM.tradeResponsePanel.classList.remove('hidden');
    if (partner.isBot) setTimeout(() => { partnerMoney >= myMoney || partnerProps.length <= myProps.length ? acceptTrade() : rejectTrade(); }, 1500);
}
function acceptTradeSingle() {
    const trade = gameState.tradeProposal;
    if (!trade) return;
    const from = gameState.players[trade.from];
    const to = gameState.players[trade.to];
    from.money -= trade.myMoney; to.money += trade.myMoney;
    to.money -= trade.partnerMoney; from.money += trade.partnerMoney;
    trade.myProps.forEach(i => { gameState.properties[i].owner = trade.to; updateOwnerIndicator(i, to.color); });
    trade.partnerProps.forEach(i => { gameState.properties[i].owner = trade.from; updateOwnerIndicator(i, from.color); });
    addLog(`${from.name} и ${to.name} совершили обмен!`, 'buy');
    if (!achievements[6].unlocked) unlockAchievement(6);
    DOM.tradeResponsePanel.classList.add('hidden'); gameState.tradeProposal = null;
    updateUI(); updateCenterPanel();
}
function rejectTradeSingle() { addLog('Обмен отклонён', 'info'); DOM.tradeResponsePanel.classList.add('hidden'); gameState.tradeProposal = null; }
function renderPlayersHeader() {
    DOM.playersHeader.innerHTML = '';
    gameState.players.forEach((p, i) => {
        const panel = document.createElement('div');
        panel.className = `player-panel ${i === gameState.currentPlayerIndex ? 'active-panel' : ''} ${p.isBankrupt ? 'bankrupt-panel' : ''}`;
        panel.id = `panel-${i}`;
        const jailText = gameState.jailStatus[i]?.inJail ? ' 🔒' : '';
        const bankruptText = p.isBankrupt ? ' 💀' : '';
        panel.innerHTML = `<div class="player-token-display" style="background:${p.color}20;border:2px solid ${p.color}">${p.token}</div><div class="player-info"><span>${p.name}${jailText}${bankruptText}</span><span class="player-money" id="money-${i}">${p.money} $</span></div>`;
        DOM.playersHeader.appendChild(panel);
    });
}
function updateUI() { gameState.players.forEach((p, i) => { const m = document.getElementById(`money-${i}`); if (m) m.textContent = p.money + ' $'; const panel = document.getElementById(`panel-${i}`); if (panel) panel.classList.toggle('active-panel', i === gameState.currentPlayerIndex); }); }
function checkCanBuild() {
    const playerIdx = gameState.currentPlayerIndex;
    const colorGroups = {};
    boardCells.forEach((cell, i) => { if (cell.type === 'street' && cell.group) { if (!colorGroups[cell.group]) colorGroups[cell.group] = []; colorGroups[cell.group].push(i); } });
    for (const group in colorGroups) {
        const cellsInGroup = colorGroups[group];
        let ownedAll = true, canBuildOnAny = false;
        for (const cellIndex of cellsInGroup) { const prop = gameState.properties[cellIndex]; if (!prop || prop.owner !== playerIdx) { ownedAll = false; break; } if (!prop.mortgaged && prop.houses < 5) canBuildOnAny = true; }
        if (ownedAll && canBuildOnAny) return true;
    }
    return false;
}
function updateBuildButton() {
    if (!DOM.buildBtn) return;
    const myTurn = isMyMultiplayerTurn();
    DOM.buildBtn.disabled = !(myTurn && !gameState.canRoll);
    if (!DOM.buildBtn.disabled) { DOM.buildBtn.style.opacity = '1'; DOM.buildBtn.style.filter = 'none'; DOM.buildBtn.style.pointerEvents = 'auto'; DOM.buildBtn.style.cursor = 'pointer'; }
}
function showBuildPanel() {
    const playerIdx = gameState.currentPlayerIndex;
    DOM.buildableProperties.innerHTML = '';
    let hasAnyProperty = false;
    boardCells.forEach((cell, i) => {
        const prop = gameState.properties[i];
        if (cell.type === 'street' && prop.owner === playerIdx && !prop.mortgaged) {
            hasAnyProperty = true;
            const canBuildHere = checkCanBuildOnProperty(i);
            const cost = houseCosts[cell.group] || 100;
            const div = document.createElement('div');
            div.className = 'buildable-property';
            if (prop.houses < 5 && canBuildHere) div.innerHTML = `<span>${cell.name} (${prop.houses === 0 ? '0 домов' : prop.houses + ' дом.'})</span><div><button class="action-btn success" onclick="buildHouse(${i})" style="padding:5px 12px;font-size:14px;">🏠 + (${cost}$)</button>${prop.houses > 0 ? `<button class="action-btn warning" onclick="sellHouse(${i})" style="padding:5px 12px;font-size:14px;">🏚️ -</button>` : ''}</div>`;
            else if (prop.houses >= 5) div.innerHTML = `<span>${cell.name} 🏨 ОТЕЛЬ</span><div><button class="action-btn warning" onclick="sellHouse(${i})" style="padding:5px 12px;font-size:14px;">🏚️ Продать</button></div>`;
            else div.innerHTML = `<span>${cell.name} (${prop.houses} дом.)</span><span style="color:#f44336;font-size:11px;">⚠️ Нужна монополия</span>`;
            DOM.buildableProperties.appendChild(div);
        }
    });
    if (!hasAnyProperty) DOM.buildableProperties.innerHTML = '<p style="text-align:center;padding:20px;color:#888;">У вас нет улиц для строительства</p>';
    DOM.buildPanel.classList.remove('hidden');
}
function checkCanBuildOnProperty(propertyIndex) {
    const playerIdx = gameState.currentPlayerIndex;
    const cell = boardCells[propertyIndex];
    const prop = gameState.properties[propertyIndex];
    if (!cell || !cell.group || !prop || prop.owner !== playerIdx) return false;
    const groupCells = [];
    boardCells.forEach((c, i) => { if (c.group === cell.group) groupCells.push({ index: i, prop: gameState.properties[i] }); });
    const ownsAll = groupCells.every(item => item.prop && item.prop.owner === playerIdx);
    if (!ownsAll || prop.mortgaged) return false;
    const currentHouses = prop.houses;
    for (const item of groupCells) { if (item.prop && item.prop.houses < currentHouses) return false; }
    return true;
}
function showMortgagePanel() {
    const playerIdx = gameState.currentPlayerIndex;
    DOM.mortgageableProperties.innerHTML = '';
    boardCells.forEach((cell, i) => { const prop = gameState.properties[i]; if (prop.owner === playerIdx && isPropertyCell(cell)) { const div = document.createElement('div'); div.className = 'mortgageable-property'; div.innerHTML = `<span>${cell.name} ${prop.mortgaged ? '(ЗАЛОЖЕНО)' : ''}</span><button class="action-btn ${prop.mortgaged ? 'success' : 'warning'}" onclick="toggleMortgage(${i})">${prop.mortgaged ? 'ВЫКУПИТЬ' : 'ЗАЛОЖИТЬ'}</button>`; DOM.mortgageableProperties.appendChild(div); } });
    DOM.mortgagePanel.classList.remove('hidden');
}
function showTradePanel() {
    const playerIdx = gameState.currentPlayerIndex;
    DOM.tradePartnerSelect.innerHTML = gameState.players.map((p, i) => i !== playerIdx && p.money > 0 ? `<option value="${i}">${p.name}</option>` : '').join('');
    DOM.myPropertiesTrade.innerHTML = ''; DOM.partnerPropertiesTrade.innerHTML = '';
    boardCells.forEach((cell, i) => { const prop = gameState.properties[i]; if (prop.owner === playerIdx && !prop.mortgaged) DOM.myPropertiesTrade.innerHTML += `<div class="property-trade-item"><input type="checkbox" class="my-prop" value="${i}"><span>${cell.name}</span></div>`; });
    DOM.tradePartnerSelect.onchange = () => { const partnerIdx = parseInt(DOM.tradePartnerSelect.value); DOM.partnerPropertiesTrade.innerHTML = ''; boardCells.forEach((cell, i) => { const prop = gameState.properties[i]; if (prop.owner === partnerIdx && !prop.mortgaged) DOM.partnerPropertiesTrade.innerHTML += `<div class="property-trade-item"><input type="checkbox" class="partner-prop" value="${i}"><span>${cell.name}</span></div>`; }); };
    DOM.tradePartnerSelect.dispatchEvent(new Event('change'));
    DOM.tradePanel.classList.remove('hidden');
}
function backToMenu() { gameState.gameActive = false; isAnimating = false; if (gameState.botTimeout) clearTimeout(gameState.botTimeout); DOM.gameContainer.classList.add('hidden'); DOM.mainMenu.classList.remove('hidden'); }
function showSaveDialog() { showConfirm('Сохранить игру в слот 1?', () => { localStorage.setItem('monopoly_save_1', JSON.stringify({gameState, timestamp: Date.now()})); showNotification('✅ Сохранено', 'success'); }); }
function showLoadModal() {}

// ==================== MULTIPLAYER АДАПТЕРЫ ====================
function rollDice() { isMultiplayer ? sendToServer({ type: 'ROLL_DICE' }) : rollDiceSingle(); }
function buyProperty() { isMultiplayer ? (sendToServer({ type: 'BUY_PROPERTY' }), DOM.propertyPanel.classList.add('hidden')) : buyPropertySingle(); }
function endTurn() { isMultiplayer ? sendToServer({ type: 'END_TURN' }) : endTurnSingle(); }
function buildHouse(idx) { isMultiplayer ? sendToServer({ type: 'BUILD_HOUSE', position: idx }) : buildHouseSingle(idx); }
function sellHouse(idx) { isMultiplayer ? sendToServer({ type: 'SELL_HOUSE', position: idx }) : sellHouseSingle(idx); }
function toggleMortgage(idx) { isMultiplayer ? sendToServer({ type: gameState.properties[idx].mortgaged ? 'UNMORTGAGE_PROPERTY' : 'MORTGAGE_PROPERTY', position: idx }) : toggleMortgageSingle(idx); }
function placeBid() { isMultiplayer ? sendToServer({ type: 'AUCTION_BID', amount: parseInt(document.getElementById('auction-bid-input').value) || 0 }) : placeBidSingle(); }
function passAuction() { isMultiplayer ? sendToServer({ type: 'AUCTION_PASS' }) : passAuctionSingle(); }
function proposeTrade() { if (isMultiplayer) { const partnerIdx = parseInt(DOM.tradePartnerSelect.value); const partner = gameState.players[partnerIdx]; if (!partner) return; const myProps = [...document.querySelectorAll('.my-prop:checked')].map(cb => parseInt(cb.value)); const partnerProps = [...document.querySelectorAll('.partner-prop:checked')].map(cb => parseInt(cb.value)); const myMoney = parseInt(document.getElementById('my-money-trade').value) || 0; const partnerMoney = parseInt(document.getElementById('partner-money-trade').value) || 0; const player = gameState.players.find(p => p.id === myPlayerId); if (myMoney > (player?.money || 0)) { showNotification('У вас недостаточно денег!', 'warning'); return; } sendToServer({ type: 'TRADE_PROPOSAL', toPlayerId: partner.id, myProperties: myProps, partnerProperties: partnerProps, myMoney: myMoney, partnerMoney: partnerMoney }); DOM.tradePanel.classList.add('hidden'); } else proposeTradeSingle(); }
function acceptTrade() { if (isMultiplayer && gameState.tradeProposal) { sendToServer({ type: 'TRADE_RESPONSE', fromPlayerId: gameState.tradeProposal.fromPlayerId, accepted: true, myProperties: gameState.tradeProposal.partnerProperties || [], partnerProperties: gameState.tradeProposal.myProperties || [], myMoney: gameState.tradeProposal.partnerMoney || 0, partnerMoney: gameState.tradeProposal.myMoney || 0 }); DOM.tradeResponsePanel.classList.add('hidden'); gameState.tradeProposal = null; } else acceptTradeSingle(); }
function rejectTrade() { if (isMultiplayer && gameState.tradeProposal) { sendToServer({ type: 'TRADE_RESPONSE', fromPlayerId: gameState.tradeProposal.fromPlayerId, accepted: false }); DOM.tradeResponsePanel.classList.add('hidden'); gameState.tradeProposal = null; } else rejectTradeSingle(); }

// ==================== MULTIPLAYER СИНХРОНИЗАЦИЯ ====================
let wsConnection = null;
let myPlayerId = null;
let myRoomId = null;
let isMultiplayer = false;
let isHost = false;

function isMyMultiplayerTurn() { if (!isMultiplayer) return true; const myPlayer = gameState.players.find(p => p.id === myPlayerId); const currentPlayer = gameState.players[gameState.currentPlayerIndex]; return Boolean(myPlayer && currentPlayer && myPlayer.id === currentPlayer.id); }
function syncMultiplayerState(gs) {
    if (!gs) return;
    gameState.players = gs.players.map(p => ({ name: p.name, money: p.money, position: p.position, isBot: p.isBot || false, token: p.token, color: p.color, id: p.id }));
    gameState.properties = gs.properties.map(p => ({ owner: p.owner, houses: p.houses, mortgaged: p.mortgaged }));
    gameState.currentPlayerIndex = gs.currentPlayerIndex; gameState.turnCount = gs.turnCount || 0;
    gameState.gameActive = gs.gameActive !== undefined ? gs.gameActive : true;
    gameState.canRoll = gs.canRoll !== undefined ? gs.canRoll : true;
    if (gs.jailStatus) gameState.jailStatus = gs.jailStatus.map(j => ({ inJail: j.inJail || false, turnsInJail: j.turnsInJail || 0, hasGetOutOfJailCard: j.hasGetOutOfJailCard || false }));
    if (gs.auctionActive !== undefined) { gameState.auctionActive = gs.auctionActive; gameState.auctionProperty = gs.auctionProperty; gameState.auctionCurrentBid = gs.auctionCurrentBid || 0; gameState.auctionBidder = gs.auctionBidder; gameState.auctionPassed = gs.auctionPassed || []; }
    updateAllOwnerIndicators(); updateAllHouses(); updateTokensInstant();
}
function updateMyTurnStatus() { if (!isMultiplayer) return; const myTurn = isMyMultiplayerTurn(); DOM.gameMessage.textContent = myTurn ? '🎯 Ваш ход!' : `⏳ Ход: ${gameState.players[gameState.currentPlayerIndex]?.name || '...'}`; updateMultiplayerActionButtons(); }
function updateConnectionStatus(status) { let el = document.getElementById('connection-status'); if (!el) { el = document.createElement('div'); el.id = 'connection-status'; el.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#ffd700;padding:8px 18px;border-radius:25px;font-weight:700;font-size:14px;z-index:2500;border:2px solid #d4af37;font-family:"Montserrat",sans-serif;pointer-events:none;white-space:nowrap;'; document.body.appendChild(el); } el.textContent = status; }
function updateMultiplayerActionButtons() { if (!isMultiplayer) return; const myTurn = isMyMultiplayerTurn(); const tradeBtn = document.getElementById('trade-btn'); const mortgageBtn = document.getElementById('mortgage-btn'); if (gameState.auctionActive) { DOM.rollBtn.disabled = true; DOM.endTurnBtn.disabled = true; DOM.buildBtn.disabled = true; if (tradeBtn) tradeBtn.disabled = true; if (mortgageBtn) mortgageBtn.disabled = true; return; } if (myTurn) { DOM.rollBtn.disabled = !gameState.canRoll; DOM.endTurnBtn.disabled = gameState.canRoll; DOM.buildBtn.disabled = gameState.canRoll; if (tradeBtn) tradeBtn.disabled = gameState.canRoll; if (mortgageBtn) mortgageBtn.disabled = gameState.canRoll; } else { DOM.rollBtn.disabled = true; DOM.endTurnBtn.disabled = true; DOM.buildBtn.disabled = true; if (tradeBtn) tradeBtn.disabled = true; if (mortgageBtn) mortgageBtn.disabled = true; } }

function handleServerMessage(msg) {
    switch(msg.type) {
        case 'AUTH_RESULT': handleAuthResult(msg); break;
        case 'CONNECTED':
    myPlayerId = msg.playerId;
    console.log('🟢 CONNECTED, myPlayerId:', myPlayerId);
    break;
    case 'ROOM_CREATED':
    console.log('🏠 ROOM_CREATED:', msg);
    myRoomId = msg.roomId;
    isHost = msg.isHost;
    myPlayerId = msg.yourPlayerId;
    showRoomCode(msg.roomId);
    setTimeout(() => showLobbyPlayers(msg.players, msg.isHost), 500);
    break;
    case 'JOINED_ROOM': myRoomId = msg.roomId; isHost = msg.isHost; myPlayerId = msg.yourPlayerId; closeRoomCodeOverlay(); showLobbyPlayers(msg.players, msg.isHost); break;
        case 'PLAYERS_UPDATED': showLobbyPlayers(msg.players, isHost); break;
        case 'GAME_STARTED': document.getElementById('lobby-overlay')?.remove(); closeRoomCodeOverlay(); if (msg.gameId) myRoomId = msg.gameId; isMultiplayer = true; syncMultiplayerState(msg.gameState); DOM.mainMenu.classList.add('hidden'); DOM.gameContainer.classList.remove('hidden'); gameState.logEntries = []; createCenterPanel(); renderPlayersHeader(); updateTokensInstant(); updateAllOwnerIndicators(); updateAllHouses(); updateLogDisplay(); updateMyTurnStatus(); gameState.gameStartTime = Date.now(); startGameTimer(); createChatUI(); addLog('🎮 Multiplayer игра началась!', 'info'); break;
        case 'DICE_RESULT': handleDiceResult(msg); break;
        case 'PROPERTY_BOUGHT': if (msg.gameState) syncMultiplayerState(msg.gameState); updateTokensInstant(); updateAllOwnerIndicators(); updateAllHouses(); renderPlayersHeader(); updateUI(); updateCenterPanel(); DOM.propertyPanel.classList.add('hidden'); updateMyTurnStatus(); updateMultiplayerActionButtons(); updateBuildButton(); break;
        case 'TURN_ENDED': handleTurnEnded(msg);recordWealth();  break;
        case 'SYNC_STATE': if (msg.gameState) syncMultiplayerState(msg.gameState); updateAllOwnerIndicators(); updateAllHouses(); updateTokensInstant(); renderPlayersHeader(); updateUI(); updateCenterPanel(); updateMyTurnStatus(); if (msg.message) addLog(msg.message, 'info'); break;
        case 'CHAT_MESSAGE':
    addLog(`💬 ${msg.playerName}: ${msg.text}`, 'info');
    const chatBox = document.getElementById('chat-messages');
    if (chatBox) {
        const el = document.createElement('div');
        el.innerHTML = `<strong style="color:#ffd700;font-weight:700;">${msg.playerName}:</strong> <span>${msg.text}</span>`;
        chatBox.appendChild(el);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    break;
    case 'TRADE_PROPOSAL': gameState.tradeProposal = { fromPlayerId: msg.fromPlayerId, fromPlayerName: msg.fromPlayerName, myProperties: msg.myProperties || [], partnerProperties: msg.partnerProperties || [], myMoney: msg.myMoney || 0, partnerMoney: msg.partnerMoney || 0 }; let tradeText = `${msg.fromPlayerName} предлагает обмен:\n`; if (msg.myProperties.length > 0) tradeText += `Даёт: ${msg.myProperties.map(i => boardCells[i]?.name || `Клетка ${i}`).join(', ')}\n`; if (msg.myMoney > 0) tradeText += `Даёт: ${msg.myMoney}$\n`; if (msg.partnerProperties.length > 0) tradeText += `Хочет: ${msg.partnerProperties.map(i => boardCells[i]?.name || `Клетка ${i}`).join(', ')}\n`; if (msg.partnerMoney > 0) tradeText += `Хочет: ${msg.partnerMoney}$`; DOM.tradeOfferText.textContent = tradeText; DOM.tradeResponsePanel.classList.remove('hidden'); break;
        case 'TRADE_COMPLETED': gameState.tradeProposal = null; if (msg.gameState) syncMultiplayerState(msg.gameState); updateAllOwnerIndicators(); updateAllHouses(); updateTokensInstant(); renderPlayersHeader(); updateUI(); updateCenterPanel(); DOM.tradeResponsePanel.classList.add('hidden'); DOM.tradePanel.classList.add('hidden'); if (msg.message) addLog(msg.message, 'trade'); showNotification('✅ Обмен совершён!', 'success'); break;
        case 'TRADE_REJECTED': gameState.tradeProposal = null; DOM.tradeResponsePanel.classList.add('hidden'); if (msg.message) showNotification('❌ ' + msg.message, 'warning'); break;
        case 'AUCTION_STARTED': gameState.auctionActive = true; gameState.auctionProperty = msg.propertyIndex; gameState.auctionCurrentBid = msg.startPrice; gameState.auctionBidder = null; DOM.auctionPropName.textContent = msg.propertyName; DOM.auctionStartPrice.textContent = msg.startPrice + '$'; DOM.auctionCurrentBid.textContent = msg.startPrice + '$'; DOM.auctionBidder.textContent = 'Нет ставок'; DOM.auctionPanel.classList.remove('hidden'); DOM.rollBtn.disabled = true; DOM.endTurnBtn.disabled = true; DOM.buildBtn.disabled = true; addLog(`🔨 Аукцион за ${msg.propertyName}!`, 'auction'); break;
        case 'AUCTION_BID_PLACED': gameState.auctionCurrentBid = msg.currentBid || msg.amount; gameState.auctionBidder = msg.highestBidder || msg.playerName; DOM.auctionCurrentBid.textContent = gameState.auctionCurrentBid + '$'; DOM.auctionBidder.textContent = gameState.auctionBidder; if (msg.gameState) { syncMultiplayerState(msg.gameState); updateUI(); } addLog(`${msg.playerName} ставит ${gameState.auctionCurrentBid}$`, 'auction'); break;
        case 'AUCTION_PASSED': if (msg.gameState) syncMultiplayerState(msg.gameState); addLog(`${msg.playerName} пасует`, 'auction'); break;
        case 'AUCTION_ENDED': gameState.auctionActive = false; DOM.auctionPanel.classList.add('hidden'); if (msg.gameState) syncMultiplayerState(msg.gameState); updateAllOwnerIndicators(); updateAllHouses(); updateTokensInstant(); renderPlayersHeader(); updateUI(); updateCenterPanel(); updateMultiplayerActionButtons(); addLog(msg.message, 'auction'); break;
        case 'CARD_DRAW': gameState._pendingCard = { type: msg.cardType, card: { text: msg.cardText, action: (p, gs, idx) => { return msg.cardText; } } }; if (msg.gameState) syncMultiplayerState(msg.gameState); updateTokensInstant(); updateAllOwnerIndicators(); updateAllHouses(); updateUI(); updateCenterPanel(); renderPlayersHeader(); showRoulette(msg.cardType); if (msg.playerName) addLog(`${msg.playerName}: ${msg.cardText}`, msg.cardType === 'chance' ? 'chance' : 'chest'); break;
        case 'JAIL_FREE_CARD': case 'JAIL_DOUBLE': case 'JAIL_PAID': if (msg.gameState) syncMultiplayerState(msg.gameState); updateTokensInstant(); updateUI(); updateCenterPanel(); renderPlayersHeader(); if (msg.message) addLog(msg.message, 'jail'); updateMyTurnStatus(); updateMultiplayerActionButtons(); break;
        case 'JAIL_STAY': if (msg.gameState) syncMultiplayerState(msg.gameState); updateUI(); updateCenterPanel(); renderPlayersHeader(); if (msg.message) addLog(msg.message, 'jail'); updateMyTurnStatus(); updateMultiplayerActionButtons(); break;
        case 'PROFILE':
    if (msg.profile) {
        currentUser = msg.profile;
        // Скрываем окно авторизации
        document.getElementById('auth-modal').classList.add('hidden');
        // Показываем главное меню
        DOM.mainMenu.classList.remove('hidden');
        updateUserProfileDisplay(msg.profile);
    } else {
        // Токен недействителен — удаляем его
        localStorage.removeItem('auth_token');
        authToken = null;
        // Окно авторизации уже показано из simulateLoading()
    }
    break;
    case 'ERROR': showNotification(msg.message, 'error', 4000); break;
        default: console.log('⚠️ Неизвестный тип:', msg.type);
    }
}

function handleTurnEnded(msg) {
    DOM.propertyPanel.classList.add('hidden'); DOM.buildPanel.classList.add('hidden'); DOM.mortgagePanel.classList.add('hidden'); DOM.tradePanel.classList.add('hidden'); DOM.auctionPanel.classList.add('hidden');
    if (msg.gameState) { gameState.players = msg.gameState.players.map(p => ({ name: p.name, money: p.money, position: p.position, isBot: p.isBot || false, token: p.token, color: p.color, id: p.id })); gameState.currentPlayerIndex = msg.gameState.currentPlayerIndex; gameState.turnCount = msg.gameState.turnCount || 0; gameState.properties = msg.gameState.properties.map(p => ({ owner: p.owner, houses: p.houses, mortgaged: p.mortgaged })); } else { gameState.currentPlayerIndex = msg.nextPlayerIndex; gameState.turnCount = msg.turnCount; }
    gameState.canRoll = true;
    updateTokensInstant(); updateAllOwnerIndicators(); updateAllHouses(); updateUI(); updateCenterPanel(); renderPlayersHeader();
    DOM.turnCounter.textContent = `Ход: ${gameState.turnCount}`;
    const myTurn = isMyMultiplayerTurn();
    if (myTurn) { DOM.rollBtn.disabled = false; DOM.gameMessage.textContent = '🎯 Ваш ход!'; } else { DOM.rollBtn.disabled = true; DOM.gameMessage.textContent = `⏳ Ход: ${gameState.players[gameState.currentPlayerIndex]?.name || '...'}`; }
    updateMyTurnStatus(); updateMultiplayerActionButtons();
}

function handleDiceResult(msg) { const player = gameState.players[msg.playerIndex]; if (!player) return; DOM.dice1.textContent = ['⚀','⚁','⚂','⚃','⚄','⚅'][msg.dice1-1]; DOM.dice2.textContent = ['⚀','⚁','⚂','⚃','⚄','⚅'][msg.dice2-1]; animateTokenMovement(msg.playerIndex, msg.oldPosition, msg.newPosition).then(() => { if (msg.gameState) syncMultiplayerState(msg.gameState); updateTokensInstant(); updateAllOwnerIndicators(); updateAllHouses(); renderPlayersHeader(); updateUI(); updateCenterPanel(); updateMyTurnStatus(); updateMultiplayerActionButtons(); showMultiplayerPropertyPanel(msg.playerIndex, msg.newPosition); addLog(`${player.name} выбросил ${msg.dice1}+${msg.dice2}`, 'info'); }); }
function showMultiplayerPropertyPanel(playerIndex, position) { const cell = boardCells[position]; const prop = gameState.properties[position]; if (!cell || !prop) return; const myP = gameState.players.find(p => p.id === myPlayerId); if (!myP || myP.id !== gameState.players[playerIndex]?.id) return; if (['street', 'railroad', 'utility'].includes(cell.type) && prop.owner === null) { DOM.propName.textContent = cell.name; DOM.propPrice.textContent = `💰 Цена: ${cell.price}$`; DOM.propRent.textContent = `📈 Аренда: ${cell.rent}$`; DOM.propertyPanel.classList.remove('hidden'); } }

function connectToServer() {
    try {
        let wsUrl;
        const hostname = window.location.hostname;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            wsUrl = 'ws://localhost:3000';
        } else if (window.location.protocol === 'file:') {
            wsUrl = 'ws://localhost:3000';
        } else {
            wsUrl = 'wss://monopoly-vildanov.serveousercontent.com';
        }
        
        console.log('🔌 Подключение к WebSocket:', wsUrl);
        wsConnection = new WebSocket(wsUrl);
        
        wsConnection.onopen = () => {
            console.log('🟢 Подключены к серверу');
            updateConnectionStatus('🟢 Онлайн');
            
            // Если есть сохранённый токен — пробуем войти автоматически
            if (authToken) {
                console.log('📤 Авто-вход с токеном');
                wsConnection.send(JSON.stringify({ type: 'GET_PROFILE', token: authToken }));
            }
        };
        
        wsConnection.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                console.log('📩 Получено:', msg.type);
                handleServerMessage(msg);
            } catch(e) {
                console.log('❌ Ошибка обработки сообщения:', e);
            }
        };
        
        wsConnection.onclose = (event) => {
            console.log('🔴 Отключены. Код:', event.code);
            updateConnectionStatus('🔴 Офлайн');
            
            setTimeout(() => {
                if (!wsConnection || wsConnection.readyState === WebSocket.CLOSED) {
                    console.log('🔄 Попытка переподключения...');
                    connectToServer();
                }
            }, 3000);
        };
        
        wsConnection.onerror = (e) => {
            console.log('⚠️ Ошибка WebSocket');
            updateConnectionStatus('⚠️ Ошибка подключения');
        };
    } catch(e) {
        console.log('❌ Ошибка:', e);
        updateConnectionStatus('❌ Сервер недоступен');
    }
}

function sendToServer(data) {
    if (data.type === 'LOGIN' || data.type === 'REGISTER' || data.type === 'GUEST_LOGIN') {
        if (authInProgress) { console.log('⏳ Авторизация уже выполняется...'); return; }
        authInProgress = true;
        setTimeout(() => { authInProgress = false; }, 5000);
        document.querySelectorAll('.auth-btn').forEach(b => b.disabled = true);
        document.querySelectorAll('.auth-form input').forEach(i => i.disabled = true);
    }
    
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
        console.log('📤 Отправка:', data.type);
        wsConnection.send(JSON.stringify(data));
    } else if (wsConnection && wsConnection.readyState === WebSocket.CONNECTING) {
        console.log('⏳ WebSocket ещё подключается, жду...');
        wsConnection.addEventListener('open', () => {
            console.log('📤 Отправка (после ожидания):', data.type);
            wsConnection.send(JSON.stringify(data));
        }, { once: true });
    } else {
        console.log('❌ Не отправлено (readyState:', wsConnection?.readyState, ')');
    }
}
// ==================== ЗАПУСК ИГРЫ ====================
function startLocalGame() { const count = parseInt(document.getElementById('player-count-select').value); gameState.players = []; for (let i = 0; i < count; i++) { const tokenOpt = DOM.tokenSelectContainer.querySelectorAll('.token-dropdown')[i]; gameState.players.push({ name: `Игрок ${i+1}`, money: settings.startingMoney, position: 0, isBot: false, token: tokenOpt?.value || '🚗', color: gameState.playerColors[i] }); } initGame(); }
function startBotGame() { gameState.players = [{ name: 'Игрок', money: settings.startingMoney, position: 0, isBot: false, token: '🚗', color: '#e53935' }]; for (let i = 0; i < settings.botCount; i++) gameState.players.push({ name: `Бот ${i+1}`, money: settings.startingMoney, position: 0, isBot: true, token: ['🤖','👾','🎃'][i], color: gameState.playerColors[i+1] }); initGame(); }
function initGame() {
    gameState.properties = Array(40).fill(null).map(() => ({ owner: null, houses: 0, mortgaged: false })); gameState.currentPlayerIndex = 0; gameState.gameActive = true; gameState.canRoll = true; gameState.turnCount = 0; gameState.logEntries = []; gameState.auctionActive = false; isAnimating = false;
    gameState.jailStatus = gameState.players.map(() => ({ inJail: false, turnsInJail: 0, hasGetOutOfJailCard: false })); if (gameState.botTimeout) clearTimeout(gameState.botTimeout);
    shuffleDecks();
    DOM.tokenModal.classList.add('hidden'); DOM.mainMenu.classList.add('hidden'); DOM.gameContainer.classList.remove('hidden');
    DOM.propertyPanel.classList.add('hidden'); DOM.auctionPanel.classList.add('hidden'); DOM.buildPanel.classList.add('hidden'); DOM.mortgagePanel.classList.add('hidden'); DOM.tradePanel.classList.add('hidden');
    createCenterPanel(); renderPlayersHeader(); updateTokensInstant(); updateUI(); updateCenterPanel(); updateLogDisplay();
    DOM.rollBtn.disabled = false; DOM.endTurnBtn.disabled = true; DOM.buildBtn.disabled = true;
    gameState.gameStartTime = Date.now(); startGameTimer();
    wealthHistory = [];
recordWealth();
    DOM.gameMessage.textContent = `🎯 Ход: ${gameState.players[0].name}`; addLog(`🎮 Игра началась! Капитал: ${settings.startingMoney}$`, 'info');
    updateAllTexts();
}

let gameTimer = null;
function startGameTimer() { 
    if (gameTimer) clearInterval(gameTimer); 
    updateGameTimeDisplay(); // Сразу показываем 00:00
    gameTimer = setInterval(() => { 
        if (!gameState.gameActive) return; 
        updateGameTimeDisplay();
    }, 1000); 
}

function updateGameTimeDisplay() {
    if (!gameState.gameStartTime) return;
    const elapsed = Math.floor((Date.now() - gameState.gameStartTime) / 1000);
    const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const secs = (elapsed % 60).toString().padStart(2, '0');
    
    // Обновляем в шапке
    if (DOM.gameTime) {
        DOM.gameTime.textContent = `${mins}:${secs}`;
    }
    
    // Обновляем в центральной панели
    const centerTime = document.getElementById('center-time');
    if (centerTime) {
        centerTime.textContent = `${mins}:${secs}`;
    }
}
// ==================== ЧАТ ====================
function createChatUI() {
    // Удаляем старый если есть
    const old = document.getElementById('chat-container');
    if (old) old.remove();
    
    const chat = document.createElement('div');
    chat.id = 'chat-container';
    chat.style.cssText = `
        position: fixed;
        bottom: clamp(90px, 14vh, 120px);
        right: clamp(8px, 1.5vw, 15px);
        width: clamp(270px, 23vw, 330px);
        max-height: 48vh;
        background: linear-gradient(165deg, #1a0a0a 0%, #241212 35%, #2d1818 100%);
        border-radius: 18px;
        border: 3px solid #c8960c;
        box-shadow: 0 10px 35px rgba(0,0,0,0.8), 0 0 20px rgba(200,150,12,0.25), inset 0 1px 0 rgba(255,215,0,0.15);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-family: 'Montserrat', sans-serif;
        transition: all 0.3s;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
    `;
    
    chat.innerHTML = `
        <div id="chat-toggle-header" style="
            background: linear-gradient(135deg, #7a5c0f, #b8860b 30%, #d4af37 60%, #b8860b 90%);
            color: #1a0a0a;
            padding: 10px 16px;
            font-weight: 800;
            font-size: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            letter-spacing: 2px;
            text-transform: uppercase;
            border-bottom: 2px solid #5a3e08;
            text-shadow: 0 1px 2px rgba(255,255,255,0.3);
            user-select: none;
        ">
            <span>💬 ЧАТ</span>
            <span id="chat-toggle-icon" style="
                font-size: 12px;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0,0,0,0.2);
                border-radius: 50%;
            ">▼</span>
        </div>
        <div id="chat-body" style="display:flex; flex-direction:column; max-height:300px; background:rgba(0,0,0,0.3);">
            <div id="chat-messages" style="
                flex:1;
                overflow-y:auto;
                padding:10px;
                min-height:60px;
                max-height:210px;
                font-size:12px;
                color:#e8d5a3;
                display:flex;
                flex-direction:column;
                gap:6px;
            "></div>
            <div class="chat-input-container" style="
                display:flex;
                padding:8px;
                gap:6px;
                border-top:2px solid rgba(200,150,12,0.4);
                background:rgba(0,0,0,0.3);
            ">
                <input id="chat-input" placeholder="Сообщение..." autocomplete="off" style="
                    flex:1;
                    padding:9px 14px;
                    border-radius:20px;
                    border:2px solid #6b4e0a;
                    font-size:13px;
                    font-family:'Montserrat',sans-serif;
                    background:linear-gradient(135deg,#1a0a0a,#261515);
                    color:#f5e6c8;
                    outline:none;
                    box-shadow:inset 0 2px 4px rgba(0,0,0,0.5);
                ">
                <button id="chat-send-btn" style="
                    padding:9px 16px;
                    background:linear-gradient(135deg,#a0750a,#d4af37 45%,#c8961b);
                    color:#1a0a0a;
                    border:none;
                    border-radius:20px;
                    font-weight:700;
                    cursor:pointer;
                    font-family:'Montserrat',sans-serif;
                    font-size:13px;
                    text-shadow:0 1px 1px rgba(255,255,255,0.3);
                    box-shadow:0 3px 0 #5a3e08;
                ">📤</button>
            </div>
        </div>`;
    
    document.body.appendChild(chat);
    
    // Сворачивание/разворачивание
    const body = document.getElementById('chat-body');
    const icon = document.getElementById('chat-toggle-icon');
    
    document.getElementById('chat-toggle-header').onclick = () => {
        if (body.style.display === 'none') {
            body.style.display = 'flex';
            icon.textContent = '▼';
        } else {
            body.style.display = 'none';
            icon.textContent = '▲';
        }
    };
    
    // Отправка сообщения
    document.getElementById('chat-send-btn').onclick = sendChatMessage;
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });
    
    // Стили для сообщений (добавляем динамически)
    const msgStyle = document.createElement('style');
    msgStyle.textContent = `
        #chat-messages div {
            padding: 7px 11px;
            background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(184,134,11,0.06));
            border-radius: 9px;
            border: 1px solid rgba(200,150,12,0.3);
            font-size: 12px;
            word-wrap: break-word;
            word-break: break-word;
            line-height: 1.5;
            color: #f5e6c8;
            animation: chatMsgIn 0.3s ease-out;
        }
        #chat-messages div:hover {
            background: linear-gradient(135deg, rgba(212,175,55,0.18), rgba(184,134,11,0.12));
            border-color: rgba(212,175,55,0.5);
        }
        #chat-messages div strong {
            color: #ffd700;
            font-weight: 700;
            margin-right: 4px;
        }
        #chat-messages::-webkit-scrollbar { width: 5px; }
        #chat-messages::-webkit-scrollbar-track { background: rgba(200,150,12,0.06); border-radius: 3px; }
        #chat-messages::-webkit-scrollbar-thumb { background: rgba(200,150,12,0.4); border-radius: 3px; }
        #chat-messages::-webkit-scrollbar-thumb:hover { background: rgba(212,175,55,0.6); }
        #chat-input:focus {
            border-color: #d4af37 !important;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.5), 0 0 0 3px rgba(212,175,55,0.15), 0 0 15px rgba(212,175,55,0.25) !important;
            background: linear-gradient(135deg, #201010, #2d1a1a) !important;
        }
        #chat-send-btn:hover {
            background: linear-gradient(135deg, #b8860b, #e4bf47 45%, #d4af37) !important;
            transform: translateY(-2px);
            box-shadow: 0 5px 0 #5a3e08;
        }
        #chat-send-btn:active {
            transform: translateY(2px);
            box-shadow: 0 1px 0 #5a3e08;
        }
        @keyframes chatMsgIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(msgStyle);
    console.log('💬 Чат создан с новым дизайном');
}
function sendChatMessage() { const input = document.getElementById('chat-input'); const text = input.value.trim(); if (!text) return; sendToServer({ type: 'CHAT_MESSAGE', playerName: currentUser?.username || 'Игрок', text }); input.value = ''; }
function showRoomCode(code) {
    console.log('📋 Показываю код комнаты:', code);
    
    // Удаляем старый если есть
    const old = document.getElementById('room-code-overlay');
    if (old) old.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'room-overlay';
    overlay.id = 'room-code-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);display:flex;justify-content:center;align-items:center;z-index:10000;';
    overlay.innerHTML = `
        <div class="room-dialog">
            <h2>🏠 КОМНАТА СОЗДАНА</h2>
            <p>Отправьте код другу:</p>
            <div class="room-code-display">${code}</div>
            <div class="btn-row" style="display:flex;gap:10px;justify-content:center;margin-top:15px;">
                <button class="btn-copy" id="copy-room-code-btn" style="padding:10px 20px;background:#2e7d32;color:white;border:none;border-radius:25px;cursor:pointer;font-weight:700;">📋 Копировать код</button>
                <button class="btn-close" id="close-room-code-btn" style="padding:10px 20px;background:#8b0000;color:white;border:none;border-radius:25px;cursor:pointer;font-weight:700;">✕ Закрыть</button>
            </div>
        </div>`;
    
    document.body.appendChild(overlay);
    console.log('✅ Оверлей комнаты добавлен в DOM');
    
    document.getElementById('copy-room-code-btn').onclick = () => {
        navigator.clipboard.writeText(code).then(() => {
            showNotification('✅ Код скопирован!', 'success');
        }).catch(() => {
            showNotification('Код: ' + code, 'info', 5000);
        });
    };
    
    document.getElementById('close-room-code-btn').onclick = () => {
        overlay.remove();
        console.log('❌ Оверлей комнаты закрыт');
    };
}
function closeRoomCodeOverlay() { document.getElementById('room-code-overlay')?.remove(); }
function showLobbyPlayers(players, hostStatus) {
    console.log('👥 showLobbyPlayers вызвана. Игроки:', players.length, 'Хост:', hostStatus);
    
    isHost = hostStatus;
    
    // Удаляем старый оверлей если есть
    const old = document.getElementById('lobby-overlay');
    if (old) old.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'lobby-overlay';
    overlay.id = 'lobby-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(12px);display:flex;justify-content:center;align-items:center;z-index:9999;';
    
    const playersHTML = players.map(p => `
        <div class="lobby-player-row" style="display:flex;align-items:center;gap:10px;padding:10px 15px;background:rgba(255,248,225,0.8);border-radius:10px;border:2px solid #e8d5a3;font-size:16px;font-weight:600;color:#2d1515;">
            <div style="font-size:28px;background:white;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">${p.token}</div>
            <div style="flex:1;">${p.name}</div>
            ${p.id === myPlayerId ? '<span style="color:#2e7d32;font-weight:700;background:#e8f5e9;padding:5px 12px;border-radius:20px;">(Вы)</span>' : ''}
        </div>
    `).join('');
    
    overlay.innerHTML = `
        <div style="background:linear-gradient(145deg, #fdf6e3, #f5e6c8, #e8d5a3);padding:25px 30px;border-radius:20px;border:4px solid #d4af37;text-align:center;width:min(480px,92vw);box-shadow:0 20px 50px rgba(0,0,0,0.7);">
            <h2 style="font-size:24px;color:#8b0000;margin-bottom:5px;">👥 ИГРОКИ</h2>
            <div style="font-size:13px;color:#666;margin-bottom:15px;">Комната: <strong style="color:#8b0000;letter-spacing:2px;">${myRoomId || '???'}</strong></div>
            <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px;">${playersHTML}</div>
            <div style="display:flex;gap:10px;justify-content:center;">
                ${isHost ? '<button id="start-multiplayer-btn" style="padding:10px 25px;background:#2e7d32;color:white;border:none;border-radius:25px;font-weight:700;cursor:pointer;">🎮 НАЧАТЬ ИГРУ</button>' : '<div style="color:#f57c00;font-weight:600;">⏳ Ожидание хоста...</div>'}
                <button id="close-lobby-btn" style="padding:10px 25px;background:#8b0000;color:white;border:none;border-radius:25px;font-weight:700;cursor:pointer;">🚪 Выйти</button>
            </div>
        </div>`;
    
    document.body.appendChild(overlay);
    console.log('✅ Лобби добавлено в DOM');
    
    document.getElementById('close-lobby-btn').onclick = () => {
        overlay.remove();
        console.log('Лобби закрыто');
    };
    
    if (isHost) {
        document.getElementById('start-multiplayer-btn').onclick = () => {
            console.log('📤 Отправляю START_GAME');
            sendToServer({ type: 'START_GAME' });
        };
    }
}
// ==================== ГЛОБАЛЬНЫЕ ССЫЛКИ ====================
window.buildHouse = buildHouse;
window.sellHouse = sellHouse;
window.toggleMortgage = toggleMortgage;

// ==================== ЦЕНТРАЛЬНАЯ ПАНЕЛЬ ====================
// ==================== ИСТОРИЯ БОГАТСТВА ДЛЯ ГРАФИКА ====================
let wealthHistory = []; // [{turn: 0, players: [{name, money}]}]

function recordWealth() {
    const snapshot = {
        turn: gameState.turnCount,
        players: gameState.players.map(p => ({
            name: p.name,
            money: p.money,
            isBankrupt: p.isBankrupt
        }))
    };
    wealthHistory.push(snapshot);
    if (wealthHistory.length > 100) wealthHistory.shift(); // Ограничим историю
}

function drawWealthChart() {
    const canvas = document.getElementById('center-wealth-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Очищаем
    ctx.clearRect(0, 0, width, height);
    
    if (wealthHistory.length < 2) {
        ctx.fillStyle = '#888';
        ctx.font = '10px Montserrat';
        ctx.textAlign = 'center';
        ctx.fillText(currentLang === 'ru' ? 'Недостаточно данных' : 'Not enough data', width/2, height/2);
        return;
    }
    
    // Находим мин/макс для масштаба
    let maxMoney = 0;
    wealthHistory.forEach(snapshot => {
        snapshot.players.forEach(p => {
            if (p.money > maxMoney) maxMoney = p.money;
        });
    });
    if (maxMoney === 0) maxMoney = 1500;
    maxMoney = Math.ceil(maxMoney / 500) * 500; // Округляем вверх
    
    const paddingLeft = 35;
    const paddingRight = 10;
    const paddingTop = 10;
    const paddingBottom = 20;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    
    // Сетка
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
        const y = paddingTop + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(width - paddingRight, y);
        ctx.stroke();
        
        // Подписи оси Y
        ctx.fillStyle = '#888';
        ctx.font = '8px Montserrat';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxMoney * (4-i) / 4) + '$', paddingLeft - 5, y + 3);
    }
    
    // Линии игроков
    const colors = gameState.playerColors;
    
    gameState.players.forEach((player, idx) => {
        if (player.isBankrupt) return;
        
        const points = [];
        wealthHistory.forEach((snapshot, snapIdx) => {
            const p = snapshot.players[idx];
            if (p && !p.isBankrupt) {
                const x = paddingLeft + (snapIdx / (wealthHistory.length - 1)) * chartWidth;
                const y = paddingTop + chartHeight - (p.money / maxMoney) * chartHeight;
                points.push({ x, y });
            }
        });
        
        if (points.length < 2) return;
        
        // Линия
        ctx.strokeStyle = colors[idx] || '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        
        // Последняя точка
        const last = points[points.length - 1];
        ctx.fillStyle = colors[idx] || '#fff';
        ctx.beginPath();
        ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Имя игрока
        ctx.fillStyle = colors[idx] || '#fff';
        ctx.font = 'bold 8px Montserrat';
        ctx.textAlign = 'left';
        ctx.fillText(player.name, last.x + 5, last.y - 2);
    });
}

// ==================== ЦЕНТРАЛЬНАЯ ПАНЕЛЬ ====================
function updateCenterPanel() {
    // Игроки
    const panel = document.getElementById('center-players');
    if (panel) {
        panel.innerHTML = gameState.players.map((p, i) => {
            const isActive = i === gameState.currentPlayerIndex;
            const inJail = gameState.jailStatus[i]?.inJail;
            const totalValue = calculatePlayerTotalValue(i);
            return `<div class="center-player-row ${isActive ? 'active-player' : ''} ${p.isBankrupt ? 'bankrupt-player' : ''}">
                <span class="center-player-token">${p.token}</span>
                <span class="center-player-name">${p.name}${inJail ? ' 🔒' : ''}</span>
                <span class="center-player-money ${p.money < 0 ? 'negative' : ''}">${p.money}$</span>
            </div>`;
        }).join('');
    }
    
    // Ход и время
    const turnEl = document.getElementById('center-turn');
    if (turnEl) turnEl.textContent = gameState.turnCount;
    
    updateGameTimeDisplay();
    
    // Лог
    const logContent = document.getElementById('center-log-content');
    if (logContent) {
        logContent.innerHTML = gameState.logEntries.slice(0, 20).map(e => 
            `<div class="log-entry ${e.type}">[${e.time}] ${e.message}</div>`
        ).join('');
    }
    
    // График
    drawWealthChart();
    
    // Лог в боковой панели
    if (DOM.logContent) {
        DOM.logContent.innerHTML = gameState.logEntries.map(e => 
            `<div class="log-entry ${e.type}">[${e.time}] ${e.message}</div>`
        ).join('');
    }
}

// Считаем общую ценность игрока (деньги + недвижимость)
function calculatePlayerTotalValue(playerIndex) {
    let total = gameState.players[playerIndex]?.money || 0;
    gameState.properties.forEach((prop, i) => {
        if (prop.owner === playerIndex && !prop.mortgaged) {
            const cell = boardCells[i];
            if (cell && cell.price) {
                total += cell.price;
                if (cell.group && prop.houses > 0) {
                    total += prop.houses * (houseCosts[cell.group] || 100);
                }
            }
        }
    });
    return total;
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
window.onload = () => {
    initDOM();
    simulateLoading();
    renderBoard();
    createCardModal();
    createFieldsModal();
    shuffleDecks();
    initTokenSelect();
    bindAllEvents();
    loadSettings();
    connectToServer();
    initRoulette();
};

function initRoulette() {
    const okBtn = document.getElementById('roulette-ok-btn');
    if (okBtn) okBtn.onclick = () => { document.getElementById('roulette-overlay').classList.add('hidden'); const player = gameState.players[gameState.currentPlayerIndex]; if (player && !player.isBot) DOM.endTurnBtn.disabled = false; else if (player?.isBot) gameState.botTimeout = setTimeout(() => { if (isMultiplayer) sendToServer({ type: 'END_TURN' }); else endTurnSingle(); }, settings.fastMode ? 800 : 1500); };
}