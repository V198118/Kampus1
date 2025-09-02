// Компонент аутентификации администратора
const AdminAuth = {
    emits: ['authenticate', 'go-back'],
    data() {
        return {
            adminPassword: ''
        };
    },
    template: `
        <div class="admin-auth">
            <h2>Вход в админ-панель</h2>
            <input type="password" v-model="adminPassword" placeholder="Введите пароль">
            <button @click="$emit('authenticate', adminPassword)">Войти</button>
            <button @click="$emit('go-back')">Назад</button>
        </div>
    `
};