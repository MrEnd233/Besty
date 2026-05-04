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
        rules_text: '<p><strong>1. Цель:</strong> Остаться единственным необанкротившимся игроком.</p><p><strong>2. Старт:</strong> Каждый получает стартовый капитал. Проход СТАРТА +200$.</p><p><strong>3. Покупка:</strong> Свободные улицы можно купить. Отказ → аукцион.</p><p><strong>4. Дома:</strong> Соберите все улицы одного цвета → можно строить дома (до 4) и отель.</p><p><strong>5. Залог:</strong> Нужны деньги? Заложите недвижимость за 50% стоимости.</p><p><strong>6. Торговля:</strong> Обменивайтесь улицами и деньгами с другими игроками.</p><p><strong>7. Тюрьма:</strong> ПОЛИЦИЯ или карта → 3 хода или дубль.</p><p><strong>8. Шанс/Казна:</strong> Случайные события.</p><p><strong>9. Поля:</strong> Кнопка "ПОЛЯ" покажет историю каждой улицы!</p>',
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
        auth_subtitle: 'Войдите или зарегистрируйтесь',
auth_login: '🔑 ВХОД',
auth_username_placeholder: 'Логин',
auth_password_placeholder: 'Пароль',
auth_login_btn: 'ВОЙТИ',
auth_no_account: 'Нет аккаунта?',
auth_register_link: 'Зарегистрироваться',
auth_guest_login: 'Войти как гость',
auth_register: '📝 РЕГИСТРАЦИЯ',
auth_reg_username: 'Логин (мин. 3 символа)',
auth_reg_password: 'Пароль (мин. 4 символа)',
auth_reg_password2: 'Повторите пароль',
auth_register_btn: 'ЗАРЕГИСТРИРОВАТЬСЯ',
auth_has_account: 'Уже есть аккаунт?',
auth_login_link: 'Войти',
achievement_unlocked: 'Достижение разблокировано!',
trade_money_placeholder: 'Деньги',
confirm_ok: 'OK',
        confirm_no: 'НЕТ',
        confirm_exit: 'Выйти в меню? Прогресс будет потерян!'
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
        auth_subtitle: 'Login or register',
auth_login: '🔑 LOGIN',
auth_username_placeholder: 'Username',
auth_password_placeholder: 'Password',
auth_login_btn: 'LOGIN',
auth_no_account: 'No account?',
auth_register_link: 'Register',
auth_guest_login: 'Login as guest',
auth_register: '📝 REGISTRATION',
auth_reg_username: 'Username (min. 3 chars)',
auth_reg_password: 'Password (min. 4 chars)',
auth_reg_password2: 'Repeat password',
auth_register_btn: 'REGISTER',
auth_has_account: 'Already have an account?',
auth_login_link: 'Login',
achievement_unlocked: 'Achievement unlocked!',
trade_money_placeholder: 'Money',
confirm_ok: 'OK',
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
        rules_text: '<p><strong>1. Goal:</strong> Be the last player remaining without going bankrupt.</p><p><strong>2. Start:</strong> Each player receives starting capital. Passing GO gives +$200.</p><p><strong>3. Purchase:</strong> Free properties can be bought. Decline → auction.</p><p><strong>4. Houses:</strong> Collect all properties of one color → build houses (up to 4) and hotel.</p><p><strong>5. Mortgage:</strong> Need money? Mortgage property for 50% of value.</p><p><strong>6. Trade:</strong> Exchange properties and money with other players.</p><p><strong>7. Jail:</strong> POLICE or card → 3 turns or double.</p><p><strong>8. Chance/Chest:</strong> Random events.</p><p><strong>9. Fields:</strong> "FIELDS" button shows history of each street!</p>',
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
        confirm_exit: 'Return to menu? Progress will be lost!'
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

function loadLanguage() {
    const saved = localStorage.getItem('monopoly_language');
    if (saved && LANGUAGES[saved]) {
        currentLang = saved;
    }
}

// ==================== АВТОЗАГРУЗКА ЯЗЫКА ====================
loadLanguage();

// ==================== ОБНОВЛЕНИЕ ВСЕХ ТЕКСТОВ ====================
function updateAllTexts() {
    // 1. Автоматически обновляем все элементы с data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = t(key);
        if (text) {
            // Если это input/textarea с placeholder - обновляем placeholder
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.hasAttribute('placeholder')) {
                    el.setAttribute('placeholder', text);
                } else {
                    el.value = text;
                }
            } 
            // Если это select с data-i18n-options
            else if (el.tagName === 'SELECT' && el.hasAttribute('data-i18n-options')) {
                const optionKeys = el.getAttribute('data-i18n-options').split(',');
                const options = el.querySelectorAll('option');
                options.forEach((opt, i) => {
                    if (optionKeys[i]) {
                        opt.textContent = t(optionKeys[i].trim());
                    }
                });
            }
            // Для обычных элементов
// Для обычных элементов
else {
    if (el.hasAttribute('data-i18n-html')) {
        el.innerHTML = text;
    } else {
        el.textContent = text;
    }
}
        }
    });

    // 2. Специальные случаи (элементы, создаваемые динамически)
    const preloaderH2 = document.querySelector('.preloader-content h2');
    if (preloaderH2) preloaderH2.textContent = t('loading');

    const rulesText = document.querySelector('.rules-text');
    if (rulesText) rulesText.innerHTML = t('rules_text');

    // Обновляем язык в селекте настроек
    const langSelect = document.getElementById('language-select');
    if (langSelect) langSelect.value = currentLang;

    // Сохраняем кнопки сайд-панели, которые могут не иметь data-i18n
    const saveBtn = document.getElementById('save-game-btn');
    if (saveBtn && !saveBtn.hasAttribute('data-i18n')) saveBtn.textContent = t('game_save');
    
    const tradeBtn = document.getElementById('trade-btn');
    if (tradeBtn && !tradeBtn.hasAttribute('data-i18n')) tradeBtn.textContent = t('game_trade');
    
    const mortgageBtn = document.getElementById('mortgage-btn');
    if (mortgageBtn && !mortgageBtn.hasAttribute('data-i18n')) mortgageBtn.textContent = t('game_mortgage');
}

// Делаем функции глобальными
window.t = t;
window.setLanguage = setLanguage;
window.loadLanguage = loadLanguage;
window.updateAllTexts = updateAllTexts;