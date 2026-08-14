import React, { useState, useEffect } from 'react';
import styles from './EntityManager.module.css';

/**
 * Универсальный компонент для управления сущностями
 * Заменяет PeopleManager, TagManager, PlaceManager, ResourceManager
 * 
 * @param {Object} props
 * @param {Function} props.service - сервис с методами get, create, update, delete
 * @param {Function} props.FormComponent - компонент формы
 * @param {Object} props.config - конфигурация
 * @param {string} props.config.title - заголовок модального окна
 * @param {string} props.config.icon - иконка
 * @param {string} props.config.entityName - название сущности (для сообщений)
 * @param {Function} props.config.renderItem - функция для отображения элемента
 * @param {Function} props.onClose - закрыть модальное окно
 * @param {Function} props.onSelect - выбрать элемент
 * @param {Array} props.selectedIds - ID выбранных элементов
 * @param {Object} props.initialFormData - начальные данные формы
 */
function EntityManager({ 
    service, 
    FormComponent, 
    config, 
    onClose, 
    onSelect, 
    selectedIds = [],
    initialFormData = {}
}) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            setLoading(true);
            const data = await service.get();
            setItems(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error(`Ошибка при загрузке ${config.entityName}:`, err);
            setError(`Не удалось загрузить ${config.entityName}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const newItem = await service.create(formData);
            setItems([...items, newItem]);
            setShowForm(false);
            setEditingItem(null);
            setFormData(initialFormData);
            onSelect(newItem);
        } catch (err) {
            console.error(`Ошибка при создании ${config.entityName}:`, err);
            alert(`Не удалось создать ${config.entityName}`);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        const editData = {};
        Object.keys(initialFormData).forEach(key => {
            editData[key] = item[key] || '';
        });
        setFormData(editData);
        setShowForm(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const updated = await service.update(editingItem.id, formData);
            setItems(items.map(item => item.id === updated.id ? updated : item));
            setEditingItem(null);
            setShowForm(false);
            setFormData(initialFormData);
        } catch (err) {
            console.error(`Ошибка при обновлении ${config.entityName}:`, err);
            alert(`Не удалось обновить ${config.entityName}`);
        }
    };

    const handleDelete = async (itemId, itemName) => {
        if (window.confirm(`Удалить ${config.entityName} "${itemName}"?`)) {
            try {
                await service.delete(itemId);
                setItems(items.filter(item => item.id !== itemId));
            } catch (err) {
                console.error(`Ошибка при удалении ${config.entityName}:`, err);
                alert(`Не удалось удалить ${config.entityName}`);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'file') {
            setFormData(prev => ({ ...prev, file: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingItem(null);
        setFormData(initialFormData);
    };

    const isSelected = (itemId) => {
        return selectedIds.includes(itemId);
    };

    const handleItemClick = (item) => {
        onSelect(item);
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{config.icon} {config.title}</h2>
                    <button onClick={onClose} className={styles.closeButton}>✕</button>
                </div>

                <button
                    onClick={() => showForm ? resetForm() : setShowForm(true)}
                    className={styles.addButton}
                >
                    {showForm ? 'Отмена' : `+ Новый ${config.entityName}`}
                </button>

                {showForm && (
                    <FormComponent
                        formData={formData}
                        onChange={handleChange}
                        onSubmit={editingItem ? handleUpdate : handleCreate}
                        onCancel={resetForm}
                        isEditing={!!editingItem}
                    />
                )}

                {loading && <div>Загрузка...</div>}
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.list}>
                    {items.map(item => (
                        <div key={item.id} className={styles.item}>
                            <div
                                className={{
                                    ...styles.itemInfo,
                                    backgroundColor: isSelected(item.id) ? '#e3f2fd' : 'transparent',
                                }}
                                onClick={() => handleItemClick(item)}
                            >
                                {config.renderItem(item, isSelected(item.id))}
                            </div>
                            <div className={styles.itemActions}>
                                <button
                                    onClick={() => handleEdit(item)}
                                    className={styles.editButton}
                                    title="Редактировать"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id, item.name || item.first_name)}
                                    className={styles.deleteButton}
                                    title="Удалить"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {items.length === 0 && !loading && (
                    <p className={styles.empty}>Нет {config.entityName}. Создайте первый!</p>
                )}
            </div>
        </div>
    );
}



export default EntityManager;