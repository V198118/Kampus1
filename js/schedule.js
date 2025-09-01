document.addEventListener('DOMContentLoaded', async () => {
    const scheduleContainer = document.getElementById('daily-events');
    const scheduleDate = document.getElementById('schedule-date');
    
    // Получаем дату из URL параметра или sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    let dateParam = urlParams.get('date');
    
    // Если параметр не передан, пробуем получить из sessionStorage
    if (!dateParam) {
        dateParam = sessionStorage.getItem('selectedDate');
    }
    
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    
    // Получаем события из sessionStorage
    let dayEvents = [];
    try {
        const eventsData = sessionStorage.getItem('dayEvents');
        if (eventsData) {
            dayEvents = JSON.parse(eventsData);
        }
    } catch (e) {
        console.error('Ошибка парсинга событий:', e);
    }
    
    // Форматируем дату для заголовка
    const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    scheduleDate.textContent = `Расписание на ${targetDate.toLocaleDateString('ru-RU', dateOptions)}`;
    
    const rssLoader = new RSSLoader();
    const designConfig = await loadDesignConfig();
    
    // Применяем дизайн из конфига
    applyDesign(designConfig);
    
    // Если события не были переданы, загружаем их
    if (dayEvents.length === 0) {
        await loadAndDisplayEvents(targetDate);
    } else {
        // Отображаем переданные события
        displayEvents(dayEvents);
    }
    function displayEvents(events) {
        if (events.length === 0) {
            scheduleContainer.innerHTML = '<p>На этот день мероприятий не запланировано.</p>';
            return;
        }
        
        scheduleContainer.innerHTML = '';
        events.forEach(event => {
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
