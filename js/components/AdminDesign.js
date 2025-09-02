// Компонент редактирования дизайна
const AdminDesign = {
    props: ['designConfig', 'calendarCells'],
    emits: ['save-design', 'go-back', 'update-cell', 'update-config'],
    data() {
        return {
            currentDesignView: 'background',
            draggingCell: null,
            startX: 0,
            startY: 0,
            startCellX: 0,
            startCellY: 0,
            contextMenu: {
                visible: false,
                x: 0,
                y: 0,
                cell: null
            },
            psbFile: null,
            psbStatus: ''
        };
    },
    methods: {
        // Начало перемещения ячейки
        startDrag(event, cell) {
            this.draggingCell = cell;
            this.startX = event.clientX;
            this.startY = event.clientY;
            this.startCellX = cell.x;
            this.startCellY = cell.y;

            document.addEventListener('mousemove', this.drag);
            document.addEventListener('mouseup', this.stopDrag);
        },

        // Перемещение ячейки
        drag(event) {
            if (!this.draggingCell) return;
            
            const container = this.$refs.previewContainer;
            const dx = ((event.clientX - this.startX) / container.offsetWidth) * 100;
            const dy = ((event.clientY - this.startY) / container.offsetHeight) * 100;
            
            // Обновляем позицию ячейки
            this.draggingCell.x = Math.max(0, Math.min(100 - (this.draggingCell.width / container.offsetWidth * 100), this.startCellX + dx));
            this.draggingCell.y = Math.max(0, Math.min(100 - (this.draggingCell.height / container.offsetHeight * 100), this.startCellY + dy));
            
            // Сообщаем об изменении
            this.$emit('update-cell', this.draggingCell);
        },

        // Окончание перемещения ячейки
        stopDrag() {
            document.removeEventListener('mousemove', this.drag);
            document.removeEventListener('mouseup', this.stopDrag);
            this.draggingCell = null;
        },

        // Показать контекстное меню
        showContextMenu(event, cell) {
            this.contextMenu = {
                visible: true,
                x: event.clientX,
                y: event.clientY,
                cell: cell
            };
        },

        // Закрыть контекстное меню
        closeContextMenu() {
            this.contextMenu.visible = false;
        },

        // Редактировать ячейку
        editCell(cell) {
            this.closeContextMenu();
            // В реальной реализации здесь можно открыть модальное окно для редактирования ячейки
            alert(`Редактирование ячейки: ${cell.id}`);
        },

        // Обработка загрузки PSB файла
        handlePSBUpload(event) {
            this.psbFile = event.target.files[0];
            this.psbStatus = '';
        },

        // Парсинг PSB файла
        async parsePSB() {
            if (!this.psbFile) {
                this.psbStatus = 'Файл не выбран';
                return;
            }

            this.psbStatus = 'Обработка файла...';
            
            try {
                const psbData = await PSBParser.parsePSB(this.psbFile);
                const validation = PSBParser.validatePSBStructure(psbData);
                
                if (!validation.isValid) {
                    this.psbStatus = `Отсутствуют обязательные элементы: ${validation.missingElements.join(', ')}`;
                    return;
                }
                
                // Применяем данные из PSB
                if (psbData.background) {
                    this.designConfig.layout.backgroundImage = psbData.background;
                    this.$emit('update-config', this.designConfig);
                }
                
                if (psbData.cells && psbData.cells.length > 0) {
                    psbData.cells.forEach(psbCell => {
                        const existingCell = this.calendarCells.find(cell => cell.id === psbCell.id);
                        if (existingCell) {
                            // Обновляем свойства ячейки
                            Object.assign(existingCell, psbCell);
                            this.$emit('update-cell', existingCell);
                        }
                    });
                }
                
                this.psbStatus = `Файл успешно обработан${psbData.warnings && psbData.warnings.length > 0 ? '. ' + psbData.warnings.join('. ') : ''}`;
            } catch (error) {
                this.psbStatus = `Ошибка: ${error.message}`;
            }
        }
    },
    template: `
        <div>
            <div class="design-sidebar">
                <h3>Редактирование дизайна</h3>
                <button 
                    :class="{ active: currentDesignView === 'background' }" 
                    @click="currentDesignView = 'background'"
                >
                    Редактирование фонового изображения
                </button>
                <button 
                    :class="{ active: currentDesignView === 'cells' }" 
                    @click="currentDesignView = 'cells'"
                >
                    Редактирование ячеек
                </button>
                <button 
                    :class="{ active: currentDesignView === 'photoshop' }" 
                    @click="currentDesignView = 'photoshop'"
                >
                    Редактирование фотошопом
                </button>
            </div>
            
            <div class="design-main">
                <div v-if="currentDesignView === 'background'" class="fullscreen-editor">
                    <h3>Редактирование фонового изображения</h3>
                    <label>
                        URL фонового изображения:
                        <input type="text" v-model="designConfig.layout.backgroundImage" style="width: 100%">
                    </label>
                    <p class="help-text">Полный URL, например: https://v198118.github.io/Kampus1/assets/images/1.png</p>
                    <button @click="currentDesignView = 'cells'">Готово</button>
                </div>
                
                <div v-else-if="currentDesignView === 'cells'">
                    <h3>Редактирование ячеек</h3>
                    <p>Перетаскивайте ячейки для изменения их положения. Щелкните правой кнопкой для детальных настроек.</p>
                    
                    <div class="admin-preview">
                        <div class="preview-container" ref="previewContainer" :style="{ backgroundImage: 'url(' + designConfig.layout.backgroundImage + ')', backgroundSize: 'cover' }">
                            <div 
                                v-for="cell in calendarCells" 
                                :key="cell.id"
                                class="preview-cell" 
                                :style="{ 
                                    left: cell.x + '%', 
                                    top: cell.y + '%',
                                    width: cell.width + 'px',
                                    height: cell.height + 'px',
                                    fontSize: cell.textStyle.fontSize,
                                    fontFamily: cell.textStyle.fontFamily,
                                    color: cell.textStyle.color
                                }"
                                @mousedown="startDrag($event, cell)"
                                @contextmenu.prevent="showContextMenu($event, cell)"
                            >
                                <div v-if="cell.text">{{ cell.text }}</div>
                                <div v-else>{{ cell.id }}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="admin-actions">
                        <button @click="$emit('save-design')" class="btn-save">Сохранить дизайн</button>
                        <button @click="$emit('go-back')" class="btn-back">Вернуться</button>
                    </div>
                </div>
                
                <div v-else-if="currentDesignView === 'photoshop'">
                    <h3>Редактирование через Photoshop</h3>
                    <p>Загрузите PSB файл для автоматического применения стилей и позиций элементов.</p>
                    
                    <input type="file" @change="handlePSBUpload" accept=".psb">
                    <button @click="parsePSB" :disabled="!psbFile">Применить PSB</button>
                    
                    <p v-if="psbStatus">{{ psbStatus }}</p>
                    
                    <div class="admin-actions">
                        <button @click="$emit('save-design')" class="btn-save">Сохранить дизайн</button>
                        <button @click="$emit('go-back')" class="btn-back">Вернуться</button>
                    </div>
                </div>
            </div>
            
            <div v-if="contextMenu.visible" class="context-menu" :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }">
                <button @click="editCell(contextMenu.cell)">Редактировать ячейку</button>
                <button @click="closeContextMenu">Закрыть</button>
            </div>
        </div>
    `
};