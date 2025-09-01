const { createApp, ref, reactive, onMounted, computed, nextTick } = Vue;

const App = {
    setup() {
        // Состояние приложения
        const currentView = ref('calendar');
        const currentDate = reactive({
            year: new Date().getFullYear(),
            month: new Date().getMonth()
        });
        const designConfig = reactive({
            layout: {
                backgroundImage: ""
            }
        });
        const calendarCells = ref([]);
        const isAdmin = ref(false);
        const adminPassword = ref('');
        
        // Загрузка конфигурации
        const loadConfig = async () => {
            try {
                const response = await fetch('config/design-config.json');
                const config = await response.json();
                Object.assign(designConfig, config);
                
                // Загрузка сохраненных ячеек
                const savedCells = localStorage.getItem('calendarCells');
                if (savedCells) {
                    calendarCells.value = JSON.parse(savedCells);
                } else {
                    // Инициализация ячеек по умолчанию
                    initializeCalendarCells();
                }
            } catch (error) {
                console.error('Ошибка загрузки конфига:', error);
                initializeCalendarCells();
            }
        };
        
        // Инициализация ячеек календаря
        const initializeCalendarCells = () => {
            const daysInMonth = new Date(currentDate.year, currentDate.month + 1, 0).getDate();
            calendarCells.value = [];
            
            for (let day = 1; day <= daysInMonth; day++) {
                calendarCells.value.push({
                    id: day,
                    day: day,
                    x: Math.random() * 70,
                    y: Math.random() * 70,
                    width: 140,
                    height: 120,
                    text: '',
                    image: '',
                    textStyle: {
                        fontSize: '14px',
                        fontFamily: 'Arial',
                        color: '#000000',
                        zIndex: 10
                    }
                });
            }
        };
        
        // Переключение месяца
        const changeMonth = (direction) => {
            if (direction === 'prev') {
                currentDate.month--;
                if (currentDate.month < 0) {
                    currentDate.month = 11;
                    currentDate.year--;
                }
            } else {
                currentDate.month++;
                if (currentDate.month > 11) {
                    currentDate.month = 0;
                    currentDate.year++;
                }
            }
            initializeCalendarCells();
        };
        
        // Переход к расписанию
        const goToSchedule = (day) => {
            const formattedDate = `${currentDate.year}-${(currentDate.month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            sessionStorage.setItem('selectedDate', formattedDate);
            window.location.href = `schedule.html?date=${formattedDate}`;
        };
        
        // Аутентификация администратора
        const authenticateAdmin = () => {
            if (adminPassword.value === 'admin123') {
                isAdmin.value = true;
                currentView.value = 'admin';
            } else {
                alert('Неверный пароль');
            }
        };
        
        // Сохранение дизайна
        const saveDesign = () => {
            localStorage.setItem('calendarCells', JSON.stringify(calendarCells.value));
            localStorage.setItem('designConfig', JSON.stringify(designConfig));
            alert('Дизайн сохранен!');
        };
        
        // Инициализация при загрузке
        onMounted(() => {
            loadConfig();
        });
        
        // Вычисляемые свойства
        const monthName = computed(() => {
            const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
                "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
            return months[currentDate.month];
        });
        
        const backgroundStyle = computed(() => {
            const bgImage = designConfig.layout?.backgroundImage || '';
            return {
                backgroundImage: bgImage ? `url('${bgImage}')` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            };
        });
        
        return {
            currentView,
            currentDate,
            designConfig,
            calendarCells,
            isAdmin,
            adminPassword,
            monthName,
            backgroundStyle,
            changeMonth,
            goToSchedule,
            authenticateAdmin,
            saveDesign
        };
    },
    template: `
        <div id="background-container" :style="backgroundStyle"></div>
        
        <div v-if="currentView === 'calendar'">
            <header>
                <div class="month-navigation">
                    <button @click="changeMonth('prev')">&lt;</button>
                    <h1>{{ monthName }} {{ currentDate.year }}</h1>
                    <button @click="changeMonth('next')">&gt;</button>
                </div>
            </header>

            <aside class="filter-sidebar">
                <div class="filter-toggle">
                    <span>☰</span>
                </div>
                <nav class="filter-menu">
                    <button class="filter-btn active">Все события</button>
                    <button class="filter-btn">Мероприятия</button>
                    <button class="filter-btn">Занятия</button>
                    <button @click="currentView = 'adminAuth'" class="filter-btn">Админ-панель</button>
                </nav>
            </aside>

            <main class="calendar-container">
                <div 
                    v-for="cell in calendarCells" 
                    :key="cell.id"
                    class="calendar-cell" 
                    :style="{ 
                        left: cell.x + '%', 
                        top: cell.y + '%',
                        width: cell.width + 'px',
                        height: cell.height + 'px'
                    }"
                    @click="goToSchedule(cell.day)"
                >
                    <img v-if="cell.image" :src="cell.image" class="cell-image" />
                    <div v-if="cell.text" class="cell-text" :style="cell.textStyle">{{ cell.text }}</div>
                    
                    <div class="event-scroll-container">
                        <div class="event-scroll">
                            <div class="event-title">Пример события</div>
                            <div class="event-details">Организация, время, место</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
        
        <div v-else-if="currentView === 'adminAuth'" class="admin-auth">
            <h2>Вход в админ-панель</h2>
            <input type="password" v-model="adminPassword" placeholder="Введите пароль">
            <button @click="authenticateAdmin">Войти</button>
            <button @click="currentView = 'calendar'">Назад</button>
        </div>
        
        <div v-else-if="currentView === 'admin'" class="admin-panel">
            <h2>Редактирование дизайна</h2>
            
            <div class="admin-controls">
                <div class="control-group">
                    <h3>Фоновое изображение</h3>
                    <input type="text" v-model="designConfig.layout.backgroundImage" placeholder="URL фонового изображения">
                    <p class="help-text">Полный URL, например: https://v198118.github.io/Kampus1/assets/images/1.png</p>
                </div>
                
                <div class="control-group">
                    <h3>Редактирование ячеек</h3>
                    <div v-for="(cell, index) in calendarCells" :key="cell.id" class="cell-editor">
                        <h4>Ячейка {{ cell.day }}</h4>
                        <label>
                            Текст: 
                            <input type="text" v-model="cell.text">
                        </label>
                        <label>
                            Изображение: 
                            <input type="text" v-model="cell.image" placeholder="URL изображения">
                        </label>
                        <label>
                            Размер шрифта: 
                            <input type="text" v-model="cell.textStyle.fontSize">
                        </label>
                        <label>
                            Цвет текста: 
                            <input type="color" v-model="cell.textStyle.color">
                        </label>
                        <label>
                            Ширина: 
                            <input type="number" v-model.number="cell.width">
                        </label>
                        <label>
                            Высота: 
                            <input type="number" v-model.number="cell.height">
                        </label>
                        <label>
                            Позиция X (%): 
                            <input type="number" v-model.number="cell.x">
                        </label>
                        <label>
                            Позиция Y (%): 
                            <input type="number" v-model.number="cell.y">
                        </label>
                    </div>
                </div>
            </div>
            
            <div class="admin-preview">
                <h3>Предпросмотр</h3>
                <div class="preview-container">
                    <div 
                        v-for="cell in calendarCells" 
                        :key="cell.id"
                        class="preview-cell" 
                        :style="{ 
                            left: cell.x + '%', 
                            top: cell.y + '%',
                            width: cell.width + 'px',
                            height: cell.height + 'px'
                        }"
                    >
                        <img v-if="cell.image" :src="cell.image" class="cell-image" />
                        <div v-if="cell.text" class="cell-text" :style="cell.textStyle">{{ cell.text }}</div>
                    </div>
                </div>
            </div>
            
            <div class="admin-actions">
                <button @click="saveDesign" class="btn-save">Сохранить дизайн</button>
                <button @click="currentView = 'calendar'" class="btn-back">Вернуться к календарю</button>
            </div>
        </div>
    `
};

createApp(App).mount('#app');
