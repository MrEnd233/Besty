// ==================== ЯЗЫКОВОЙ ПАКЕТ ====================
const LANGUAGES = {
    ru: {
        menu_title: 'MONOPOLY',
        menu_local: '🎮 Играть локально',
        menu_bot: '🤖 Играть с ботами',
        menu_online_create: '🌐 Создать онлайн-комнату',
        menu_online_join: '🔗 Присоединиться к комнате',
        menu_load: '💾 Загрузить игру',
        menu_settings: '⚙️ Настройки',
        menu_rules: '📜 Правила',
        menu_footer: 'Курсовой проект · Вилданов Р.Р. · ЧЭнК · ИСП-7-23',
        loading: 'ЗАГРУЗКА МОНОПОЛИИ',
        settings_title: '⚙️ НАСТРОЙКИ',
        settings_start_money: 'Стартовый капитал:',
        settings_money_1000: '1000$ (Быстрая)',
        settings_money_1500: '1500$ (Классика)',
        settings_money_2000: '2000$ (Богатая)',
        settings_money_2500: '2500$ (Олигарх)',
        settings_bot_count: 'Количество ботов:',
        settings_bot_1: '1 бот',
        settings_bot_2: '2 бота',
        settings_bot_3: '3 бота',
        settings_anim_speed: 'Скорость анимации:',
        settings_anim_fast: 'Быстрая',
        settings_anim_normal: 'Нормальная',
        settings_anim_slow: 'Медленная',
        settings_sound: 'Звуки:',
        settings_sound_on: 'Включены',
        settings_sound_off: 'Выключены',
        settings_mode: 'Режим:',
        settings_mode_normal: 'Обычный',
        settings_mode_fast: 'Быстрая игра',
        settings_language: 'Язык:',
        settings_lang_ru: '🇷🇺 Русский',
        settings_lang_en: '🇬🇧 English',
        settings_save: '💾 СОХРАНИТЬ',
        token_title: '🎨 ВЫБЕРИТЕ ФИГУРКИ',
        token_players: 'Количество игроков:',
        token_players_2: '2 игрока',
        token_players_3: '3 игрока',
        token_players_4: '4 игрока',
        token_start: '🎯 НАЧАТЬ ИГРУ',
        token_back: '↩️ НАЗАД',
        load_title: '💾 ЗАГРУЗИТЬ ИГРУ',
        load_empty: 'Пусто',
        load_back: '↩️ НАЗАД',
        load_slot: 'Слот',
        rules_title: '📖 ПРАВИЛА ИГРЫ',
        rules_text: `<p><strong>1. Цель:</strong> Остаться единственным необанкротившимся игроком.</p><p><strong>2. Старт:</strong> Каждый получает стартовый капитал. Проход СТАРТА +200$.</p><p><strong>3. Покупка:</strong> Свободные улицы можно купить. Отказ → аукцион.</p><p><strong>4. Дома:</strong> Соберите все улицы одного цвета → можно строить дома (до 4) и отель.</p><p><strong>5. Залог:</strong> Нужны деньги? Заложите недвижимость за 50% стоимости.</p><p><strong>6. Торговля:</strong> Обменивайтесь улицами и деньгами с другими игроками.</p><p><strong>7. Тюрьма:</strong> ПОЛИЦИЯ или карта → 3 хода или дубль.</p><p><strong>8. Шанс/Казна:</strong> Случайные события.</p><p><strong>9. Поля:</strong> Кнопка "ПОЛЯ" покажет историю каждой улицы!</p>`,
        game_roll: '🎲 БРОСИТЬ',
        game_end_turn: '⏩ ЗАВЕРШИТЬ',
        game_build: '🏗️ СТРОИТЬ',
        game_fields: '📋 ПОЛЯ',
        game_menu: '🏠 МЕНЮ',
        game_save: '💾',
        game_trade: '🤝',
        game_mortgage: '🏦',
        game_history: '📋 ИСТОРИЯ ХОДОВ',
        game_stats: '📊 СТАТИСТИКА',
        game_time: '00:00',
        game_turn: 'Ход',
        game_message: 'Нажмите "БРОСИТЬ"',
        game_your_turn: '🎯 Ваш ход!',
        game_turn_of: '⏳ Ход игрока:',
        game_jail_turn: '🔒 Ваш ход (в тюрьме)!',
        buy_price: '💰 Цена:',
        buy_rent: '📈 Аренда:',
        buy_buy: '💰 КУПИТЬ',
        buy_auction: '🔨 АУКЦИОН',
        auction_title: '🔨 АУКЦИОН:',
        auction_start: 'Стартовая цена:',
        auction_current: 'Текущая ставка:',
        auction_bidder: 'Участник:',
        auction_bid: '📈 СДЕЛАТЬ СТАВКУ',
        auction_pass: '🚫 ПАС',
        build_title: '🏗️ СТРОИТЕЛЬСТВО',
        build_close: 'ЗАКРЫТЬ',
        mortgage_title: '🏦 ЗАЛОГ НЕДВИЖИМОСТИ',
        mortgage_close: 'ЗАКРЫТЬ',
        trade_title: '🤝 ТОРГОВЛЯ',
        trade_you_offer: 'Вы предлагаете',
        trade_partner_offer: 'Партнёр предлагает',
        trade_money: 'Деньги',
        trade_propose: '📨 ПРЕДЛОЖИТЬ',
        trade_close: 'ЗАКРЫТЬ',
        trade_response_accept: '✅ ПРИНЯТЬ',
        trade_response_reject: '❌ ОТКЛОНИТЬ',
        chat_title: '💬 ЧАТ',
        chat_placeholder: 'Сообщение...',
        confirm_yes: 'ДА',
        confirm_no: 'НЕТ',
        confirm_exit: 'Выйти в меню? Прогресс будет потерян!',
    },
    en: {
        menu_title: 'MONOPOLY',
        menu_local: '🎮 Play Local',
        menu_bot: '🤖 Play with Bots',
        menu_online_create: '🌐 Create Online Room',
        menu_online_join: '🔗 Join Room',
        menu_load: '💾 Load Game',
        menu_settings: '⚙️ Settings',
        menu_rules: '📜 Rules',
        menu_footer: 'Course Project · Vildanov R.R. · ChEnK · ISP-7-23',
        loading: 'LOADING MONOPOLY',
        settings_title: '⚙️ SETTINGS',
        settings_start_money: 'Starting capital:',
        settings_money_1000: '$1000 (Quick)',
        settings_money_1500: '$1500 (Classic)',
        settings_money_2000: '$2000 (Rich)',
        settings_money_2500: '$2500 (Oligarch)',
        settings_bot_count: 'Number of bots:',
        settings_bot_1: '1 bot',
        settings_bot_2: '2 bots',
        settings_bot_3: '3 bots',
        settings_anim_speed: 'Animation speed:',
        settings_anim_fast: 'Fast',
        settings_anim_normal: 'Normal',
        settings_anim_slow: 'Slow',
        settings_sound: 'Sound:',
        settings_sound_on: 'On',
        settings_sound_off: 'Off',
        settings_mode: 'Mode:',
        settings_mode_normal: 'Normal',
        settings_mode_fast: 'Quick Game',
        settings_language: 'Language:',
        settings_lang_ru: '🇷🇺 Русский',
        settings_lang_en: '🇬🇧 English',
        settings_save: '💾 SAVE',
        token_title: '🎨 SELECT TOKENS',
        token_players: 'Number of players:',
        token_players_2: '2 players',
        token_players_3: '3 players',
        token_players_4: '4 players',
        token_start: '🎯 START GAME',
        token_back: '↩️ BACK',
        load_title: '💾 LOAD GAME',
        load_empty: 'Empty',
        load_back: '↩️ BACK',
        load_slot: 'Slot',
        rules_title: '📖 GAME RULES',
        rules_text: `<p><strong>1. Goal:</strong> Be the last player remaining without going bankrupt.</p><p><strong>2. Start:</strong> Each player receives starting capital. Passing GO gives +$200.</p><p><strong>3. Purchase:</strong> Free properties can be bought. Decline → auction.</p><p><strong>4. Houses:</strong> Collect all properties of one color → build houses (up to 4) and hotel.</p><p><strong>5. Mortgage:</strong> Need money? Mortgage property for 50% of value.</p><p><strong>6. Trade:</strong> Exchange properties and money with other players.</p><p><strong>7. Jail:</strong> POLICE or card → 3 turns or double.</p><p><strong>8. Chance/Chest:</strong> Random events.</p><p><strong>9. Fields:</strong> "FIELDS" button shows history of each street!</p>`,
        game_roll: '🎲 ROLL',
        game_end_turn: '⏩ END TURN',
        game_build: '🏗️ BUILD',
        game_fields: '📋 FIELDS',
        game_menu: '🏠 MENU',
        game_save: '💾',
        game_trade: '🤝',
        game_mortgage: '🏦',
        game_history: '📋 GAME LOG',
        game_stats: '📊 STATISTICS',
        game_time: '00:00',
        game_turn: 'Turn',
        game_message: 'Press "ROLL"',
        game_your_turn: '🎯 Your turn!',
        game_turn_of: '⏳ Turn:',
        game_jail_turn: '🔒 Your turn (in jail)!',
        buy_price: '💰 Price:',
        buy_rent: '📈 Rent:',
        buy_buy: '💰 BUY',
        buy_auction: '🔨 AUCTION',
        auction_title: '🔨 AUCTION:',
        auction_start: 'Starting price:',
        auction_current: 'Current bid:',
        auction_bidder: 'Bidder:',
        auction_bid: '📈 PLACE BID',
        auction_pass: '🚫 PASS',
        build_title: '🏗️ CONSTRUCTION',
        build_close: 'CLOSE',
        mortgage_title: '🏦 MORTGAGE PROPERTIES',
        mortgage_close: 'CLOSE',
        trade_title: '🤝 TRADE',
        trade_you_offer: 'You offer',
        trade_partner_offer: 'Partner offers',
        trade_money: 'Money',
        trade_propose: '📨 PROPOSE',
        trade_close: 'CLOSE',
        trade_response_accept: '✅ ACCEPT',
        trade_response_reject: '❌ REJECT',
        chat_title: '💬 CHAT',
        chat_placeholder: 'Message...',
        confirm_yes: 'YES',
        confirm_no: 'NO',
        confirm_exit: 'Return to menu? Progress will be lost!',
    }
};

let currentLang = 'ru';

function t(key) {
    const lang = LANGUAGES[currentLang] || LANGUAGES['ru'];
    return lang[key] || LANGUAGES['ru'][key] || key;
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('monopoly_language', lang);
    updateAllTexts();
}
// ==================== АВТОЗАГРУЗКА ЯЗЫКА ====================
loadLanguage();

// ==================== ОБНОВЛЕНИЕ ВСЕХ ТЕКСТОВ ====================
function updateAllTexts() {
    // ---- ГЛАВНОЕ МЕНЮ ----
    const title = document.querySelector('.game-title');
    if (title) title.textContent = t('menu_title');
    
    const btnLocal = document.getElementById('btn-local');
    if (btnLocal) btnLocal.textContent = t('menu_local');
    
    const btnBot = document.getElementById('btn-bot');
    if (btnBot) btnBot.textContent = t('menu_bot');
    
    const btnOnlineCreate = document.querySelector('.menu-btn.success');
    if (btnOnlineCreate && btnOnlineCreate.textContent.includes('Создать')) {
        btnOnlineCreate.textContent = t('menu_online_create');
    }
    
    const btnOnlineJoin = document.querySelectorAll('.menu-btn.secondary')[1];
    if (btnOnlineJoin && btnOnlineJoin.textContent.includes('Присоединиться')) {
        btnOnlineJoin.textContent = t('menu_online_join');
    }
    
    const btnLoad = document.getElementById('btn-load');
    if (btnLoad) btnLoad.textContent = t('menu_load');
    
    const btnSettings = document.getElementById('btn-settings');
    if (btnSettings) btnSettings.textContent = t('menu_settings');
    
    const btnRules = document.getElementById('btn-rules');
    if (btnRules) btnRules.textContent = t('menu_rules');
    
    const footer = document.querySelector('.menu-footer p');
    if (footer) footer.textContent = t('menu_footer');
    
    // ---- ПРЕЛОАДЕР ----
    const preloaderH2 = document.querySelector('.preloader-content h2');
    if (preloaderH2) preloaderH2.textContent = t('loading');
    
    // ---- НАСТРОЙКИ ----
    const settingsTitle = document.querySelector('#settings-modal h2');
    if (settingsTitle) settingsTitle.textContent = t('settings_title');
    
    const settingsLabels = document.querySelectorAll('.settings-grid label');
    if (settingsLabels[0]) settingsLabels[0].textContent = t('settings_start_money');
    if (settingsLabels[1]) settingsLabels[1].textContent = t('settings_bot_count');
    if (settingsLabels[2]) settingsLabels[2].textContent = t('settings_anim_speed');
    if (settingsLabels[3]) settingsLabels[3].textContent = t('settings_sound');
    if (settingsLabels[4]) settingsLabels[4].textContent = t('settings_mode');
    if (settingsLabels[5]) settingsLabels[5].textContent = t('settings_language');
    
    const moneySelect = document.getElementById('starting-money');
    if (moneySelect) {
        moneySelect.options[0].textContent = t('settings_money_1000');
        moneySelect.options[1].textContent = t('settings_money_1500');
        moneySelect.options[2].textContent = t('settings_money_2000');
        moneySelect.options[3].textContent = t('settings_money_2500');
    }
    
    const botSelect = document.getElementById('bot-count');
    if (botSelect) {
        botSelect.options[0].textContent = t('settings_bot_1');
        botSelect.options[1].textContent = t('settings_bot_2');
        botSelect.options[2].textContent = t('settings_bot_3');
    }
    
    const animSelect = document.getElementById('animation-speed');
    if (animSelect) {
        animSelect.options[0].textContent = t('settings_anim_fast');
        animSelect.options[1].textContent = t('settings_anim_normal');
        animSelect.options[2].textContent = t('settings_anim_slow');
    }
    
    const soundSelect = document.getElementById('sound-enabled');
    if (soundSelect) {
        soundSelect.options[0].textContent = t('settings_sound_on');
        soundSelect.options[1].textContent = t('settings_sound_off');
    }
    
    const modeSelect = document.getElementById('fast-mode');
    if (modeSelect) {
        modeSelect.options[0].textContent = t('settings_mode_normal');
        modeSelect.options[1].textContent = t('settings_mode_fast');
    }
    
    const langSelect = document.getElementById('language-select');
    if (langSelect) {
        langSelect.options[0].textContent = t('settings_lang_ru');
        langSelect.options[1].textContent = t('settings_lang_en');
    }
    
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    if (saveSettingsBtn) saveSettingsBtn.textContent = t('settings_save');
    
    // ---- ВЫБОР ФИГУРОК ----
    const tokenTitle = document.querySelector('#token-select-modal h2');
    if (tokenTitle) tokenTitle.textContent = t('token_title');
    
    const tokenLabel = document.querySelector('.player-count-selector label');
    if (tokenLabel) tokenLabel.textContent = t('token_players');
    
    const playerCountSelect = document.getElementById('player-count-select');
    if (playerCountSelect) {
        playerCountSelect.options[0].textContent = t('token_players_2');
        playerCountSelect.options[1].textContent = t('token_players_3');
        playerCountSelect.options[2].textContent = t('token_players_4');
    }
    
    const startBtn = document.getElementById('start-local-game-btn');
    if (startBtn) startBtn.textContent = t('token_start');
    
    const backBtn = document.getElementById('cancel-token-select');
    if (backBtn) backBtn.textContent = t('token_back');
    
    // ---- ЗАГРУЗКА ИГРЫ ----
    const loadTitle = document.querySelector('#load-modal h2');
    if (loadTitle) loadTitle.textContent = t('load_title');
    
    const cancelLoadBtn = document.getElementById('cancel-load');
    if (cancelLoadBtn) cancelLoadBtn.textContent = t('load_back');
    
    // ---- ПРАВИЛА ----
    const rulesTitle = document.querySelector('#rules-modal h2');
    if (rulesTitle) rulesTitle.textContent = t('rules_title');
    
    const rulesText = document.querySelector('.rules-text');
    if (rulesText) rulesText.innerHTML = t('rules_text');
    
    // ---- ИГРОВОЙ ИНТЕРФЕЙС ----
    const rollBtn = document.getElementById('roll-btn');
    if (rollBtn) rollBtn.textContent = t('game_roll');
    
    const endTurnBtn = document.getElementById('end-turn-btn');
    if (endTurnBtn) endTurnBtn.textContent = t('game_end_turn');
    
    const buildBtn = document.getElementById('build-btn');
    if (buildBtn) buildBtn.textContent = t('game_build');
    
    const fieldsBtn = document.getElementById('fields-info-btn');
    if (fieldsBtn) fieldsBtn.textContent = t('game_fields');
    
    const menuBtn = document.getElementById('menu-back-btn');
    if (menuBtn) menuBtn.textContent = t('game_menu');
    
    const saveBtn = document.getElementById('save-game-btn');
    if (saveBtn) saveBtn.textContent = t('game_save');
    
    const tradeBtn = document.getElementById('trade-btn');
    if (tradeBtn) tradeBtn.textContent = t('game_trade');
    
    const mortgageBtn = document.getElementById('mortgage-btn');
    if (mortgageBtn) mortgageBtn.textContent = t('game_mortgage');
    
    const gameMessage = document.getElementById('game-message');
    if (gameMessage) gameMessage.textContent = t('game_message');
    
    // ---- ПАНЕЛЬ ПОКУПКИ ----
    const buyBtn = document.getElementById('buy-property-btn');
    if (buyBtn) buyBtn.textContent = t('buy_buy');
    
    const auctionBtn = document.getElementById('auction-property-btn');
    if (auctionBtn) auctionBtn.textContent = t('buy_auction');
    
    // ---- АУКЦИОН ----
    const placeBidBtn = document.getElementById('place-bid-btn');
    if (placeBidBtn) placeBidBtn.textContent = t('auction_bid');
    
    const passAuctionBtn = document.getElementById('pass-auction-btn');
    if (passAuctionBtn) passAuctionBtn.textContent = t('auction_pass');
    
    // ---- СТРОИТЕЛЬСТВО ----
    const closeBuildBtn = document.getElementById('close-build-panel');
    if (closeBuildBtn) closeBuildBtn.textContent = t('build_close');
    
    // ---- ЗАЛОГ ----
    const closeMortgageBtn = document.getElementById('close-mortgage-panel');
    if (closeMortgageBtn) closeMortgageBtn.textContent = t('mortgage_close');
    
    // ---- ТОРГОВЛЯ ----
    const proposeTradeBtn = document.getElementById('propose-trade-btn');
    if (proposeTradeBtn) proposeTradeBtn.textContent = t('trade_propose');
    
    const closeTradeBtn = document.getElementById('close-trade-panel');
    if (closeTradeBtn) closeTradeBtn.textContent = t('trade_close');
    
    const acceptTradeBtn = document.getElementById('accept-trade-btn');
    if (acceptTradeBtn) acceptTradeBtn.textContent = t('trade_response_accept');
    
    const rejectTradeBtn = document.getElementById('reject-trade-btn');
    if (rejectTradeBtn) rejectTradeBtn.textContent = t('trade_response_reject');
    
    // ---- ЧАТ ----
    const chatHeader = document.querySelector('#chat-toggle-header span:first-child');
    if (chatHeader) chatHeader.textContent = t('chat_title');
    
    const chatInput = document.getElementById('chat-input');
    if (chatInput) chatInput.placeholder = t('chat_placeholder');
    
    // ---- ПОДТВЕРЖДЕНИЕ ----
    const confirmYes = document.getElementById('confirm-yes');
    if (confirmYes) confirmYes.textContent = t('confirm_yes');
    
    const confirmNo = document.getElementById('confirm-no');
    if (confirmNo) confirmNo.textContent = t('confirm_no');
}

// Делаем updateAllTexts глобальной
window.updateAllTexts = updateAllTexts;

function loadLanguage() {
    const saved = localStorage.getItem('monopoly_language');
    if (saved && LANGUAGES[saved]) currentLang = saved;
}
