// Компонент ячейки меню
const MenuCell = {
    props: ['cell', 'texts', 'setFilter', 'showAdminAuth'],
    emits: ['toggle-menu'],
    template: `
        <div 
            class="calendar-cell menu-cell" 
            :class="{ expanded: cell.isExpanded }"
            :style="{ 
                left: cell.x + '%', 
                top: cell.y + '%',
                width: cell.width + 'px',
                height: cell.height + 'px',
                fontSize: cell.textStyle.fontSize,
                fontFamily: cell.textStyle.fontFamily,
                color: cell.textStyle.color
            }"
            @click="toggleMenu"
        >
            <div v-if="!cell.isExpanded">{{ cell.text }}</div>
            <div v-else class="menu-expanded">
                <button @click.stop="setFilter('all')">{{ texts.allEvents }}</button>
                <button @click.stop="setFilter('events')">{{ texts.events }}</button>
                <button @click.stop="setFilter('classes')">{{ texts.classes }}</button>
                <button @click.stop="showAdminAuth">{{ texts.admin }}</button>
            </div>
        </div>
    `,
    methods: {
        toggleMenu() {
            this.$emit('toggle-menu', this.cell);
        }
    }
};