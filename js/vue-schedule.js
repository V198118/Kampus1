const { createApp, ref, reactive, onMounted } = Vue;

const ScheduleApp = {
    setup() {
        const selectedDate = ref('');
        const dayEvents = ref([]);
        const designConfig = reactive({});
        
        // Загрузка конфигурации
        const loadConfig = async () => {
            try {
                const response = await fetch('config/design-config.json');
                const config = await response.json();
                Object.assign(designConfig, config);
            } catch (error) {
                console.error('Ошибка загрузки конфига:', error);
            }
        };
        
        // Загрузка данных о событиях
        const loadEvents = () => {
            // Здесь будет загрузка событий из RSS
            // Временные данные для примера
            dayEvents.value = [
                {
                    title: 'Пример события 1',
                    organization: 'Организация 1',
                    time: '10:00',
                    place: 'Аудитория 101',
                    description: 'Описание события 1'
                },
                {
                    title: 'Пример события 2',
                    organization: 'Организация 2',
                    time: '14:00',
                    place: 'Аудитория 202',
                    description: 'Описание события 2'
                }
            ];
        };
        
        // Инициализация при загрузке
        onMounted(() => {
            loadConfig();
            loadEvents();
            
            // Получение даты из URL или sessionStorage
            const urlParams = new URLSearchParams(window.location.search);
            const dateParam = urlParams.get('date') || sessionStorage.getItem('selectedDate');
            selectedDate.value = dateParam ? new Date(dateParam).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }) : 'Выбранная дата';
        });
        
        const backgroundStyle = computed(() => {
            return {
                backgroundImage: `url('${designConfig.layout?.backgroundImage || ''}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            };
        });
        
        return {
            selectedDate,
            dayEvents,
            designConfig,
            backgroundStyle
        };
    },
    template: `
        <div id="background-container" :style="backgroundStyle"></div>
        
        <header>
            <a href="index.html" class="back-link">← Назад к календарю</a>
            <h1>Расписание на {{ selectedDate }}</h1>
        </header>

        <main class="schedule-container">
            <div v-if="dayEvents.length === 0" class="no-events">
                <p>На этот день мероприятий не запланировано.</p>
            </div>
            
            <div v-else class="events-list">
                <div v-for="(event, index) in dayEvents" :key="index" class="schedule-event">
                    <h3>{{ event.title }}</h3>
                    <p><strong>Организация:</strong> {{ event.organization }}</p>
                    <p><strong>Время:</strong> {{ event.time }}</p>
                    <p><strong>Место:</strong> {{ event.place }}</p>
                    <p v-if="event.description">{{ event.description }}</p>
                </div>
            </div>
        </main>
    `
};

createApp(ScheduleApp).mount('#schedule-app');
