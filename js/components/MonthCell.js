// Компонент ячейки месяца
const MonthCell = {
    props: ['cell'],
    template: `
        <div class="calendar-cell month-cell" :style="{ 
            left: cell.x + '%', 
            top: cell.y + '%',
            width: cell.width + 'px',
            height: cell.height + 'px',
            fontSize: cell.textStyle.fontSize,
            fontFamily: cell.textStyle.fontFamily,
            color: cell.textStyle.color,
            zIndex: cell.textStyle.zIndex
        }">
            {{ cell.text }}
        </div>
    `
};

// Глобальная регистрация компонента
if (typeof Vue !== 'undefined') {
    Vue.component('MonthCell', MonthCell);
}