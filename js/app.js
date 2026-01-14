/**
 * Gallery 13 Work Space - Основное приложение
 * Главный файл с общей логикой
 */

// Глобальные переменные
let currentEmployee = null;
let selectedLocation = null;
let telegramApp = null;

// Инициализация приложения
function initApp() {
    console.log('Gallery 13 Work Space инициализирован');
    
    // Проверяем наличие Telegram WebApp
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
        initTelegramWebApp();
    }
    
    // Проверяем авторизацию при загрузке страниц
    checkAuthState();
    
    // Инициализация темы
    initTheme();
    
    // Инициализация менеджеров
    initManagers();
}

// Инициализация Telegram WebApp
function initTelegramWebApp() {
    telegramApp = new TelegramIntegration();
    window.telegramApp = telegramApp;
}

// Инициализация менеджеров
function initManagers() {
    // Инициализация менеджеров только если они еще не созданы
    if (!window.notificationManager) {
        window.notificationManager = new NotificationManager();
    }
    if (!window.sessionManager) {
        window.sessionManager = new SessionManager();
    }
    if (!window.gallery13API) {
        window.gallery13API = new Gallery13API();
    }
}

// Проверка состояния авторизации
function checkAuthState() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Страницы, не требующие авторизации
    const publicPages = ['index.html', ''];
    
    // Если пользователь на защищенной странице без авторизации
    if (!publicPages.includes(currentPage)) {
        if (!currentEmployee) {
            // Проверяем localStorage
            const savedEmployee = localStorage.getItem('gallery13_employee');
            if (savedEmployee) {
                try {
                    currentEmployee = JSON.parse(savedEmployee);
                } catch (e) {
                    // Если ошибка парсинга, редиректим на вход
                    redirectToLogin();
                }
            } else {
                redirectToLogin();
            }
        }
    }
}

// Перенаправление на страницу входа
function redirectToLogin() {
    if (window.location.pathname.includes('index.html')) return;
    window.location.href = 'index.html';
}

// Сохранение данных в localStorage
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Ошибка сохранения в localStorage:', e);
        return false;
    }
}

// Загрузка данных из localStorage
function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Ошибка загрузки из localStorage:', e);
        return null;
    }
}

// Инициализация темы
function initTheme() {
    // Устанавливаем темную тему по умолчанию
    document.documentElement.setAttribute('data-theme', 'dark');
    
    // Проверяем системные настройки
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

// Управление уведомлениями
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.container = null;
    }
    
    show(message, type = 'info', duration = 3000) {
        const types = {
            info: { icon: 'ℹ️', color: '#3B82F6' },
            success: { icon: '✅', color: '#10B981' },
            warning: { icon: '⚠️', color: '#F59E0B' },
            error: { icon: '❌', color: '#EF4444' }
        };
        
        const config = types[type] || types.info;
        
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <span class="notification-icon">${config.icon}</span>
            <span class="notification-text">${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${config.color};
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
            z-index: 9999;
            animation: notificationSlideIn 0.3s ease-out;
            display: flex;
            align-items: center;
            gap: 12px;
            max-width: 400px;
            word-break: break-word;
        `;
        
        document.body.appendChild(notification);
        
        // Удаляем через указанное время
        setTimeout(() => {
            notification.style.animation = 'notificationSlideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
        
        // Добавляем стили для анимаций
        this.addNotificationStyles();
    }
    
    addNotificationStyles() {
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes notificationSlideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes notificationSlideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Менеджер сессий
class SessionManager {
    constructor() {
        this.sessionTimeout = 30 * 60 * 1000; // 30 минут
        this.lastActivity = Date.now();
        this.setupActivityListeners();
    }
    
    setupActivityListeners() {
        // Отслеживаем активность пользователя
        ['click', 'keypress', 'mousemove', 'scroll'].forEach(event => {
            document.addEventListener(event, () => {
                this.updateActivity();
            });
        });
        
        // Проверяем сессию каждую минуту
        setInterval(() => {
            this.checkSession();
        }, 60000);
    }
    
    updateActivity() {
        this.lastActivity = Date.now();
    }
    
    checkSession() {
        const idleTime = Date.now() - this.lastActivity;
        
        if (idleTime > this.sessionTimeout && currentEmployee) {
            this.showSessionWarning();
        }
    }
    
    showSessionWarning() {
        if (!document.getElementById('session-warning')) {
            const warning = document.createElement('div');
            warning.id = 'session-warning';
            warning.innerHTML = `
                <div class="session-warning-content">
                    <p>Ваша сессия скоро закончится из-за неактивности</p>
                    <button onclick="window.sessionManager.extendSession()">Продолжить работу</button>
                </div>
            `;
            
            warning.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: var(--warning);
                color: black;
                padding: 16px;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
                z-index: 9998;
                animation: slideUp 0.3s ease-out;
            `;
            
            document.body.appendChild(warning);
            
            // Автоматически скрываем через 30 секунд
            setTimeout(() => {
                if (warning.parentNode) {
                    warning.style.animation = 'slideDown 0.3s ease-out';
                    setTimeout(() => warning.parentNode.removeChild(warning), 300);
                }
            }, 30000);
        }
    }
    
    extendSession() {
        this.updateActivity();
        const warning = document.getElementById('session-warning');
        if (warning) {
            warning.parentNode.removeChild(warning);
        }
        if (window.notificationManager) {
            window.notificationManager.show('Сессия продлена', 'success');
        }
    }
}

// Утилиты для работы с формами
class FormUtils {
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    static validatePhone(phone) {
        const re = /^[\+]\d{1,3}[-\s]?\(?\d{1,3}\)?[-\s]?\d{1,4}[-\s]?\d{1,4}[-\s]?\d{1,9}$/;
        return re.test(phone);
    }
    
    static validatePIN(pin) {
        return /^\d{4}$/.test(pin);
    }
    
    static formatDate(date) {
        return new Date(date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    static formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB'
        }).format(amount);
    }
    
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// API взаимодействие с бэкендом
class Gallery13API {
    constructor() {
        this.baseUrl = 'https://api.gallery13.com'; // Заменить на реальный URL
        this.token = localStorage.getItem('gallery13_token');
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        try {
            const response = await fetch(url, {
                ...options,
                headers
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
    
    // Методы для работы с сотрудниками
    async getEmployees() {
        return await this.request('/api/employees');
    }
    
    async createEmployee(data) {
        return await this.request('/api/employees', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    async updateEmployee(id, data) {
        return await this.request(`/api/employees/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    // Методы для отчетов
    async submitReport(data) {
        return await this.request('/api/reports', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    async getReports(date) {
        return await this.request(`/api/reports?date=${date}`);
    }
    
    // Методы для чата
    async sendMessage(data) {
        return await this.request('/api/chat/messages', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    async getMessages(limit = 50) {
        return await this.request(`/api/chat/messages?limit=${limit}`);
    }
    
    // Методы для канцелярии
    async submitOrder(data) {
        return await this.request('/api/orders', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    async getOrders(status = 'all') {
        return await this.request(`/api/orders?status=${status}`);
    }
    
    // Методы для анонимных жалоб
    async submitComplaint(data) {
        return await this.request('/api/complaints', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    async getComplaints(status = 'new') {
        return await this.request(`/api/complaints?status=${status}`);
    }
}

// Telegram Utils с уведомлениями админу
window.TelegramUtils = {
    // Отправка уведомления админу
    sendNotificationToAdmin: function(notification) {
        if (!telegramApp) return false;
        
        const data = {
            type: 'admin_notification',
            notification: notification,
            timestamp: new Date().toISOString()
        };
        
        return telegramApp.sendData(data);
    },
    
    // Отправка отчета
    sendReport: function(reportData) {
        if (!telegramApp) return false;
        
        const data = {
            type: 'report',
            data: reportData,
            timestamp: new Date().toISOString(),
            employee: window.currentEmployee
        };
        
        // Отправляем уведомление админу
        if (window.ConfigManager && window.ConfigManager.sendAdminNotification) {
            window.ConfigManager.sendAdminNotification('new_report', {
                employee: window.currentEmployee.name,
                location: window.GALLERY13_CONFIG.locations.find(l => l.id === reportData.location)?.name,
                timestamp: reportData.timestamp
            });
        }
        
        return telegramApp.sendData(data);
    },
    
    // Отправка жалобы
    sendComplaint: function(complaintData) {
        if (!telegramApp) return false;
        
        const data = {
            type: 'complaint',
            data: complaintData,
            timestamp: new Date().toISOString(),
            anonymous: complaintData.anonymous || true
        };
        
        // Отправляем уведомление админу
        if (window.ConfigManager && window.ConfigManager.sendAdminNotification) {
            window.ConfigManager.sendAdminNotification('new_complaint', {
                type: complaintData.type,
                location: complaintData.location || 'Не указано',
                timestamp: complaintData.timestamp
            });
        }
        
        return telegramApp.sendData(data);
    },
    
    // Отправка заказа канцелярии
    sendStationeryOrder: function(orderData) {
        if (!telegramApp) return false;
        
        const data = {
            type: 'stationery_order',
            data: orderData,
            timestamp: new Date().toISOString(),
            employee: window.currentEmployee
        };
        
        // Отправляем уведомление админу
        if (window.ConfigManager && window.ConfigManager.sendAdminNotification) {
            window.ConfigManager.sendAdminNotification('new_order', {
                location: window.GALLERY13_CONFIG.locations.find(l => l.id === orderData.location)?.name,
                itemsCount: orderData.items.length,
                total: orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                employee: window.currentEmployee.name
            });
        }
        
        return telegramApp.sendData(data);
    },
    
    // Отправка уведомления о новом сотруднике
    sendNewEmployeeNotification: function(employeeData) {
        if (!telegramApp) return false;
        
        const data = {
            type: 'new_employee',
            data: employeeData,
            timestamp: new Date().toISOString(),
            addedBy: window.currentEmployee
        };
        
        return telegramApp.sendData(data);
    },
    
    // Отправка уведомления о новой точке
    sendNewLocationNotification: function(locationData) {
        if (!telegramApp) return false;
        
        const data = {
            type: 'new_location',
            data: locationData,
            timestamp: new Date().toISOString(),
            addedBy: window.currentEmployee
        };
        
        return telegramApp.sendData(data);
    },
    
    // Показ уведомления через Telegram
    showTelegramNotification: function(message, type = 'info') {
        if (!telegramApp) {
            if (window.notificationManager) {
                window.notificationManager.show(message, type);
            } else {
                alert(message);
            }
            return;
        }
        
        const title = type === 'error' ? 'Ошибка' : 
                     type === 'success' ? 'Успешно' : 
                     type === 'warning' ? 'Внимание' : 'Информация';
        
        telegramApp.showAlert(message, title);
    },
    
    // Запрос фото через Telegram
    requestPhoto: function(callback) {
        if (!telegramApp) {
            // В standalone режиме используем input file
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.capture = 'environment';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        callback(e.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
            return;
        }
        
        // В Telegram используем встроенную камеру
        telegramApp.showPopup({
            title: 'Добавить фото',
            message: 'Telegram откроет камеру для создания фото',
            buttons: [
                { type: 'default', text: 'Сделать фото' },
                { type: 'default', text: 'Выбрать из галереи' },
                { type: 'cancel', text: 'Отмена' }
            ]
        });
        
        // Для демо сразу вызываем callback
        setTimeout(() => {
            callback('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
        }, 1000);
    }
};

// Инициализация менеджеров
const notificationManager = new NotificationManager();
const sessionManager = new SessionManager();
const gallery13API = new Gallery13API();

// Глобальные экспорты для использования в других файлах
window.Gallery13 = {
    app: {
        init: initApp,
        currentEmployee,
        selectedLocation,
        saveToLocalStorage,
        loadFromLocalStorage
    },
    utils: FormUtils,
    api: gallery13API,
    notifications: notificationManager,
    session: sessionManager
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initApp);

// Обработка ошибок
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    if (notificationManager) {
        notificationManager.show('Произошла ошибка в приложении', 'error');
    }
});

// Обработка обещаний без catch
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    if (notificationManager) {
        notificationManager.show('Ошибка в асинхронной операции', 'error');
    }
});

// Функции для работы с Telegram (обратная совместимость)
window.sendToTelegram = function(data) {
    if (window.TelegramUtils && window.TelegramUtils.sendNotificationToAdmin) {
        return window.TelegramUtils.sendNotificationToAdmin(data);
    }
    return false;
};

window.sendReportToTelegram = function(data) {
    if (window.TelegramUtils && window.TelegramUtils.sendReport) {
        return window.TelegramUtils.sendReport(data);
    }
    return false;
};

window.sendOrderToTelegram = function(data) {
    if (window.TelegramUtils && window.TelegramUtils.sendStationeryOrder) {
        return window.TelegramUtils.sendStationeryOrder(data);
    }
    return false;
};

window.sendComplaintToTelegram = function(data) {
    if (window.TelegramUtils && window.TelegramUtils.sendComplaint) {
        return window.TelegramUtils.sendComplaint(data);
    }
    return false;
};