document.addEventListener('DOMContentLoaded', async () => {
    const scheduleContainer = document.getElementById('daily-events');
    const scheduleDate = document.getElementById('schedule-date');
    
    // Получаем дату из URL параметра
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get('date');
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    
    // Форматируем дату для заголовка
    const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    scheduleDate.textContent = `Расписание на ${targetDate.toLocaleDateString('ru-RU', dateOptions)}`;
    
    const rssLoader = new RSSLoader();
    const designConfig = await loadDesignConfig();
    
    // Применяем дизайн из конфига
    applyDesign(designConfig);
    
    // Загружаем и отображаем события
    await loadAndDisplayEvents();
    
    async function loadDesignConfig() {
        try {
            const response = await fetch('config/design-config.json');
            return await response.json();
        } catch (error) {
            console.error('Ошибка загрузки конфига:', error);
            return {};
        }
    }
    
    function applyDesign(config) {
        // Применяем цвета
        document.documentElement.style.setProperty('--primary-color', config.colors?.primary);
        document.documentElement.style.setProperty('--secondary-color', config.colors?.secondary);
        document.documentElement.style.setProperty('--bg-color', config.colors?.background);
        document.documentElement.style.setProperty('--text-color', config.colors?.text);
        document.documentElement.style.setProperty('--button-bg', config.colors?.buttonBg);
        document.documentElement.style.setProperty('--button-text', config.colors?.buttonText);
        document.documentElement.style.setProperty('--cell-bg', config.colors?.cellBg);
        document.documentElement.style.setProperty('--cell-text', config.colors?.cellText);
        
        // Применяем шрифты
        document.documentElement.style.setProperty('--headings-font', config.fonts?.headings);
        document.documentElement.style.setProperty('--body-font', config.fonts?.body);
        
        // Фоновое изображение
        if (config.layout?.backgroundImage) {
            document.documentElement.style.setProperty('--bg-image', `url(${config.layout.backgroundImage})`);
        }
    }
    
    async function loadAndDisplayEvents() {
        const allEvents = await rssLoader.loadEvents();
        const targetDateStr = targetDate.toDateString();
        
        // Фильтруем события по выбранной дате
        const dailyEvents = allEvents.filter(event => {
            const eventDate = new Date(event.date).toDateString();
            return eventDate === targetDateStr;
        });
        
        // Отображаем события
        if (dailyEvents.length === 0) {
            scheduleContainer.innerHTML = '<p>На этот день мероприятий не запланировано.</p>';
            return;
        }
        
        scheduleContainer.innerHTML = '';
        dailyEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'schedule-event';
            
            eventElement.innerHTML = `
                <h3>${event.title}</h3>
                <p><strong>Организация:</strong> ${event.organization}</p>
                <p><strong>Время:</strong> ${event.time}</p>
                <p><strong>Место:</strong> ${event.place}</p>
                <p>${event.description || ''}</p>
            `;
            
            scheduleContainer.appendChild(eventElement);
        });
    }
});