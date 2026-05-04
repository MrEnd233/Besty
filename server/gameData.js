// ==================== КОНСТАНТЫ ИГРЫ (общие для клиента и сервера) ====================

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
    'brown': 50, 'lightblue': 50, 'pink': 100, 'orange': 100,
    'red': 150, 'yellow': 150, 'green': 200, 'blue': 200
};

const rentWithHouses = {
    'brown': [2, 10, 30, 90, 160, 250],
    'lightblue': [6, 30, 90, 270, 400, 550],
    'pink': [10, 50, 150, 450, 625, 750],
    'orange': [14, 70, 200, 550, 750, 950],
    'red': [18, 90, 250, 700, 875, 1050],
    'yellow': [22, 110, 330, 800, 975, 1150],
    'green': [26, 130, 390, 900, 1100, 1275],
    'blue': [35, 175, 500, 1100, 1300, 1500]
};

const chanceCards = [
    { text: "🎉 Вы выиграли в лотерею! Получите 150$", action: 'money', value: 150 },
    { text: "🚗 Штраф за превышение скорости. Заплатите 50$", action: 'pay', value: 50 },
    { text: "🏦 Банковские дивиденды. Получите 100$", action: 'money', value: 100 },
    { text: "🏥 Оплата медицинской страховки. Заплатите 75$", action: 'pay', value: 75 },
    { text: "🎁 День рождения! Каждый игрок дарит вам по 20$", action: 'birthday', value: 20 },
    { text: "🏠 Ремонт квартиры. Заплатите 100$", action: 'pay', value: 100 },
    { text: "📈 Акции выросли! Получите 200$", action: 'money', value: 200 },
    { text: "⚖️ Судебные издержки. Заплатите 125$", action: 'pay', value: 125 },
    { text: "🚔 Вы арестованы! Отправляйтесь в тюрьму!", action: 'gotojail', value: 0 },
    { text: "🎫 Бесплатная поездка на СТАРТ!", action: 'gostart', value: 0 },
    { text: "💰 Налоговая проверка. Заплатите 80$", action: 'pay', value: 80 },
    { text: "🎰 Джекпот! Получите 300$", action: 'money', value: 300 }
];

const chestCards = [
    { text: "📦 Банковская ошибка в вашу пользу. Получите 200$", action: 'money', value: 200 },
    { text: "🏥 Счет от доктора. Заплатите 50$", action: 'pay', value: 50 },
    { text: "🎓 Стипендия. Получите 100$", action: 'money', value: 100 },
    { text: "🚗 Штраф за парковку. Заплатите 30$", action: 'pay', value: 30 },
    { text: "🏆 Вторая премия на конкурсе красоты. Получите 10$", action: 'money', value: 10 },
    { text: "📚 Продажа книг. Получите 75$", action: 'money', value: 75 },
    { text: "🔧 Ремонт бытовой техники. Заплатите 60$", action: 'pay', value: 60 },
    { text: "🎂 Вы выиграли пирог! Получите 25$", action: 'money', value: 25 },
    { text: "🔑 Освобождение из тюрьмы!", action: 'jailcard', value: 0 },
    { text: "🚔 Вы арестованы! Отправляйтесь в тюрьму!", action: 'gotojail', value: 0 },
    { text: "🏦 Возврат налога. Получите 120$", action: 'money', value: 120 },
    { text: "🎁 Подарок от бабушки. Получите 50$", action: 'money', value: 50 }
];

module.exports = {
    boardCells,
    houseCosts,
    rentWithHouses,
    chanceCards,
    chestCards
};