/**
 * Gallery 13 Work Space - Система аутентификации
 * Управление пользователями, правами доступа
 */

// Конфигурация аутентификации
const AUTH_CONFIG = {
    tokenExpiry: 24 * 60 * 60 * 1000, // 24 часа
    pinAttempts: 3,
    lockoutTime: 15 * 60 * 1000 // 15 минут
};

// Класс для управления аутентификацией
class AuthManager {
    constructor() {
        this.pinAttempts = {};
        this.lockouts = {};
        this.init();
    }
    
    init() {
        // Загружаем попытки входа из localStorage
        this.loadAttempts();
        
        // Очищаем старые блокировки каждую минуту
        setInterval(() => this.cleanupLockouts(), 60000);
    }
    
    // Аутентификация сотрудника
    authenticate(locationId, pin) {
        // Проверяем блокировку
        if (this.isLocked(locationId)) {
            const lockout = this.lockouts[locationId];
            const remaining = Math.ceil((lockout - Date.now()) / 60000);
            throw new Error(`Локация заблокирована. Попробуйте через ${remaining} минут`);
        }
        
        // Ищем сотрудника
        const employee = this.findEmployee(locationId, pin);
        
        if (!employee) {
            // Увеличиваем счетчик неудачных попыток
            this.recordFailedAttempt(locationId);
            throw new Error('Неверный PIN-код или доступ запрещен');
        }
        
        // Сбрасываем счетчик при успешном входе
        this.resetAttempts(locationId);
        
        // Создаем сессию
        return this.createSession(employee);
    }
    
    // Поиск сотрудника в базе
    findEmployee(locationId, pin) {
        // Ищем в локальной базе из config.js
        let employee = EMPLOYEES_DB.find(emp => 
            emp.location === locationId && emp.pin === pin
        );
        
        // Если не нашли, проверяем расширенную базу
        if (!employee) {
            const extendedDB = this.getExtendedEmployeesDB();
            employee = extendedDB.find(emp => 
                emp.location === locationId && emp.pin === pin
            );
        }
        
        if (!employee) return null;
        
        // Проверяем доступ к локации
        if (!this.checkLocationAccess(employee, locationId)) {
            return null;
        }
        
        return {
            id: employee.id,
            name: employee.name,
            role: employee.role,
            position: employee.position || GALLERY13_CONFIG.roles[employee.role],
            location: employee.location,
            telegramId: employee.telegramId,
            permissions: this.getPermissions(employee.role),
            avatar: this.getAvatarForRole(employee.role),
            settings: employee.settings || {}
        };
    }
    
    // Проверка доступа к локации
    checkLocationAccess(employee, locationId) {
        const permissions = GALLERY13_CONFIG.permissions[employee.role];
        
        // Администраторы и webdev видят все точки
        if (permissions && permissions.includes('view_all_locations')) {
            return true;
        }
        
        // Остальные только свою точку
        return employee.location === locationId;
    }
    
    // Получение прав доступа
    getPermissions(role) {
        return GALLERY13_CONFIG.permissions[role] || [];
    }
    
    // Проверка наличия права
    hasPermission(employee, permission) {
        if (!employee || !employee.permissions) return false;
        return employee.permissions.includes(permission);
    }
    
    // Проверка нескольких прав
    hasAllPermissions(employee, permissions) {
        return permissions.every(perm => this.hasPermission(employee, perm));
    }
    
    hasAnyPermission(employee, permissions) {
        return permissions.some(perm => this.hasPermission(employee, perm));
    }
    
    // Создание сессии
    createSession(employee) {
        const session = {
            employee: employee,
            token: this.generateToken(),
            createdAt: Date.now(),
            expiresAt: Date.now() + AUTH_CONFIG.tokenExpiry
        };
        
        // Сохраняем сессию
        this.saveSession(session);
        
        // Устанавливаем текущего сотрудника
        window.currentEmployee = employee;
        
        // Сохраняем в localStorage
        localStorage.setItem('gallery13_employee', JSON.stringify(employee));
        localStorage.setItem('gallery13_session', JSON.stringify(session));
        
        return session;
    }
    
    // Генерация токена
    generateToken() {
        return 'g13_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Сохранение сессии
    saveSession(session) {
        // Здесь можно добавить сохранение на сервер
        console.log('Session created:', session);
    }
    
    // Выход из системы
    logout() {
        // Очищаем данные
        window.currentEmployee = null;
        localStorage.removeItem('gallery13_employee');
        localStorage.removeItem('gallery13_session');
        
        // Редирект на страницу входа
        window.location.href = 'index.html';
    }
    
    // Проверка валидности сессии
    validateSession() {
        const sessionStr = localStorage.getItem('gallery13_session');
        if (!sessionStr) return false;
        
        try {
            const session = JSON.parse(sessionStr);
            
            // Проверяем срок действия
            if (Date.now() > session.expiresAt) {
                this.logout();
                return false;
            }
            
            // Обновляем сотрудника
            window.currentEmployee = session.employee;
            return true;
        } catch (e) {
            console.error('Session validation error:', e);
            return false;
        }
    }
    
    // Управление попытками входа
    recordFailedAttempt(locationId) {
        if (!this.pinAttempts[locationId]) {
            this.pinAttempts[locationId] = 0;
        }
        
        this.pinAttempts[locationId]++;
        
        // Если превышено количество попыток - блокируем
        if (this.pinAttempts[locationId] >= AUTH_CONFIG.pinAttempts) {
            this.lockouts[locationId] = Date.now() + AUTH_CONFIG.lockoutTime;
            delete this.pinAttempts[locationId];
        }
        
        this.saveAttempts();
    }
    
    resetAttempts(locationId) {
        delete this.pinAttempts[locationId];
        delete this.lockouts[locationId];
        this.saveAttempts();
    }
    
    isLocked(locationId) {
        const lockoutTime = this.lockouts[locationId];
        return lockoutTime && Date.now() < lockoutTime;
    }
    
    cleanupLockouts() {
        const now = Date.now();
        for (const locationId in this.lockouts) {
            if (this.lockouts[locationId] < now) {
                delete this.lockouts[locationId];
            }
        }
        this.saveAttempts();
    }
    
    // Работа с localStorage
    saveAttempts() {
        const data = {
            attempts: this.pinAttempts,
            lockouts: this.lockouts
        };
        localStorage.setItem('gallery13_auth_attempts', JSON.stringify(data));
    }
    
    loadAttempts() {
        const dataStr = localStorage.getItem('gallery13_auth_attempts');
        if (dataStr) {
            try {
                const data = JSON.parse(dataStr);
                this.pinAttempts = data.attempts || {};
                this.lockouts = data.lockouts || {};
            } catch (e) {
                console.error('Error loading auth attempts:', e);
            }
        }
    }
    
    // Расширенная база сотрудников (имитация загрузки с сервера)
    getExtendedEmployeesDB() {
        const extended = [...EMPLOYEES_DB];
        
        // Добавляем тестовых сотрудников из localStorage
        const savedEmployees = localStorage.getItem('gallery13_custom_employees');
        if (savedEmployees) {
            try {
                const customEmployees = JSON.parse(savedEmployees);
                extended.push(...customEmployees);
            } catch (e) {
                console.error('Error loading custom employees:', e);
            }
        }
        
        return extended;
    }
    
    // Получение аватара по роли
    getAvatarForRole(role) {
        const avatars = {
            admin: '👨‍💼',
            assistant: '👩‍💼',
            manager: '👔',
            cashier: '💰',
            security: '👮‍♂️',
            consultant: '💁',
            webdev: '👨‍💻'
        };
        return avatars[role] || '👤';
    }
    
    // Получение информации о локации
    getLocationInfo(locationId) {
        return GALLERY13_CONFIG.locations.find(l => l.id === locationId);
    }
    
    // Получение информации о роли
    getRoleInfo(role) {
        return {
            name: GALLERY13_CONFIG.roles[role],
            permissions: GALLERY13_CONFIG.permissions[role] || []
        };
    }
    
    // Проверка возможности управления сотрудниками
    canManageEmployees(employee) {
        return this.hasPermission(employee, 'manage_employees');
    }
    
    // Проверка возможности просмотра жалоб
    canViewComplaints(employee) {
        return this.hasPermission(employee, 'complaints');
    }
    
    // Проверка возможности создания отчетов
    canCreateReports(employee) {
        return this.hasPermission(employee, 'report');
    }
    
    // Проверка возможности заказа хозчасти
    canOrderHousehold(employee) {
        return this.hasPermission(employee, 'household');
    }
    
    // Проверка доступа к чату
    canAccessChat(employee) {
        return this.hasPermission(employee, 'chat');
    }
}

// Вспомогательные функции для проверки прав на страницах
function checkPagePermissions() {
    if (!window.currentEmployee) return false;
    
    const page = window.location.pathname.split('/').pop();
    const auth = new AuthManager();
    
    switch(page) {
        case 'dashboard.html':
            // Дашборд доступен всем авторизованным
            return true;
            
        case 'report.html':
            return auth.canCreateReports(window.currentEmployee);
            
        case 'anonymous.html':
            return auth.canViewComplaints(window.currentEmployee);
            
        case 'household.html':
            return auth.canOrderHousehold(window.currentEmployee);
            
        case 'chat.html':
            return auth.canAccessChat(window.currentEmployee);
            
        case 'employees.html':
            return auth.canManageEmployees(window.currentEmployee);
            
        default:
            return true;
    }
}

// Функция для защиты страниц
function protectPage() {
    const auth = new AuthManager();
    
    // Проверяем сессию
    if (!auth.validateSession()) {
        window.location.href = 'index.html';
        return;
    }
    
    // Проверяем права на страницу
    if (!checkPagePermissions()) {
        // Редирект на дашборд если нет прав
        window.location.href = 'dashboard.html';
    }
}

// Функция для получения информации о текущем сотруднике
function getCurrentEmployeeInfo() {
    if (!window.currentEmployee) return null;
    
    const auth = new AuthManager();
    const locationInfo = auth.getLocationInfo(window.currentEmployee.location);
    const roleInfo = auth.getRoleInfo(window.currentEmployee.role);
    
    return {
        ...window.currentEmployee,
        locationName: locationInfo ? locationInfo.name : window.currentEmployee.location,
        roleName: roleInfo.name,
        permissions: roleInfo.permissions
    };
}

// Функция для обновления PIN-кода
async function updateEmployeePin(employeeId, newPin) {
    if (!/^\d{4}$/.test(newPin)) {
        throw new Error('PIN должен состоять из 4 цифр');
    }
    
    // Здесь будет API вызов
    console.log(`Updating PIN for employee ${employeeId} to ${newPin}`);
    
    // Для демо - обновляем в localStorage
    const employees = JSON.parse(localStorage.getItem('gallery13_custom_employees') || '[]');
    const index = employees.findIndex(e => e.id === employeeId);
    
    if (index !== -1) {
        employees[index].pin = newPin;
        localStorage.setItem('gallery13_custom_employees', JSON.stringify(employees));
    }
    
    return true;
}

// Инициализация аутентификации при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // На страницах кроме index.html проверяем авторизацию
    if (!window.location.pathname.includes('index.html')) {
        protectPage();
    }
});

// Глобальные экспорты
window.AuthManager = AuthManager;
window.authUtils = {
    checkPagePermissions,
    protectPage,
    getCurrentEmployeeInfo,
    updateEmployeePin
};

// Функция для использования в index.html
window.authenticateEmployee = function(locationId, pin) {
    try {
        const auth = new AuthManager();
        const session = auth.authenticate(locationId, pin);
        return session.employee;
    } catch (error) {
        console.error('Authentication error:', error);
        return null;
    }
};