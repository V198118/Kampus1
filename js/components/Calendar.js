// Компонент календаря
const Calendar = {
    props: [
        'currentDate', 
        'designConfig', 
        'calendarCells', 
        'currentFilter', 
        'isFilterSidebarOpen',
        'monthName',
        'backgroundStyle',
        'texts'
    ],
    emits: [
        'change-month', 
        'set-filter', 
        'go-to-schedule', 
        'show-admin-auth',
        'toggle-filter-sidebar',
        'toggle-menu'
    ],
    components: {
        MonthCell,
        MenuCell
    },
    computed: {
        filteredCells() {
            if (this.currentFilter === 'all') {
                return this.calendarCells.filter(cell => !cell.isStatic);
            } else if (this.currentFilter === 'events') {
                return this.calendarCells.filter(cell => cell.eventType === 'event' && !cell.isStatic);
            } else if (this.currentFilter === 'classes') {
                return this.calendarCells.filter(cell => cell.eventType === 'class' && !cell.isStatic);
            }
            return this.calendarCells.filter(cell => !cell.isStatic);
        },
        
        staticCells() {
            return this.calendarCells.filter(cell => cell.isStatic);
        }
    },
    template: `
        <div>
            <div id="background-container" :style="backgroundStyle"></div>
            
            <aside :class="['filter-sidebar', { active: isFilterSidebarOpen }]">
                <div class="filter-toggle" @click="$emit('toggle-filter-sidebar')">
                    <span>☰</span>
                </div>
                <nav class="filter-menu">
                    <button 
                        :class="['filter-btn', { active: currentFilter === 'all' }]" 
                        @click="$emit('set-filter', 'all')"
                    >
                        {{ texts.allEvents }}
                    </button>
                    <button 
                        :class="['filter-btn', { active: currentFilter === 'events' }]" 
                        @click="$emit('set-filter', 'events')"
                    >
                        {{ texts.events }}
                    </button>
                    <button 
                        :class="['filter-btn', { active: currentFilter === 'classes' }]" 
                        @click="$emit('set-filter', 'classes')"
                    >
                        {{ texts.classes }}
                    </button>
                    <button @click="$emit('show-admin-auth')" class="filter-btn">
                        {{ texts.admin }}
                    </button>
                </nav>
            </aside>

            <main class="calendar-container">
                <MonthCell 
                    v-for="cell in staticCells.filter(c => c.id === 'month')" 
                    :key="cell.id"
                    :cell="cell"
                />
                
                <div class="month-navigation" :style="{ position: 'absolute', top: '70px', left: '50%', transform: 'translateX(-50%)' }">
                    <button @click="$emit('change-month', 'prev')">&lt;</button>
                    <button @click="$emit('change-month', 'next')">&gt;</button>
                </div>
                
                <MenuCell 
                    v-for="cell in staticCells.filter(c => c.id === 'menu')" 
                    :key="cell.id"
                    :cell="cell"
                    :texts="texts"
                    :set-filter="$emit.bind(this, 'set-filter')"
                    :show-admin-auth="$emit.bind(this, 'show-admin-auth')"
                    @toggle-menu="$emit('toggle-menu', $event)"
                />
                
                <div 
                    v-for="cell in filteredCells" 
                    :key="cell.id"
                    class="calendar-cell" 
                    :data-type="cell.eventType"
                    :style="{ 
                        left: cell.x + '%', 
                        top: cell.y + '%',
                        width: cell.width + 'px',
                        height: cell.height + 'px'
                    }"
                    @click="$emit('go-to-schedule', cell.day)"
                >
                    <img v-if="cell.image" :src="cell.image" class="cell-image" :style="{ width: cell.width + 'px', height: cell.height + 'px' }" />
                    <div v-if="cell.text" class="cell-text" :style="cell.textStyle">{{ cell.text }}</div>
                    
                    <div class="event-scroll-container">
                        <div class="event-scroll">
                            <div class="event-title">
                                {{ cell.eventType === 'event' ? 'Мероприятие' : 'Занятие' }} {{ cell.day }}
                            </div>
                            <div class="event-details">Организация, время, место</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `
};