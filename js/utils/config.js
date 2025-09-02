// Утилиты для работы с конфигурацией
const ConfigUtils = {
    // Загрузка конфигурации
    async loadConfig() {
        try {
            const response = await fetch('config/design-config.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Ошибка загрузки конфига:', error);
            return this.getDefaultConfig();
        }
    },

    // Получение конфигурации по умолчанию
    getDefaultConfig() {
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
                backgroundImage: "https://v198118.github.io/Kampus1/assets/images/1.png",
                headerHeight: "80px",
                filterWidth: "250px"
            },
            currentView: {
                month: new Date().getMonth(),
                year: new Date().getFullYear(),
                activeFilter: "all"
            },
            texts: {
                allEvents: "Все события",
                events: "Мероприятия",
                classes: "Занятия",
                admin: "Админ-панель"
            }
        };
    },

    // Сохранение конфигурации
    saveConfig(config) {
        localStorage.setItem('designConfig', JSON.stringify(config));
    },

    // Загрузка сохраненной конфигурации
    loadSavedConfig() {
        const savedConfig = localStorage.getItem('designConfig');
        return savedConfig ? JSON.parse(savedConfig) : null;
    }
};
