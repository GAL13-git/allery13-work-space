/**
 * Gallery 13 Work Space - Конфигурация приложения
 */

const GALLERY13_CONFIG = {
    // Информация о компании
    company: {
        name: 'Gallery 13 Work Space',
        shortName: 'Gallery 13',
        slogan: 'Пространство для эффективной работы',
        logo: '🖼️',
        primaryColor: '#8B5CF6',
        secondaryColor: '#3B82F6',
        workingHours: '10:00 - 22:00',
        timezone: 'Europe/Moscow'
    },

    // Торговые точки
    locations: [
        { 
            id: 'gallery13_main', 
            name: 'Gallery 13 - Главный', 
            address: 'Основной зал',
            type: 'main',
            phone: '+7 (XXX) XXX-XX-XX',
            manager: 'Александр Иванов'
        },
        { 
            id: 'gallery13_vip', 
            name: 'Gallery 13 - VIP', 
            address: 'VIP зона',
            type: 'vip',
            phone: '+7 (XXX) XXX-XX-XX',
            manager: 'Дмитрий Петров'
        },
        { 
            id: 'gallery13_storage', 
            name: 'Gallery 13 - Склад', 
            address: 'Складская зона',
            type: 'storage',
            phone: '+7 (XXX) XXX-XX-XX',
            manager: 'Иван Кузнецов'
        },
        { 
            id: 'gallery13_office', 
            name: 'Gallery 13 - Офис', 
            address: 'Офисное помещение',
            type: 'office',
            phone: '+7 (XXX) XXX-XX-XX',
            manager: 'Мария Смирнова'
        }
    ],

    // Роли сотрудников
    roles: {
        admin: 'Администратор Gallery 13',
        assistant: 'Помощник администратора',
        manager: 'Менеджер',
        cashier: 'Кассир',
        security: 'Охрана',
        consultant: 'Консультант',
        webdev: 'Web-разработчик',
        cleaner: 'Уборщик',
        technician: 'Техник'
    },

    // Функции доступные для каждой роли
    permissions: {
        admin: ['report', 'complaints', 'household', 'chat', 'manage_employees', 'view_all_locations', 'export_data', 'system_settings'],
        assistant: ['report', 'complaints', 'household', 'chat', 'manage_employees', 'view_all_locations'],
        manager: ['report', 'household', 'chat', 'view_all_locations'],
        cashier: ['report', 'household', 'chat'],
        security: ['report', 'chat'],
        consultant: ['household', 'chat'],
        webdev: ['manage_employees', 'view_all_locations', 'system_settings'],
        cleaner: ['household'],
        technician: ['report', 'household']
    },

    // Настройки приложения
    settings: {
        appVersion: '1.0.0',
        defaultPinLength: 4,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        chatMessageLimit: 1000,
        reportPhotoRequired: true,
        autoLogoutMinutes: 30,
        notificationSound: true,
        theme: 'dark'
    },

    // Категории для хозчасти
    householdCategories: [
        { id: 'office', name: 'Канцелярия', icon: '🖊️' },
        { id: 'cleaning', name: 'Уборка', icon: '🧹' },
        { id: 'kitchen', name: 'Кухня', icon: '🍽️' },
        { id: 'electronics', name: 'Электроника', icon: '🔌' },
        { id: 'furniture', name: 'Мебель', icon: '🪑' },
        { id: 'beverages', name: 'Напитки', icon: '🥤' },
        { id: 'hygiene', name: 'Гигиена', icon: '🧴' },
        { id: 'other', name: 'Другое', icon: '📦' }
    ],

    // Статусы заказов
    orderStatuses: {
        new: { name: 'Новый', color: '#3B82F6' },
        processing: { name: 'В обработке', color: '#F59E0B' },
        approved: { name: 'Одобрен', color: '#10B981' },
        delivered: { name: 'Доставлен', color: '#8B5CF6' },
        cancelled: { name: 'Отменен', color: '#EF4444' }
    },

    // Статусы жалоб
    complaintStatuses: {
        new: { name: 'Новая', color: '#3B82F6' },
        in_progress: { name: 'В работе', color: '#F59E0B' },
        resolved: { name: 'Решена', color: '#10B981' },
        rejected: { name: 'Отклонена', color: '#EF4444' }
    },

    // Типы отчетов
    reportTypes: {
        daily: 'Ежедневный отчет',
        shift_open: 'Открытие смены',
        shift_close: 'Закрытие смены',
        inventory: 'Инвентаризация',
        incident: 'Инцидент'
    },

    // Контакты для экстренных случаев
    emergencyContacts: [
        { name: 'Техподдержка', phone: '+7 (XXX) XXX-XX-XX', role: 'technician' },
        { name: 'Администратор', phone: '+7 (XXX) XXX-XX-XX', role: 'admin' },
        { name: 'Охрана', phone: '+7 (XXX) XXX-XX-XX', role: 'security' }
    ]
};

// Имитация базы данных сотрудников
const EMPLOYEES_DB = [
    { 
        id: 1, 
        name: 'Александр Иванов', 
        role: 'admin', 
        telegramId: 'admin_g13',
        phone: '+7 (999) 111-22-33',
        email: 'admin@gallery13.ru',
        location: 'gallery13_main',
        pin: '1313',
        position: 'Главный администратор',
        hireDate: '2023-01-15',
        status: 'active',
        permissions: GALLERY13_CONFIG.permissions.admin
    },
    { 
        id: 2, 
        name: 'Мария Смирнова', 
        role: 'assistant', 
        telegramId: 'assistant_g13',
        phone: '+7 (999) 222-33-44',
        email: 'assistant@gallery13.ru',
        location: 'gallery13_main',
        pin: '1314',
        position: 'Помощник администратора',
        hireDate: '2023-03-20',
        status: 'active',
        permissions: GALLERY13_CONFIG.permissions.assistant
    },
    { 
        id: 3, 
        name: 'Дмитрий Петров', 
        role: 'manager', 
        telegramId: 'manager_g13',
        phone: '+7 (999) 333-44-55',
        email: 'manager@gallery13.ru',
        location: 'gallery13_vip',
        pin: '1315',
        position: 'Менеджер VIP зоны',
        hireDate: '2023-05-10',
        status: 'active',
        permissions: GALLERY13_CONFIG.permissions.manager
    }
];

// Расширенная база сотрудников (загружается с сервера или localStorage)
let EXTENDED_EMPLOYEES_DB = [...EMPLOYEES_DB];

// Функции для работы с конфигурацией
const ConfigManager = {
    // Получение информации о локации
    getLocationInfo: function(locationId) {
        return GALLERY13_CONFIG.locations.find(loc => loc.id === locationId);
    },
    
    // Получение информации о роли
    getRoleInfo: function(role) {
        return {
            name: GALLERY13_CONFIG.roles[role],
            permissions: GALLERY13_CONFIG.permissions[role] || []
        };
    },
    
    // Получение всех локаций для сотрудника
    getAvailableLocations: function(employee) {
        if (!employee) return [];
        
        const permissions = GALLERY13_CONFIG.permissions[employee.role];
        if (permissions && permissions.includes('view_all_locations')) {
            return GALLERY13_CONFIG.locations;
        }
        
        const location = GALLERY13_CONFIG.locations.find(loc => loc.id === employee.location);
        return location ? [location] : [];
    },
    
    // Получение сотрудников по локации
    getEmployeesByLocation: function(locationId) {
        return EXTENDED_EMPLOYEES_DB.filter(emp => emp.location === locationId);
    },
    
    // Добавление нового сотрудника
    addEmployee: function(employeeData) {
        const newId = Math.max(...EXTENDED_EMPLOYEES_DB.map(e => e.id), 0) + 1;
        const employee = {
            id: newId,
            ...employeeData,
            status: employeeData.status || 'active',
            hireDate: employeeData.hireDate || new Date().toISOString().split('T')[0]
        };
        
        EXTENDED_EMPLOYEES_DB.push(employee);
        this.saveToLocalStorage();
        return employee;
    },
    
    // Обновление сотрудника
    updateEmployee: function(id, employeeData) {
        const index = EXTENDED_EMPLOYEES_DB.findIndex(e => e.id === id);
        if (index !== -1) {
            EXTENDED_EMPLOYEES_DB[index] = { ...EXTENDED_EMPLOYEES_DB[index], ...employeeData };
            this.saveToLocalStorage();
            return EXTENDED_EMPLOYEES_DB[index];
        }
        return null;
    },
    
    // Удаление сотрудника
    deleteEmployee: function(id) {
        const index = EXTENDED_EMPLOYEES_DB.findIndex(e => e.id === id);
        if (index !== -1) {
            EXTENDED_EMPLOYEES_DB.splice(index, 1);
            this.saveToLocalStorage();
            return true;
        }
        return false;
    },
    
    // Сохранение в localStorage
    saveToLocalStorage: function() {
        try {
            const customEmployees = EXTENDED_EMPLOYEES_DB.filter(e => e.id > 3); // Фильтруем тестовых
            localStorage.setItem('gallery13_custom_employees', JSON.stringify(customEmployees));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    },
    
    // Загрузка из localStorage
    loadFromLocalStorage: function() {
        try {
            const saved = localStorage.getItem('gallery13_custom_employees');
            if (saved) {
                const customEmployees = JSON.parse(saved);
                EXTENDED_EMPLOYEES_DB = [...EMPLOYEES_DB, ...customEmployees];
            }
        } catch (e) {
            console.error('Error loading from localStorage:', e);
        }
    },
    
    // Получение всех сотрудников
    getAllEmployees: function() {
        return EXTENDED_EMPLOYEES_DB;
    },
    
    // Поиск сотрудника по PIN и локации
    findEmployeeByPin: function(locationId, pin) {
        return EXTENDED_EMPLOYEES_DB.find(emp => 
            emp.location === locationId && emp.pin === pin && emp.status === 'active'
        );
    },
    
    // Получение статистики
    getStatistics: function() {
        const total = EXTENDED_EMPLOYEES_DB.length;
        const active = EXTENDED_EMPLOYEES_DB.filter(e => e.status === 'active').length;
        const byRole = {};
        
        EXTENDED_EMPLOYEES_DB.forEach(emp => {
            byRole[emp.role] = (byRole[emp.role] || 0) + 1;
        });
        
        return {
            total,
            active,
            inactive: total - active,
            byRole,
            locations: [...new Set(EXTENDED_EMPLOYEES_DB.map(e => e.location))].length
        };
    }
};

// Инициализация загрузки данных из localStorage
ConfigManager.loadFromLocalStorage();

// Экспорт для использования в других файлах
if (typeof module !== 'undefined') {
    module.exports = { GALLERY13_CONFIG, EMPLOYEES_DB, ConfigManager };
} else {
    window.GALLERY13_CONFIG = GALLERY13_CONFIG;
    window.EMPLOYEES_DB = EMPLOYEES_DB;
    window.ConfigManager = ConfigManager;
}