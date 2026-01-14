/**
 * Gallery 13 Work Space - Интеграция с Telegram WebApp
 * Обработка взаимодействия с Telegram API
 */

class TelegramIntegration {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.isInitialized = false;
        this.init();
    }
    
    init() {
        if (!this.tg) {
            console.warn('Telegram WebApp не обнаружен. Работаем в standalone режиме.');
            this.setupStandaloneMode();
            return;
        }
        
        try {
            // Инициализация Telegram WebApp
            this.tg.expand();
            this.tg.enableClosingConfirmation();
            this.tg.disableVerticalSwipes(); // Отключаем свайпы для лучшего UX
            
            // Устанавливаем тему
            this.applyTheme();
            
            // Настраиваем кнопку назад
            this.setupBackButton();
            
            // Настраиваем основную кнопку
            this.setupMainButton();
            
            // Обработчики событий
            this.setupEventHandlers();
            
            // Отправляем данные об инициализации
            this.sendInitData();
            
            this.isInitialized = true;
            console.log('Telegram WebApp успешно инициализирован');
            
        } catch (error) {
            console.error('Ошибка инициализации Telegram WebApp:', error);
            this.setupStandaloneMode();
        }
    }
    
    // Применение темы из Telegram
    applyTheme() {
        const colorScheme = this.tg.colorScheme;
        const themeParams = this.tg.themeParams;
        
        // Устанавливаем цвета из Telegram
        if (themeParams) {
            document.documentElement.style.setProperty('--tg-bg-color', themeParams.bg_color || '#0f172a');
            document.documentElement.style.setProperty('--tg-text-color', themeParams.text_color || '#f8fafc');
            document.documentElement.style.setProperty('--tg-hint-color', themeParams.hint_color || '#94a3b8');
            document.documentElement.style.setProperty('--tg-link-color', themeParams.link_color || '#8b5cf6');
            document.documentElement.style.setProperty('--tg-button-color', themeParams.button_color || '#8b5cf6');
            document.documentElement.style.setProperty('--tg-button-text-color', themeParams.button_text_color || '#ffffff');
        }
        
        // Устанавливаем цвет фона
        this.tg.setHeaderColor('#0f172a');
        this.tg.setBackgroundColor('#0f172a');
    }
    
    // Настройка кнопки назад
    setupBackButton() {
        this.tg.BackButton.onClick(() => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                this.close();
            }
        });
        
        // Показываем кнопку назад на всех страницах кроме главной
        const isMainPage = window.location.pathname.includes('index.html') || 
                          window.location.pathname === '/';
        
        if (!isMainPage) {
            this.tg.BackButton.show();
        }
    }
    
    // Настройка основной кнопки
    setupMainButton() {
        this.tg.MainButton.setText('Gallery 13');
        this.tg.MainButton.setParams({
            color: '#8b5cf6',
            text_color: '#ffffff'
        });
        
        // Скрываем по умолчанию
        this.tg.MainButton.hide();
    }
    
    // Обработчики событий Telegram
    setupEventHandlers() {
        // Изменение темы
        this.tg.onEvent('themeChanged', () => {
            this.applyTheme();
        });
        
        // Изменение размера окна
        this.tg.onEvent('viewportChanged', (event) => {
            this.handleViewportChange(event);
        });
        
        // Закрытие приложения
        this.tg.onEvent('close', () => {
            this.handleClose();
        });
    }
    
    // Обработка изменения размера окна
    handleViewportChange(event) {
        const { height, width, is_expanded } = event;
        
        // Адаптируем контент под размер окна
        document.documentElement.style.setProperty('--tg-viewport-height', `${height}px`);
        document.documentElement.style.setProperty('--tg-viewport-width', `${width}px`);
        
        // Уведомляем о изменении размера
        window.dispatchEvent(new CustomEvent('tgViewportChange', { detail: event }));
    }
    
    // Обработка закрытия приложения
    handleClose() {
        // Сохраняем состояние перед закрытием
        this.saveState();
        
        // Уведомляем о закрытии
        window.dispatchEvent(new Event('tgAppClose'));
    }
    
    // Сохранение состояния
    saveState() {
        // Сохраняем текущую страницу
        localStorage.setItem('tg_last_page', window.location.pathname);
        
        // Сохраняем данные формы если есть
        const forms = document.querySelectorAll('form');
        forms.forEach((form, index) => {
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            localStorage.setItem(`tg_form_${index}`, JSON.stringify(data));
        });
    }
    
    // Отправка данных инициализации
    sendInitData() {
        const initData = this.tg.initData;
        const initDataUnsafe = this.tg.initDataUnsafe;
        
        // Логируем данные для отладки
        console.log('Telegram initData:', initData);
        console.log('Telegram initDataUnsafe:', initDataUnsafe);
        
        // Можно отправить на сервер для проверки подлинности
        if (initData) {
            this.sendToBackend('/api/telegram/init', { initData });
        }
    }
    
    // Отправка данных боту
    sendData(data) {
        if (!this.tg) {
            console.log('Standalone mode - sending data:', data);
            return false;
        }
        
        try {
            this.tg.sendData(JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error sending data to Telegram:', error);
            return false;
        }
    }
    
    // Отправка данных на сервер
    async sendToBackend(endpoint, data) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error sending to backend:', error);
            return null;
        }
    }
    
    // Закрытие приложения
    close() {
        if (this.tg) {
            this.tg.close();
        }
    }
    
    // Показ всплывающего окна
    showPopup(options) {
        if (!this.tg) {
            // Fallback для standalone режима
            if (options.message) {
                alert(options.message);
            }
            return;
        }
        
        try {
            this.tg.showPopup(options);
        } catch (error) {
            console.error('Error showing popup:', error);
            alert(options.message || 'Произошла ошибка');
        }
    }
    
    // Показ диалога подтверждения
    showConfirm(message, callback) {
        if (!this.tg) {
            const result = confirm(message);
            callback(result);
            return;
        }
        
        this.tg.showConfirm(message, callback);
    }
    
    // Показ диалога с кнопками
    showAlert(message, title = 'Gallery 13') {
        if (!this.tg) {
            alert(message);
            return;
        }
        
        this.tg.showAlert(title, message);
    }
    
    // Запрос контакта
    requestContact(callback) {
        if (!this.tg) {
            callback(null, 'Функция недоступна в standalone режиме');
            return;
        }
        
        this.tg.requestContact(callback);
    }
    
    // Запрос локации
    requestLocation(callback) {
        if (!this.tg) {
            callback(null, 'Функция недоступна в standalone режиме');
            return;
        }
        
        this.tg.requestLocation(callback);
    }
    
    // Открытие ссылки
    openLink(url, options = {}) {
        if (!this.tg) {
            window.open(url, '_blank');
            return;
        }
        
        this.tg.openLink(url, options);
    }
    
    // Показ сканера QR кода
    showScanQrPopup(callback) {
        if (!this.tg || !this.tg.showScanQrPopup) {
            alert('Сканирование QR кодов недоступно');
            return;
        }
        
        this.tg.showScanQrPopup({ text: 'Отсканируйте QR код' }, callback);
    }
    
    // Запрос прав доступа
    requestWriteAccess(callback) {
        if (!this.tg) {
            callback(true); // В standalone режиме всегда true
            return;
        }
        
        this.tg.requestWriteAccess(callback);
    }
    
    // Управление основной кнопкой
    showMainButton(text, callback) {
        if (!this.tg) {
            // В standalone режиме создаем свою кнопку
            this.createStandaloneMainButton(text, callback);
            return;
        }
        
        if (text) {
            this.tg.MainButton.setText(text);
        }
        
        this.tg.MainButton.onClick(callback);
        this.tg.MainButton.show();
    }
    
    hideMainButton() {
        if (!this.tg) {
            this.removeStandaloneMainButton();
            return;
        }
        
        this.tg.MainButton.hide();
        this.tg.MainButton.offClick();
    }
    
    updateMainButton(params) {
        if (!this.tg) {
            this.updateStandaloneMainButton(params);
            return;
        }
        
        if (params.text) {
            this.tg.MainButton.setText(params.text);
        }
        
        if (params.color || params.text_color) {
            this.tg.MainButton.setParams({
                color: params.color,
                text_color: params.text_color
            });
        }
        
        if (params.progress) {
            this.tg.MainButton.showProgress(params.progress);
        } else {
            this.tg.MainButton.hideProgress();
        }
        
        if (params.disabled !== undefined) {
            if (params.disabled) {
                this.tg.MainButton.disable();
            } else {
                this.tg.MainButton.enable();
            }
        }
    }
    
    // Standalone режим
    setupStandaloneMode() {
        console.log('Setting up standalone mode');
        
        // Добавляем стили для standalone режима
        this.addStandaloneStyles();
        
        // Создаем шапку для standalone режима
        this.createStandaloneHeader();
        
        // Инициализируем переменные для совместимости
        this.tg = {
            initData: '',
            initDataUnsafe: {},
            colorScheme: 'dark',
            themeParams: {},
            platform: 'unknown',
            version: '7.0',
            viewportHeight: window.innerHeight,
            viewportWidth: window.innerWidth,
            isExpanded: true,
            headerColor: '#0f172a',
            backgroundColor: '#0f172a'
        };
    }
    
    addStandaloneStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .standalone-header {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 60px;
                background: var(--primary-purple);
                color: white;
                display: flex;
                align-items: center;
                padding: 0 20px;
                z-index: 1000;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            }
            
            .standalone-title {
                flex: 1;
                font-weight: 600;
                font-size: 18px;
            }
            
            .standalone-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 8px;
            }
            
            body {
                padding-top: 60px;
            }
            
            .standalone-main-button {
                position: fixed;
                bottom: 20px;
                left: 20px;
                right: 20px;
                background: var(--primary-purple);
                color: white;
                border: none;
                border-radius: 12px;
                padding: 16px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                z-index: 1000;
                box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
                transition: all 0.3s ease;
            }
            
            .standalone-main-button:hover {
                background: var(--primary-dark);
                transform: translateY(-2px);
            }
            
            .standalone-main-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(style);
    }
    
    createStandaloneHeader() {
        const header = document.createElement('div');
        header.className = 'standalone-header';
        header.innerHTML = `
            <div class="standalone-title">Gallery 13 Work Space</div>
            <button class="standalone-close" onclick="window.close()">×</button>
        `;
        document.body.prepend(header);
    }
    
    createStandaloneMainButton(text, callback) {
        this.removeStandaloneMainButton();
        
        const button = document.createElement('button');
        button.className = 'standalone-main-button';
        button.textContent = text || 'Gallery 13';
        button.onclick = callback;
        
        document.body.appendChild(button);
        this.standaloneMainButton = button;
    }
    
    removeStandaloneMainButton() {
        if (this.standaloneMainButton && this.standaloneMainButton.parentNode) {
            this.standaloneMainButton.parentNode.removeChild(this.standaloneMainButton);
            this.standaloneMainButton = null;
        }
    }
    
    updateStandaloneMainButton(params) {
        if (!this.standaloneMainButton) return;
        
        if (params.text) {
            this.standaloneMainButton.textContent = params.text;
        }
        
        if (params.color) {
            this.standaloneMainButton.style.background = params.color;
        }
        
        if (params.disabled !== undefined) {
            this.standaloneMainButton.disabled = params.disabled;
        }
    }
    
    // Вспомогательные методы
    getUserInfo() {
        if (!this.tg || !this.tg.initDataUnsafe.user) {
            return null;
        }
        
        return {
            id: this.tg.initDataUnsafe.user.id,
            firstName: this.tg.initDataUnsafe.user.first_name,
            lastName: this.tg.initDataUnsafe.user.last_name,
            username: this.tg.initDataUnsafe.user.username,
            languageCode: this.tg.initDataUnsafe.user.language_code,
            isPremium: this.tg.initDataUnsafe.user.is_premium || false
        };
    }
    
    getChatInfo() {
        if (!this.tg || !this.tg.initDataUnsafe.chat) {
            return null;
        }
        
        return {
            id: this.tg.initDataUnsafe.chat.id,
            type: this.tg.initDataUnsafe.chat.type,
            title: this.tg.initDataUnsafe.chat.title,
            username: this.tg.initDataUnsafe.chat.username
        };
    }
    
    isTelegramApp() {
        return !!window.Telegram?.WebApp;
    }
    
    // Получение данных для отправки на сервер
    getWebAppData() {
        if (!this.tg) return null;
        
        return {
            initData: this.tg.initData,
            initDataUnsafe: this.tg.initDataUnsafe,
            version: this.tg.version,
            platform: this.tg.platform,
            colorScheme: this.tg.colorScheme,
            themeParams: this.tg.themeParams,
            viewportHeight: this.tg.viewportHeight,
            viewportWidth: this.tg.viewportWidth,
            isExpanded: this.tg.isExpanded
        };
    }
}

// Инициализация при загрузке страницы
let telegramApp;

document.addEventListener('DOMContentLoaded', () => {
    telegramApp = new TelegramIntegration();
    
    // Добавляем глобальную переменную для доступа
    window.telegramApp = telegramApp;
    
    // Отправляем событие о готовности
    window.dispatchEvent(new Event('tgAppReady'));
});

// Глобальные хелперы для удобства использования
window.TelegramUtils = {
    // Отправка отчета
    sendReport: function(reportData) {
        if (!telegramApp) return false;
        
        const data = {
            type: 'report',
            data: reportData,
            timestamp: new Date().toISOString(),
            employee: window.currentEmployee
        };
        
        return telegramApp.sendData(data);
    },
    
    // Отправка заказа хозчасти
    sendOrder: function(orderData) {
        if (!telegramApp) return false;
        
        const data = {
            type: 'order',
            data: orderData,
            timestamp: new Date().toISOString(),
            employee: window.currentEmployee
        };
        
        return telegramApp.sendData(data);
    },
    
    // Отправка анонимной жалобы
    sendComplaint: function(complaintData) {
        if (!telegramApp) return false;
        
        const data = {
            type: 'complaint',
            data: complaintData,
            timestamp: new Date().toISOString(),
            anonymous: true
        };
        
        return telegramApp.sendData(data);
    },
    
    // Отправка сообщения в чат
    sendChatMessage: function(messageData) {
        if (!telegramApp) return false;
        
        const data = {
            type: 'chat_message',
            data: messageData,
            timestamp: new Date().toISOString(),
            employee: window.currentEmployee
        };
        
        return telegramApp.sendData(data);
    },
    
    // Управление сотрудниками
    sendEmployeeAction: function(action, employeeData) {
        if (!telegramApp) return false;
        
        const data = {
            type: 'employee_action',
            action: action,
            data: employeeData,
            timestamp: new Date().toISOString(),
            admin: window.currentEmployee
        };
        
        return telegramApp.sendData(data);
    },
    
    // Показ уведомления через Telegram
    showTelegramNotification: function(message, type = 'info') {
        if (!telegramApp) {
            alert(message);
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