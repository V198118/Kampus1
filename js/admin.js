// Приложение админ-панели
const { createApp, ref, reactive, onMounted, computed } = Vue;

const AdminApp = {
    setup() {
        const currentTab = ref('design');
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
        const isAuthenticated = ref(false);
        const adminPassword = ref('');
        
        // Загрузка конфигурации и ячеек
        const loadConfig = async () => {
            try {
                // Проверяем аутентификацию
                const auth = localStorage.getItem('adminAuthenticated');
                if (!auth || auth !== 'true') {
                    return;
                }
                
                isAuthenticated.value = true;
                
                // Загрузка конфигурации
                const config = await ConfigUtils.loadConfig();
                if (config) {
                    Object.assign(designConfig, config);
                }
                
                // Загрузка сохраненной конфигурации
                const savedConfig = ConfigUtils.loadSavedConfig();
                if (savedConfig) {
                    // Аккуратно обновляем свойства, сохраняя структуру
                    if (savedConfig.layout) {
                        Object.assign(designConfig.layout, savedConfig.layout);
                    }
                    if (savedConfig.texts) {
                        Object.assign(designConfig.texts, savedConfig.texts);
                    }
                }
                
                // Загрузка ячеек
                const savedCells = CellUtils.loadCells();
                if (savedCells) {
                    calendarCells.value = savedCells;
                } else {
                    calendarCells.value = CellUtils.initializeCalendarCells(
                        new Date().getFullYear(),
                        new Date().getMonth()
                    );
                }
            } catch (error) {
                console.error('Ошибка загрузки конфига:', error);
            }
        };
        
        // Аутентификация администратора
        const authenticateAdmin = (password) => {
            if (password === 'admin123') {
                isAuthenticated.value = true;
                localStorage.setItem('adminAuthenticated', 'true');
                loadConfig(); // Перезагружаем конфигурацию после аутентификации
            } else {
                alert('Неверный пароль');
            }
        };
        
        // Выход из системы
        const logout = () => {
            isAuthenticated.value = false;
            localStorage.removeItem('adminAuthenticated');
        };
        
        // Сохранение дизайна
        const saveDesign = () => {
            CellUtils.saveCells(calendarCells.value);
            ConfigUtils.saveConfig(designConfig);
            alert('Дизайн сохранен!');
        };
        
        // Обновление ячейки
        const updateCell = (cell) => {
            const index = calendarCells.value.findIndex(c => c.id === cell.id);
            if (index !== -1) {
                calendarCells.value[index] = cell;
            }
        };
        
        // Обновление конфигурации
        const updateConfig = (config) => {
            Object.assign(designConfig, config);
        };
        
        // Инициализация при загрузке
        onMounted(() => {
            // Проверяем аутентификацию при загрузке
            const auth = localStorage.getItem('adminAuthenticated');
            if (auth && auth === 'true') {
                isAuthenticated.value = true;
                loadConfig();
            }
        });
        
        return {
            currentTab,
            designConfig,
            calendarCells,
            isAuthenticated,
            adminPassword,
            authenticateAdmin,
            logout,
            saveDesign,
            updateCell,
            updateConfig
        };
    },
    components: {
        AdminAuth,
        AdminDesign,
        AdminManagement
    },
    template: `
        <div>
            <AdminAuth 
                v-if="!isAuthenticated"
                @authenticate="authenticateAdmin"
            />
            
            <div v-else class="admin-panel">
                <div class="admin-tabs">
                    <button 
                        :class="['admin-tab', { active: currentTab === 'design' }]" 
                        @click="currentTab = 'design'"
                    >
                        Дизайн
                    </button>
                    <button 
                        :class="['admin-tab', { active: currentTab === 'management' }]" 
                        @click="currentTab = 'management'"
                    >
                        Менеджмент
                    </button>
                    <button @click="logout" style="margin-left: auto;">Выйти</button>
                </div>
                
                <AdminDesign 
                    v-if="currentTab === 'design'"
                    :design-config="designConfig"
                    :calendar-cells="calendarCells"
                    @save-design="saveDesign"
                    @go-back="currentTab = 'design'"
                    @update-cell="updateCell"
                    @update-config="updateConfig"
                />
                
                <AdminManagement 
                    v-else-if="currentTab === 'management'"
                    @go-back="currentTab = 'design'"
                />
            </div>
        </div>
    `
};

createApp(AdminApp).mount('#admin-app');
