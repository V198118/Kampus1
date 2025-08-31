class RSSLoader {
    constructor() {
        // Сюда вставить URL веб-приложения Google Apps Script
        this.rssFeedUrl = 'https://script.google.com/macros/s/.../exec';
        this.cache = {};
    }

    async loadEvents() {
        // Проверяем кэш
        const cacheKey = `${this.rssFeedUrl}`;
        if (this.cache[cacheKey] && (Date.now() - this.cache[cacheKey].timestamp < 5 * 60 * 1000)) {
            return this.cache[cacheKey].data;
        }

        try {
            const response = await fetch(this.rssFeedUrl);
            if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
            
            const data = await response.json();
            
            // Кэшируем результат
            this.cache[cacheKey] = {
                data: data,
                timestamp: Date.now()
            };
            
            return data;
        } catch (error) {
            console.error('Ошибка загрузки RSS:', error);
            // Возвращаем кэшированные данные, даже если они устарели, в случае ошибки
            return this.cache[cacheKey] ? this.cache[cacheKey].data : [];
        }
    }

    // Фильтрация событий по типу
    filterEvents(events, filterType) {
        switch(filterType) {
            case 'events':
                return events.filter(event => event.type === 'мероприятие');
            case 'classes':
                return events.filter(event => event.type === 'занятие');
            default:
                return events;
        }
    }

    // Группировка событий по дате
    groupEventsByDate(events) {
        const grouped = {};
        events.forEach(event => {
            const date = new Date(event.date).toDateString();
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(event);
        });
        return grouped;
    }
}