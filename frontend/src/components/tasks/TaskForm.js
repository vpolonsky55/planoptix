import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskService } from '../../services/taskService';
import PeopleManager from '../people/PeopleManager';
import TagManager from './TagManager';
import PlaceManager from '../common/PlaceManager';
import ResourceManager from '../common/ResourceManager'; // добавить импорт


function TaskForm() {
    const navigate = useNavigate();
    const [showPeopleManager, setShowPeopleManager] = useState(false);
    const [showTagManager, setShowTagManager] = useState(false);  // ← добавить
    const [allTasks, setAllTasks] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        scheduled_start: '',
        scheduled_end: '',
        assigned_people: [],
        parent_task: null,
        tags: [],
        related_place: null,
        resources: [],  // IDs выбранных ресурсов
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPlaceManager, setShowPlaceManager] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState(null);
    // Добавь в состояния
    const [showResourceManager, setShowResourceManager] = useState(false);
    const [selectedResources, setSelectedResources] = useState([]);



    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const data = await taskService.getAllTasks();
            setAllTasks(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Ошибка при загрузке задач:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePersonSelect = (person) => {
        if (!formData.assigned_people.find(p => p.id === person.id)) {
            setFormData(prev => ({
                ...prev,
                assigned_people: [...prev.assigned_people, person]
            }));
        }
        setShowPeopleManager(false);
    };

    const removePerson = (personId) => {
        setFormData(prev => ({
            ...prev,
            assigned_people: prev.assigned_people.filter(p => p.id !== personId)
        }));
    };

    const handleTagSelect = (tag) => {
        if (!formData.tags.find(t => t.id === tag.id)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tag]
            }));
        }
        setShowTagManager(false);
    };

    const removeTag = (tagId) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t.id !== tagId)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = {
                title: formData.title,
                description: formData.description,
                scheduled_start: formData.scheduled_start,
                scheduled_end: formData.scheduled_end,
                assigned_people: formData.assigned_people.map(p => p.id),
                parent_task: formData.parent_task,
                tags: formData.tags.map(t => t.id),
                related_place: formData.related_place,
                resources: formData.resources,  // 👈 добавить
            };

            await taskService.createTask(data);
            navigate('/dashboard');
        } catch (err) {
            console.error('Ошибка при создании задачи:', err);
            setError('Не удалось создать задачу. Проверьте введенные данные.');
        } finally {
            setLoading(false);
        }
    };

    const getTaskTitleWithLevel = (task, level = 0) => {
        const indent = '  '.repeat(level);
        return `${indent}${task.title}`;
    };

    const renderTaskOptions = (tasks, level = 0) => {
        return tasks.map(task => (
            <React.Fragment key={task.id}>
                <option value={task.id}>
                    {getTaskTitleWithLevel(task, level)}
                </option>
                {task.subtasks && task.subtasks.length > 0 && (
                    renderTaskOptions(task.subtasks, level + 1)
                )}
            </React.Fragment>
        ));
    };

    // Обработчик выбора места
    const handlePlaceSelect = (place) => {
        setSelectedPlace(place);
        setFormData(prev => ({ ...prev, related_place: place.id }));
        setShowPlaceManager(false);
    };

    // Обработчик удаления места
    const removePlace = () => {
        setSelectedPlace(null);
        setFormData(prev => ({ ...prev, related_place: null }));
    };

    // Обработчики для ресурсов
    const handleResourceSelect = (resource) => {
        if (!selectedResources.find(r => r.id === resource.id)) {
            setSelectedResources([...selectedResources, resource]);
            setFormData(prev => ({
                ...prev,
                resources: [...prev.resources, resource.id]
            }));
        }
        setShowResourceManager(false);
    };

    const removeResource = (resourceId) => {
        setSelectedResources(selectedResources.filter(r => r.id !== resourceId));
        setFormData(prev => ({
            ...prev,
            resources: prev.resources.filter(id => id !== resourceId)
        }));
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>➕ Новая задача</h1>
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Название *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            style={styles.input}
                            required
                            placeholder="Введите название задачи"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Родительская задача</label>
                        <select
                            name="parent_task"
                            value={formData.parent_task || ''}
                            onChange={handleChange}
                            style={styles.select}
                        >
                            <option value="">-- Без родителя (корневая задача) --</option>
                            {renderTaskOptions(allTasks)}
                        </select>
                        <small style={styles.hint}>
                            Выберите задачу, внутри которой будет эта подзадача
                        </small>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Описание</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            style={styles.textarea}
                            rows="4"
                            placeholder="Подробное описание задачи"
                        />
                    </div>

                    {/* Блок участников */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Участники</label>
                        <div style={styles.sectionBox}>
                            <button
                                type="button"
                                onClick={() => setShowPeopleManager(true)}
                                style={styles.addButton}
                            >
                                + Добавить участника
                            </button>

                            {formData.assigned_people.length > 0 && (
                                <div style={styles.itemsList}>
                                    {formData.assigned_people.map(person => (
                                        <div key={person.id} style={styles.itemTag}>
                                            <span>👤 {person.first_name} {person.last_name || ''}</span>
                                            <button
                                                type="button"
                                                onClick={() => removePerson(person.id)}
                                                style={styles.removeItem}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <small style={styles.hint}>
                            💡 Участники, добавленные к подзадаче, автоматически появятся в родительской задаче
                        </small>
                    </div>

                    {/* Блок тегов */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Теги</label>
                        <div style={styles.sectionBox}>
                            <button
                                type="button"
                                onClick={() => setShowTagManager(true)}
                                style={styles.addButton}
                            >
                                + Добавить тег
                            </button>

                            {formData.tags.length > 0 && (
                                <div style={styles.itemsList}>
                                    {formData.tags.map(tag => (
                                        <div
                                            key={tag.id}
                                            style={{
                                                ...styles.itemTag,
                                                backgroundColor: tag.color + '20',
                                                borderLeft: `3px solid ${tag.color}`,
                                            }}
                                        >
                                            <span>🏷️ {tag.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag.id)}
                                                style={styles.removeItem}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* блок места : */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>📍 Место</label>
                        <div style={styles.sectionBox}>
                            <button
                                type="button"
                                onClick={() => setShowPlaceManager(true)}
                                style={styles.addButton}
                            >
                                + Выбрать место
                            </button>
                            {selectedPlace && (
                                <div style={styles.selectedPlace}>
                                    <span>📍 {selectedPlace.name}</span>
                                    {selectedPlace.address && <span style={styles.placeAddress}>🏠 {selectedPlace.address}</span>}
                                    <button type="button" onClick={removePlace} style={styles.removeItem}>×</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* В JSX добавь блок ресурсов (после блока места): */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>📎 Ресурсы</label>
                        <div style={styles.sectionBox}>
                            <button
                                type="button"
                                onClick={() => setShowResourceManager(true)}
                                style={styles.addButton}
                            >
                                + Добавить ресурс
                            </button>
                            {selectedResources.length > 0 && (
                                <div style={styles.itemsList}>
                                    {selectedResources.map(resource => (
                                        <div key={resource.id} style={styles.itemTag}>
                                            <span>{resource.resource_type === 'link' ? '🔗' : '📄'} {resource.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeResource(resource.id)}
                                                style={styles.removeItem}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Начало</label>
                            <input
                                type="datetime-local"
                                name="scheduled_start"
                                value={formData.scheduled_start}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Окончание</label>
                            <input
                                type="datetime-local"
                                name="scheduled_end"
                                value={formData.scheduled_end}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={styles.error}>
                            {error}
                        </div>
                    )}

                    <div style={styles.buttons}>
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            style={styles.cancelButton}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={styles.submitButton}
                        >
                            {loading ? 'Создание...' : 'Создать задачу'}
                        </button>
                    </div>
                </form>
            </div>

            {showPeopleManager && (
                <PeopleManager
                    onClose={() => setShowPeopleManager(false)}
                    onSelectPerson={handlePersonSelect}
                />
            )}

            {showTagManager && (
                <TagManager
                    onClose={() => setShowTagManager(false)}
                    onSelectTag={handleTagSelect}
                    selectedTags={formData.tags}
                />
            )}

            {showPlaceManager && (
                <PlaceManager
                    onClose={() => setShowPlaceManager(false)}
                    onSelectPlace={handlePlaceSelect}
                    selectedPlaceId={selectedPlace?.id}
                />
            )}

            {/* Добавь модальное окно в конец */}
            {showResourceManager && (
                <ResourceManager
                    onClose={() => setShowResourceManager(false)}
                    onSelectResource={handleResourceSelect}
                    selectedResourceIds={formData.resources}
                />
            )}


        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '2rem',
    },
    card: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '600px',
    },
    title: {
        marginBottom: '1.5rem',
        color: '#333',
        fontSize: '1.5rem',
    },
    formGroup: {
        marginBottom: '1rem',
        flex: 1,
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        color: '#333',
        fontWeight: '500',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
        boxSizing: 'border-box',
    },
    textarea: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
        fontFamily: 'inherit',
        resize: 'vertical',
        boxSizing: 'border-box',
    },
    select: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
        backgroundColor: 'white',
        cursor: 'pointer',
    },
    hint: {
        display: 'block',
        marginTop: '0.25rem',
        fontSize: '0.75rem',
        color: '#888',
    },
    // hint: {
    //     fontSize: '0.75rem',
    //     color: '#6c757d',
    //     marginTop: '0.5rem',
    //     fontStyle: 'italic',
    // },
    row: {
        display: 'flex',
        gap: '1rem',
    },
    sectionBox: {
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '0.5rem',
    },
    addButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
    },
    itemsList: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: '0.5rem',
    },
    itemTag: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.25rem 0.5rem',
        backgroundColor: '#e9ecef',
        borderRadius: '4px',
        fontSize: '0.9rem',
    },
    removeItem: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.2rem',
        color: '#dc3545',
        padding: '0 0.25rem',
    },
    buttons: {
        display: 'flex',
        gap: '1rem',
        marginTop: '1.5rem',
    },
    submitButton: {
        flex: 1,
        padding: '0.75rem',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer',
    },
    cancelButton: {
        flex: 1,
        padding: '0.75rem',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer',
    },
    error: {
        backgroundColor: '#ffebee',
        color: '#c62828',
        padding: '0.75rem',
        borderRadius: '4px',
        marginBottom: '1rem',
    },

    // Добавь стили
    selectedPlace: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem',
        backgroundColor: '#e9ecef',
        borderRadius: '4px',
        marginTop: '0.5rem',
    },
    placeAddress: {
        fontSize: '0.8rem',
        color: '#666',
    },

};

export default TaskForm;