document.addEventListener('DOMContentLoaded', async () => {
    const calendarGrid = document.getElementById('calendar');
    const currentMonthYear = document.getElementById('current-month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const filterToggle = document.querySelector('.filter-toggle');
    const filterSidebar = document.querySelector('.filter-sidebar');
    
    let currentDate = new Date();
    let currentFilter = 'all';
    let allEvents = [];
    let filteredEvents = [];
    
    const rssLoader = new RSSLoader();
    const designConfig = await loadDesignConfig();

    // Применяем дизайн из конфига
    applyDesign(designConfig);
    
    // Загружаем события
    await loadEvents();
    
    // Инициализируем календарь
    renderCalendar();
    
    // Обработчики событий
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            filterEvents();
            renderCalendar();
        });
    });
    
    filterToggle.addEventListener('click', () => {
        filterSidebar.classList.toggle('active');
    });
    
    // Функции
async function loadDesignConfig() {
    try {
        console.log('Загружаем конфиг из config/design-config.json...');
        const response = await fetch('config/design-config.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const config = await response.json();
        console.log('Конфиг успешно загружен:', config);
        return config;
    } catch (error) {
        console.error('Ошибка загрузки конфига:', error);
        return {};
    }
}
   function applyDesign(config) {
    console.log('Загружен конфиг:', config);
    
    // Применяем цвета
    document.documentElement.style.setProperty('--primary-color', config.colors?.primary);
    document.documentElement.style.setProperty('--secondary-color', config.colors?.secondary);
    document.documentElement.style.setProperty('--text-color', config.colors?.text);
    document.documentElement.style.setProperty('--button-bg', config.colors?.buttonBg);
    document.documentElement.style.setProperty('--button-text', config.colors?.buttonText);
    document.documentElement.style.setProperty('--cell-bg', config.colors?.cellBg);
    document.documentElement.style.setProperty('--cell-text', config.colors?.cellText);
    
    // Применяем шрифты
    document.documentElement.style.setProperty('--headings-font', config.fonts?.headings);
    document.documentElement.style.setProperty('--body-font', config.fonts?.body);
    document.documentElement.style.setProperty('--font-size-month', config.fonts?.sizeMonth);
    document.documentElement.style.setProperty('--font-size-filter', config.fonts?.sizeFilter);
    document.documentElement.style.setProperty('--font-size-event-title', config.fonts?.sizeEventTitle);
    document.documentElement.style.setProperty('--font-size-event-details', config.fonts?.sizeEventDetails);
    
    // Применяем layout
    document.documentElement.style.setProperty('--header-height', config.layout?.headerHeight);
    document.documentElement.style.setProperty('--filter-width', config.layout?.filterWidth);
    
    // Фоновое изображение
    const bgContainer = document.getElementById('background-container');
    console.log('Элемент background-container:', bgContainer);
    
    if (bgContainer && config.layout?.backgroundImage) {
        console.log('Устанавливаем фон:', config.layout.backgroundImage);
        bgContainer.style.backgroundImage = `url('${config.layout.backgroundImage}')`;
        
        // Проверяем, установился ли фон
        setTimeout(() => {
            console.log('Текущий фон элемента:', getComputedStyle(bgContainer).backgroundImage);
        }, 100);
    } else {
        console.error('Не удалось установить фон: контейнер или URL не найдены');
    }
    
    // Устанавливаем текущий месяц и год из конфига, если есть
    if (config.currentView?.month !== undefined && config.currentView?.year) {
        currentDate = new Date(config.currentView.year, config.currentView.month, 1);
    }
    
    // Устанавливаем активный фильтр
    if (config.currentView?.activeFilter) {
        currentFilter = config.currentView.activeFilter;
        const activeBtn = document.querySelector(`.filter-btn[data-filter="${currentFilter}"]`);
        if (activeBtn) {
            filterButtons.forEach(b => b.classList.remove('active'));
            activeBtn.classList.add('active');
        }
    }
           if (config.calendar) {
        const calendarGrid = document.getElementById('calendar');
        if (calendarGrid) {
            calendarGrid.style.gridTemplateColumns = `repeat(${config.calendar.gridColumns || 7}, ${config.calendar.cellWidth || '140px'})`;
            calendarGrid.style.gap = config.calendar.cellMargin || '10px';
            
            // Применяем размеры ячеек
            const dayCells = document.querySelectorAll('.calendar-day');
            dayCells.forEach(cell => {
                cell.style.width = config.calendar.cellWidth || '140px';
                cell.style.height = config.calendar.cellHeight || '120px';
            });
        }
    }
}
    
    async function loadEvents() {
        allEvents = await rssLoader.loadEvents();
        filterEvents();
    }
    
    function filterEvents() {
        filteredEvents = rssLoader.filterEvents(allEvents, currentFilter);
    }
    
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Обновляем заголовок
        const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
            "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
        currentMonthYear.textContent = `${monthNames[month]} ${year}`;
        
        // Очищаем сетку
        calendarGrid.innerHTML = '';
        
        // Получаем первый и последний день месяца
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        // Определяем день недели первого дня
        let firstDayIndex = firstDay.getDay();
        if (firstDayIndex === 0) firstDayIndex = 7; // Воскресенье как 7-й день
        
        // Создаем ячейки для дней
        for (let i = 1; i < firstDayIndex; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyCell);
        }
        
        // Создаем ячейки для дней месяца
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';
            
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            dayCell.appendChild(dayNumber);
            
            // Добавляем события для этого дня
            const currentDateStr = new Date(year, month, day).toDateString();
            const dayEvents = rssLoader.groupEventsByDate(filteredEvents)[currentDateStr] || [];
            
            if (dayEvents.length > 0) {
                const scrollContainer = document.createElement('div');
                scrollContainer.className = 'event-scroll-container';
                
                const scrollContent = document.createElement('div');
                scrollContent.className = 'event-scroll';
                
                dayEvents.forEach(event => {
                    const eventElement = document.createElement('div');
                    
                    const eventTitle = document.createElement('div');
                    eventTitle.className = 'event-title';
                    eventTitle.textContent = event.title;
                    
                    const eventDetails = document.createElement('div');
                    eventDetails.className = 'event-details';
                    eventDetails.textContent = `${event.organization}, ${event.time}, ${event.place}`;
                    
                    eventElement.appendChild(eventTitle);
                    eventElement.appendChild(eventDetails);
                    scrollContent.appendChild(eventElement);
                });
                
                scrollContainer.appendChild(scrollContent);
                dayCell.appendChild(scrollContainer);
                
               // Клик по ячейке ведет на страницу расписания
dayCell.addEventListener('click', () => {
    // Форматируем дату для передачи
    const formattedDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    // Передаем дату и события этого дня
    const dayEvents = rssLoader.groupEventsByDate(filteredEvents)[currentDateStr] || [];
    
    // Сохраняем данные для страницы расписания
    sessionStorage.setItem('selectedDate', formattedDate);
    sessionStorage.setItem('dayEvents', JSON.stringify(dayEvents));
    
    // Переходим на страницу расписания
    window.location.href = `schedule.html?date=${formattedDate}`;
});
            
            calendarGrid.appendChild(dayCell);
        }
    }
});
