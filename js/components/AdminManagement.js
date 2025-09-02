// Компонент управления контентом (заглушка)
const AdminManagement = {
    emits: ['go-back'],
    template: `
        <div>
            <h2>Управление контентом</h2>
            <p>Этот раздел находится в разработке. Здесь будет управление мероприятиями и занятиями.</p>
            
            <div class="admin-actions">
                <button @click="$emit('go-back')" class="btn-back">Вернуться</button>
            </div>
        </div>
    `
};