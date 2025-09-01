document.addEventListener('DOMContentLoaded', async () => {
    const authSection = document.getElementById('auth-section');
    const adminPanel = document.getElementById('admin-panel');
    const loginBtn = document.getElementById('login-btn');
    const saveBtn = document.getElementById('save-design-btn');
    const resetBtn = document.getElementById('reset-design-btn');
    
    let designConfig = {};
    
    // Загружаем текущий конфиг
    await loadDesignConfig();
    populateForm(designConfig);
    
    // Обработчики событий
    loginBtn.addEventListener('click', authenticate);
    saveBtn.addEventListener('click', saveDesign);
    resetBtn.addEventListener('click', resetDesign);
    
    // Функции
    async function loadDesignConfig() {
        try {
            const response = await fetch('../config/design-config.json');
            designConfig = await response.json();
            console.log('Конфиг загружен:', designConfig);
        } catch (error) {
            console.error('Ошибка загрузки конфига:', error);
            // Загрузка конфига по умолчанию
            designConfig = getDefaultConfig();
        }
    }
    
    function getDefaultConfig() {
        return {
            colors: {
                primary: "#00539f",
                secondary: "#ff9900",
                text: "#333333",
                buttonBg: "#ffffff",
                buttonText: "#00539f",
                cellBg: "rgba(255, 255, 255, 0.8)",
                cellText: "#333333"
            },
            fonts: {
                headings: "'Open Sans', sans-serif",
                body: "'Roboto', sans-serif",
                sizeMonth: "50px",
                sizeFilter: "16px",
                sizeEventTitle: "14px",
                sizeEventDetails: "12px"
            },
            layout: {
                backgroundImage: "https://v198118.github.io/Kampus1/assets/images/background.png",
                headerHeight: "80px",
                filterWidth: "250px"
            },
            calendar: {
                cellWidth: "140px",
                cellHeight: "120px",
                cellMargin: "10px",
                gridColumns: "7"
            },
            currentView: {
                month: new Date().getMonth(),
                year: new Date().getFullYear(),
                activeFilter: "all"
            }
        };
    }
    
    function populateForm(config) {
        // Заполняем поля формы значениями из конфига
        document.getElementById('color-primary').value = config.colors?.primary || '#00539f';
        document.getElementById('background-image-url').value = config.layout?.backgroundImage || '';
        document.getElementById('font-headings').value = config.fonts?.headings || "'Open Sans', sans-serif";
        document.getElementById('font-size-month').value = parseInt(config.fonts?.sizeMonth || '50');
        
        // Добавляем поля для календаря
        document.getElementById('cell-width').value = parseInt(config.calendar?.cellWidth || '140');
        document.getElementById('cell-height').value = parseInt(config.calendar?.cellHeight || '120');
        document.getElementById('cell-margin').value = parseInt(config.calendar?.cellMargin || '10');
        document.getElementById('grid-columns').value = parseInt(config.calendar?.gridColumns || '7');
    }
    
    function authenticate() {
        const password = document.getElementById('admin-password').value;
        // Простая проверка пароля (в реальном проекте нужно использовать более безопасный метод)
        if (password === 'admin123') {
            authSection.style.display = 'none';
            adminPanel.style.display = 'block';
        } else {
            alert('Неверный пароль');
        }
    }
    
    async function saveDesign() {
        // Собираем значения из формы
        designConfig.colors.primary = document.getElementById('color-primary').value;
        designConfig.layout.backgroundImage = document.getElementById('background-image-url').value;
        designConfig.fonts.headings = document.getElementById('font-headings').value;
        designConfig.fonts.sizeMonth = `${document.getElementById('font-size-month').value}px`;
        
        // Сохраняем настройки календаря
        designConfig.calendar = {
            cellWidth: `${document.getElementById('cell-width').value}px`,
            cellHeight: `${document.getElementById('cell-height').value}px`,
            cellMargin: `${document.getElementById('cell-margin').value}px`,
            gridColumns: document.getElementById('grid-columns').value
        };
        
        try {
            // В реальном проекте здесь должен быть вызов к API для сохранения файла
            // Для демо сохраним в localStorage
            localStorage.setItem('designConfig', JSON.stringify(designConfig));
            alert('Настройки дизайна сохранены!');
            
            // Обновляем превью
            document.getElementById('preview-frame').src = 
                document.getElementById('preview-frame').src;
                
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Ошибка при сохранении настроек');
        }
    }
    
    function resetDesign() {
        if (confirm('Вернуть настройки по умолчанию?')) {
            designConfig = getDefaultConfig();
            populateForm(designConfig);
            localStorage.setItem('designConfig', JSON.stringify(designConfig));
            alert('Настройки сброшены к значениям по умолчанию!');
        }
    }
});
