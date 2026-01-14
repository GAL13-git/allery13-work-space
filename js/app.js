/**
 * Gallery 13 Work Space - Основное приложение
 * Главный файл с общей логикой
 */

// Глобальные переменные
let currentEmployee = null;
let selectedLocation = null;

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
                    <button onclick="sessionManager.extendSession()">Продолжить работу</button>
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
        notificationManager.show('Сессия продлена', 'success');
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
    
    // Методы для хозчасти
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
    notificationManager.show('Произошла ошибка в приложении', 'error');
});

// Обработка обещаний без catch
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    notificationManager.show('Ошибка в асинхронной операции', 'error');
});