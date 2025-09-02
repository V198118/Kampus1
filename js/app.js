// Основное приложение
const { createApp, ref, reactive, onMounted, computed } = Vue;

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
                backgroundImage: "",
                headerHeight: "80px",
                filterWidth: "250px"
            },
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
            texts: {
                allEvents: "Все события",
                events: "Мероприятия",
                classes: "Занятия",
                admin: "Админ-панель"
            }
        });
        const calendarCells = ref([]);
        const isAdmin = ref(false);
        const adminPassword = ref('');
        const currentFilter = ref('all');
        const isFilterSidebarOpen = ref(false);
        
        // Загрузка конфигурации и ячеек
        const loadConfig = async () => {
            try {
                // Загрузка конфигурации
                const config = await ConfigUtils.loadConfig();
                Object.assign(designConfig, config);
                
                // Загрузка сохраненной конфигурации
                const savedConfig = ConfigUtils.loadSavedConfig();
                if (savedConfig) {
                    if (savedConfig.layout && savedConfig.layout.backgroundImage) {
                        designConfig.layout.backgroundImage = savedConfig.layout.backgroundImage;
                    }
                    if (savedConfig.texts) {
                        designConfig.texts = savedConfig.texts;
                    }
                }
                
                // Загрузка ячеек
                const savedCells = CellUtils.loadCells();
                if (savedCells) {
                    calendarCells.value = CellUtils.updateMonthCell(
                        savedCells, 
                        monthName.value, 
                        currentDate.year
                    );
                } else {
                    initializeCalendarCells();
                }
            } catch (error) {
                console.error('Ошибка загрузки конфига:', error);
                initializeCalendarCells();
            }
        };
        
        // Инициализация ячеек календаря
        const initializeCalendarCells = () => {
            calendarCells.value = CellUtils.initializeCalendarCells(
                currentDate.year, 
                currentDate.month,
                calendarCells.value
            );
            calendarCells.value = CellUtils.updateMonthCell(
                calendarCells.value,
                monthName.value,
                currentDate.year
            );
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
        
        // Переключение фильтра
        const setFilter = (filter) => {
            currentFilter.value = filter;
        };
        
        // Переход к расписанию
        const goToSchedule = (day) => {
            const formattedDate = `${currentDate.year}-${(currentDate.month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            sessionStorage.setItem('selectedDate', formattedDate);
            window.location.href = `schedule.html?date=${formattedDate}`;
        };
        
        // Аутентификация администратора
        const authenticateAdmin = (password) => {
            if (password === 'admin123') {
                isAdmin.value = true;
                window.location.href = 'admin.html';
            } else {
                alert('Неверный пароль');
            }
        };
        
        // Сохранение дизайна
        const saveDesign = () => {
            CellUtils.saveCells(calendarCells.value);
            ConfigUtils.saveConfig(designConfig);
            alert('Дизайн сохранен!');
        };
        
        // Переключение боковой панели
        const toggleFilterSidebar = () => {
            isFilterSidebarOpen.value = !isFilterSidebarOpen.value;
        };
        
        // Переключение меню
        const toggleMenu = (cell) => {
            if (cell.id === 'menu') {
                cell.isExpanded = !cell.isExpanded;
                
                if (cell.isExpanded) {
                    cell.width = 200;
                    cell.height = 160;
                } else {
                    cell.width = 100;
                    cell.height = 40;
                }
            }
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
            // Добавляем дополнительные проверки для избежания ошибок
            if (!designConfig || !designConfig.layout || !designConfig.layout.backgroundImage) {
                return {};
            }
            
            const bgImage = designConfig.layout.backgroundImage;
            return bgImage ? {
                backgroundImage: `url('${bgImage}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            } : {};
        });
        
        const texts = computed(() => {
            return designConfig.texts || {
                allEvents: "Все события",
                events: "Мероприятия",
                classes: "Занятия",
                admin: "Админ-панель"
            };
        });
        
        return {
            currentView,
            currentDate,
            designConfig,
            calendarCells,
            isAdmin,
            adminPassword,
            currentFilter,
            isFilterSidebarOpen,
            monthName,
            backgroundStyle,
            texts,
            changeMonth,
            goToSchedule,
            authenticateAdmin,
            saveDesign,
            setFilter,
            toggleFilterSidebar,
            toggleMenu
        };
    },
    components: {
        Calendar,
        AdminAuth
    },
    template: `
        <div>
            <Calendar 
                v-if="currentView === 'calendar'"
                :current-date="currentDate"
                :design-config="designConfig"
                :calendar-cells="calendarCells"
                :current-filter="currentFilter"
                :is-filter-sidebar-open="isFilterSidebarOpen"
                :month-name="monthName"
                :background-style="backgroundStyle"
                :texts="texts"
                @change-month="changeMonth"
                @set-filter="setFilter"
                @go-to-schedule="goToSchedule"
                @show-admin-auth="currentView = 'adminAuth'"
                @toggle-filter-sidebar="toggleFilterSidebar"
                @toggle-menu="toggleMenu"
            />
            
            <AdminAuth 
                v-else-if="currentView === 'adminAuth'"
                @authenticate="authenticateAdmin"
                @go-back="currentView = 'calendar'"
            />
        </div>
    `
};

createApp(App).mount('#app');
