document.addEventListener('DOMContentLoaded', async () => {
    const authSection = document.getElementById('auth-section');
    const adminPanel = document.getElementById('admin-panel');
    const loginBtn = document.getElementById('login-btn');
    const saveBtn = document.getElementById('save-design-btn');
    const resetBtn = document.getElementById('reset-design-btn');
    
    let designConfig = {};
    
    // Загружаем текущий конфиг
    await loadDesignConfig();
    
    // Обработчики событий
    loginBtn.addEventListener('click', authenticate);
    saveBtn.addEventListener('click', saveDesign);
    resetBtn.addEventListener('click', resetDesign);
    
    // Функции
    async function loadDesignConfig() {
        try {
            const response = await fetch('../config/design-config.json');
            designConfig = await response.json();
            populateForm(designConfig);
        } catch (error) {
            console.error('Ошибка загрузки конфига:', error);
        }
    }
    
    function populateForm(config) {
        // Заполняем поля формы значениями из конфига
        document.getElementById('color-primary').value = config.colors?.primary || '#00539f';
        document.getElementById('background-image-url').value = config.layout?.backgroundImage || '';
        document.getElementById('font-headings').value = config.fonts?.headings || "'Open Sans', sans-serif";
        document.getElementById('font-size-month').value = parseInt(config.fonts?.sizeMonth || '50');
        // Добавьте заполнение других полей
    }
    
    function authenticate() {
        const password = document.getElementById('admin-password').value;
        // Сюда вставить проверку пароля (может быть хардкод или вызов API)
        if (password === 'admin123') { // Замените на надежный пароль
            authSection.style.display = 'none';
            adminPanel.style.display = 'block';
        } else {
            alert('Неверный пароль');
        }
    }
    
    async function saveDesign() {
        // Собираем значения из формы
        const updatedConfig = {
            colors: {
                primary: document.getElementById('color-primary').value,
                // Собрать остальные значения цветов
            },
            fonts: {
                headings: document.getElementById('font-headings').value,
                sizeMonth: `${document.getElementById('font-size-month').value}px`,
                // Собрать остальные значения шрифтов
            },
            layout: {
                backgroundImage: document.getElementById('background-image-url').value,
                // Собрать остальные значения layout
            }
            // Добавьте другие секции конфига
        };
        
        try {
            // В реальной реализации здесь должен быть вызов к API для сохранения файла
            // Для демо сохраним в localStorage
            localStorage.setItem('designConfig', JSON.stringify(updatedConfig));
            alert('Дизайн сохранен!');
            
            // Обновляем превью
            document.getElementById('preview-frame').src = 
                document.getElementById('preview-frame').src;
                
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Ошибка при сохранении дизайна');
        }
    }
    
    function resetDesign() {
        if (confirm('Вернуть настройки по умолчанию?')) {
            // Сброс к значениям по умолчанию
            const defaultConfig = {
                colors: {
                    primary: "#00539f",
                    secondary: "#ff9900",
                    background: "#f4f4f4",
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
                    backgroundImage: "assets/images/фон расписания.jpg",
                    headerHeight: "80px",
                    filterWidth: "250px"
                }
            };
            
            populateForm(defaultConfig);
            // Здесь также нужно сохранить сброшенный конфиг
        }
    }
});