// Утилиты для работы с ячейками календаря
const CellUtils = {
    // Инициализация ячеек календаря
    initializeCalendarCells(year, month, existingCells = []) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const cells = [];
        
        // Создаем специальные ячейки (месяц и меню)
        const monthCell = existingCells.find(cell => cell.id === 'month') || {
            id: 'month',
            day: 0,
            x: 40,
            y: 5,
            width: 200,
            height: 60,
            text: '',
            image: '',
            eventType: 'month',
            textStyle: {
                fontSize: '50px',
                fontFamily: 'Arial',
                color: '#000000',
                zIndex: 10
            },
            isStatic: true
        };
        
        const menuCell = existingCells.find(cell => cell.id === 'menu') || {
            id: 'menu',
            day: 0,
            x: 5,
            y: 5,
            width: 100,
            height: 40,
            text: 'Меню',
            image: '',
            eventType: 'menu',
            textStyle: {
                fontSize: '16px',
                fontFamily: 'Arial',
                color: '#000000',
                zIndex: 10
            },
            isStatic: true,
            isExpanded: false
        };
        
        cells.push(monthCell, menuCell);
        
        // Создаем ячейки для дней месяца
        for (let day = 1; day <= daysInMonth; day++) {
            const existingCell = existingCells.find(cell => cell.day === day && cell.id !== 'month' && cell.id !== 'menu');
            
            if (existingCell) {
                cells.push(existingCell);
            } else {
                const eventTypes = ['event', 'class', 'event', 'class', 'event'];
                const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                
                cells.push({
                    id: `day-${day}`,
                    day: day,
                    x: Math.random() * 70,
                    y: Math.random() * 70 + 10, // Учитываем место для специальных ячеек
                    width: 140,
                    height: 120,
                    text: '',
                    image: '',
                    eventType: randomEventType,
                    textStyle: {
                        fontSize: '14px',
                        fontFamily: 'Arial',
                        color: '#000000',
                        zIndex: 10
                    }
                });
            }
        }
        
        return cells;
    },

    // Обновление текста ячейки месяца
    updateMonthCell(cells, monthName, year) {
        const monthCell = cells.find(cell => cell.id === 'month');
        if (monthCell) {
            monthCell.text = `${monthName} ${year}`;
        }
        return cells;
    },

    // Сохранение ячеек
    saveCells(cells) {
        localStorage.setItem('calendarCells', JSON.stringify(cells));
    },

    // Загрузка ячеек
    loadCells() {
        const savedCells = localStorage.getItem('calendarCells');
        return savedCells ? JSON.parse(savedCells) : null;
    }
};