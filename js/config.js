/**
 * Gallery 13 Work Space - Конфигурация приложения
 */

const GALLERY13_CONFIG = {
    // Информация о компании
    company: {
        name: 'Gallery 13 Work Space',
        shortName: 'Gallery 13',
        slogan: 'Профессиональное пространство',
        logo: '🖼️',
        primaryColor: '#8B5CF6',
        secondaryColor: '#3B82F6',
        workingHours: '10:00 - 22:00',
        timezone: 'Europe/Moscow',
        adminTelegramId: 'ADMIN_TELEGRAM_ID' // Замените на реальный ID админа
    },

    // Торговые точки (теперь можно добавлять через админку)
    locations: [
        { 
            id: 'gallery13_main', 
            name: 'Gallery 13 - Главный', 
            address: 'Основной зал, ул. Примерная, 13',
            type: 'main',
            phone: '+7 (999) 111-22-33',
            manager: 'Александр Иванов'
        },
        { 
            id: 'gallery13_office', 
            name: 'Gallery 13 - Офис', 
            address: 'Офисное помещение, ул. Примерная, 13',
            type: 'office',
            phone: '+7 (999) 222-33-44',
            manager: 'Мария Смирнова'
        }
    ],

    // Роли сотрудников
    roles: {
        admin: 'Администратор Gallery 13',
        assistant: 'Помощник администратора',
        manager: 'Менеджер',
        cashier: 'Кассир',
        consultant: 'Консультант',
        technician: 'Техник'
    },

    // Функции доступные для каждой роли
    permissions: {
        admin: ['report', 'complaints', 'stationery', 'chat', 'manage_employees', 'manage_locations', 'view_all_locations', 'export_data', 'system_settings', 'receive_notifications'],
        assistant: ['report', 'complaints', 'stationery', 'chat', 'manage_employees', 'view_all_locations'],
        manager: ['report', 'stationery', 'chat', 'view_all_locations'],
        cashier: ['report', 'stationery', 'chat'],
        consultant: ['stationery', 'chat'],
        technician: ['report', 'stationery']
    },

    // Настройки приложения
    settings: {
        appVersion: '1.0.0',
        defaultPinLength: 4,
        maxFileSize: 10 * 1024 * 1024,
        chatMessageLimit: 1000,
        reportPhotoRequired: true,
        autoLogoutMinutes: 30,
        notificationSound: true,
        theme: 'dark',
        telegramBotToken: 'YOUR_BOT_TOKEN' // Токен бота для уведомлений
    },

    // Канцелярия вместо хозчасти
    stationeryCategories: [
        { id: 'paper', name: 'Бумага', icon: '📄' },
        { id: 'pens', name: 'Ручки и карандаши', icon: '🖊️' },
        { id: 'folders', name: 'Папки и файлы', icon: '📁' },
        { id: 'office', name: 'Офисные принадлежности', icon: '📎' },
        { id: 'cleaning', name: 'Средства для уборки', icon: '🧹' },
        { id: 'beverages', name: 'Напитки', icon: '🥤' },
        { id: 'electronics', name: 'Электроника', icon: '🔌' },
        { id: 'other', name: 'Другое', icon: '📦' }
    ],

    // Типы уведомлений для админа
    notificationTypes: {
        new_report: '📊 Новый отчет',
        new_complaint: '🕵️ Новая жалоба',
        new_order: '🛒 Новый заказ канцелярии',
        new_employee: '👥 Новый сотрудник',
        new_location: '📍 Новая точка добавлена',
        emergency: '🚨 СРОЧНОЕ уведомление'
    },

    // Статусы заказов канцелярии
    orderStatuses: {
        new: { name: 'Новый', color: '#3B82F6' },
        processing: { name: 'В обработке', color: '#F59E0B' },
        approved: { name: 'Одобрен', color: '#10B981' },
        delivered: { name: 'Доставлен', color: '#8B5CF6' },
        cancelled: { name: 'Отменен', color: '#EF4444' }
    }
};

// База данных сотрудников
let EMPLOYEES_DB = [
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
        canReceiveNotifications: true
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
        status: 'active'
    }
];

// Расширенная база данных (загружается из localStorage)
let EXTENDED_EMPLOYEES_DB = [...EMPLOYEES_DB];

// Менеджер конфигурации
const ConfigManager = {
    // Получение всех локаций
    getAllLocations: function() {
        return GALLERY13_CONFIG.locations;
    },
    
    // Добавление новой локации
    addLocation: function(locationData) {
        const newLocation = {
            id: 'gallery13_' + Date.now(),
            ...locationData,
            createdAt: new Date().toISOString()
        };
        
        GALLERY13_CONFIG.locations.push(newLocation);
        this.saveLocationsToStorage();
        
        // Отправляем уведомление админу
        this.sendAdminNotification('new_location', {
            location: newLocation.name,
            address: newLocation.address,
            addedBy: window.currentEmployee?.name || 'Система'
        });
        
        return newLocation;
    },
    
    // Обновление локации
    updateLocation: function(locationId, locationData) {
        const index = GALLERY13_CONFIG.locations.findIndex(l => l.id === locationId);
        if (index !== -1) {
            GALLERY13_CONFIG.locations[index] = { 
                ...GALLERY13_CONFIG.locations[index], 
                ...locationData 
            };
            this.saveLocationsToStorage();
            return GALLERY13_CONFIG.locations[index];
        }
        return null;
    },
    
    // Удаление локации
    deleteLocation: function(locationId) {
        const index = GALLERY13_CONFIG.locations.findIndex(l => l.id === locationId);
        if (index !== -1) {
            GALLERY13_CONFIG.locations.splice(index, 1);
            this.saveLocationsToStorage();
            return true;
        }
        return false;
    },
    
    // Сохранение локаций в localStorage
    saveLocationsToStorage: function() {
        try {
            localStorage.setItem('gallery13_custom_locations', JSON.stringify(GALLERY13_CONFIG.locations));
        } catch (e) {
            console.error('Error saving locations:', e);
        }
    },
    
    // Загрузка локаций из localStorage
    loadLocationsFromStorage: function() {
        try {
            const saved = localStorage.getItem('gallery13_custom_locations');
            if (saved) {
                GALLERY13_CONFIG.locations = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error loading locations:', e);
        }
    },
    
    // Отправка уведомления админу
    sendAdminNotification: function(type, data) {
        const admin = EXTENDED_EMPLOYEES_DB.find(e => e.role === 'admin' && e.canReceiveNotifications);
        if (!admin || !admin.telegramId) return;
        
        const notification = {
            type: type,
            data: data,
            timestamp: new Date().toISOString(),
            recipient: admin.telegramId,
            employee: window.currentEmployee
        };
        
        // Сохраняем в историю уведомлений
        this.saveNotification(notification);
        
        // Отправляем через Telegram
        if (window.TelegramUtils) {
            window.TelegramUtils.sendNotificationToAdmin(notification);
        }
        
        console.log('Admin notification sent:', notification);
    },
    
    // Сохранение уведомления
    saveNotification: function(notification) {
        try {
            const notifications = JSON.parse(localStorage.getItem('gallery13_notifications') || '[]');
            notifications.unshift(notification);
            localStorage.setItem('gallery13_notifications', JSON.stringify(notifications.slice(0, 100))); // Храним последние 100
        } catch (e) {
            console.error('Error saving notification:', e);
        }
    },
    
    // Получение уведомлений
    getNotifications: function(limit = 20) {
        try {
            const notifications = JSON.parse(localStorage.getItem('gallery13_notifications') || '[]');
            return notifications.slice(0, limit);
        } catch (e) {
            console.error('Error getting notifications:', e);
            return [];
        }
    }
};

// Инициализация загрузки данных
ConfigManager.loadLocationsFromStorage();

// Экспорт
window.GALLERY13_CONFIG = GALLERY13_CONFIG;
window.ConfigManager = ConfigManager;