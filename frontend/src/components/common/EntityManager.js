import React, { useState, useEffect } from 'react';

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
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h2 style={styles.title}>{config.icon} {config.title}</h2>
                    <button onClick={onClose} style={styles.closeButton}>✕</button>
                </div>

                <button
                    onClick={() => showForm ? resetForm() : setShowForm(true)}
                    style={styles.addButton}
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
                {error && <div style={styles.error}>{error}</div>}

                <div style={styles.list}>
                    {items.map(item => (
                        <div key={item.id} style={styles.item}>
                            <div
                                style={{
                                    ...styles.itemInfo,
                                    backgroundColor: isSelected(item.id) ? '#e3f2fd' : 'transparent',
                                }}
                                onClick={() => handleItemClick(item)}
                            >
                                {config.renderItem(item, isSelected(item.id))}
                            </div>
                            <div style={styles.itemActions}>
                                <button
                                    onClick={() => handleEdit(item)}
                                    style={styles.editButton}
                                    title="Редактировать"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id, item.name || item.first_name)}
                                    style={styles.deleteButton}
                                    title="Удалить"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {items.length === 0 && !loading && (
                    <p style={styles.empty}>Нет {config.entityName}. Создайте первый!</p>
                )}
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    title: {
        margin: 0,
        fontSize: '1.25rem',
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: '#888',
    },
    addButton: {
        width: '100%',
        padding: '0.5rem',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginBottom: '1rem',
    },
    list: {
        maxHeight: '400px',
        overflow: 'auto',
    },
    item: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem',
        borderBottom: '1px solid #eee',
    },
    itemInfo: {
        flex: 1,
        cursor: 'pointer',
        padding: '0.25rem',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    itemActions: {
        display: 'flex',
        gap: '0.5rem',
    },
    editButton: {
        padding: '0.25rem 0.5rem',
        backgroundColor: '#e3f2fd',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    deleteButton: {
        padding: '0.25rem 0.5rem',
        backgroundColor: '#ffebee',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    error: {
        color: '#dc3545',
        padding: '0.5rem',
        textAlign: 'center',
    },
    empty: {
        textAlign: 'center',
        color: '#888',
        padding: '1rem',
    },
};

export default EntityManager;