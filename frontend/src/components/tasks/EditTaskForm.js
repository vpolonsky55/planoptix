import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom'; // 👈 Добавлен useLocation
import { taskService } from '../../services/taskService';
import EntityManager from '../common/EntityManager';
import { personConfig } from '../../config/personConfig';
import { tagConfig } from '../../config/tagConfig';
import { placeConfig } from '../../config/placeConfig';
import ResourceManager from '../common/ResourceManager';  
import styles from './TaskForm.module.css';  // Переиспользуем стили

function EditTaskForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation(); // 👈 НОВОЕ
    const focusedTaskId = location.state?.focusedTaskId || null; // 👈 НОВОЕ
    const [allTasks, setAllTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        scheduled_start: '',
        scheduled_end: '',
        assigned_people: [],
        parent_task: null,
        tags: [],
        related_places: [],
        resources: [],
    });
    const [selectedPlaces, setSelectedPlaces] = useState([]);
    const [selectedResources, setSelectedResources] = useState([]);

    // Состояния для модальных окон EntityManager
    const [showPersonManager, setShowPersonManager] = useState(false);
    const [showTagManager, setShowTagManager] = useState(false);
    const [showPlaceManager, setShowPlaceManager] = useState(false);
    const [showResourceManager, setShowResourceManager] = useState(false);

    const loadTask = useCallback(async () => {
        try {
            setLoading(true);
            const task = await taskService.getTask(id);
            setFormData({
                title: task.title || '',
                description: task.description || '',
                scheduled_start: task.scheduled_start ? task.scheduled_start.slice(0, 16) : '',
                scheduled_end: task.scheduled_end ? task.scheduled_end.slice(0, 16) : '',
                assigned_people: task.assigned_people_detail || [],
                parent_task: task.parent_task || null,
                tags: task.tags_detail || [],
                related_places: task.related_places || [],
                resources: task.resources_detail?.map(r => r.id) || [],
            });
            setSelectedPlaces(task.place_detail || []);
            setSelectedResources(task.resources_detail || []);
            setError(null);
        } catch (err) {
            console.error('Ошибка при загрузке задачи:', err);
            setError('Не удалось загрузить задачу');
        } finally {
            setLoading(false);
        }
    }, [id]);

    // 👇 ИЗМЕНЕНО: loadTasksForParent с учётом focusedTaskId
    const loadTasksForParent = useCallback(async () => {
        try {
            const data = await taskService.getAllTasks();
            if (!Array.isArray(data)) {
                setAllTasks([]);
                return;
            }

            let filteredData = data;

            // Если есть фокусная задача, ограничиваем список
            if (focusedTaskId) {
                const getSubtaskIds = (taskId) => {
                    const ids = [taskId];
                    const subtasks = data.filter(t => t.parent_task === taskId);
                    subtasks.forEach(sub => {
                        ids.push(...getSubtaskIds(sub.id));
                    });
                    return ids;
                };
                const allowedIds = getSubtaskIds(focusedTaskId);
                filteredData = data.filter(task => allowedIds.includes(task.id));
            }

            const filterAndSortTasks = (tasks) => {
                return tasks
                    .filter(task => {
                        if (task.completed) return false;
                        if (task.id === parseInt(id)) return false;
                        return true;
                    })
                    .sort((a, b) => a.title.localeCompare(b.title))
                    .map(task => {
                        if (task.subtasks) {
                            task.subtasks = filterAndSortTasks(task.subtasks);
                        }
                        return task;
                    });
            };

            const filteredAndSorted = filterAndSortTasks(filteredData);
            setAllTasks(filteredAndSorted);
        } catch (err) {
            console.error('Ошибка при загрузке задач:', err);
        }
    }, [id, focusedTaskId]);

    useEffect(() => {
        loadTask();
        loadTasksForParent();
    }, [loadTask, loadTasksForParent]);

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
        setShowPersonManager(false);
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

    const handlePlaceSelect = (place) => {
        if (!selectedPlaces.find(p => p.id === place.id)) {
            setSelectedPlaces([...selectedPlaces, place]);
            setFormData(prev => ({
                ...prev,
                related_places: [...prev.related_places, place.id]
            }));
        }
        setShowPlaceManager(false);
    };

    const removePlace = (placeId) => {
        setSelectedPlaces(selectedPlaces.filter(p => p.id !== placeId));
        setFormData(prev => ({
            ...prev,
            related_places: prev.related_places.filter(id => id !== placeId)
        }));
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
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
                related_places: formData.related_places,
                resources: formData.resources,
            };

            await taskService.updateTask(id, data);
            // 👇 ИЗМЕНЕНО: возвращаемся в фокус, если он был
            navigate(focusedTaskId ? `/tasks/${focusedTaskId}` : '/dashboard');
        } catch (err) {
            console.error('Ошибка при обновлении задачи:', err);
            setError('Не удалось обновить задачу');
        } finally {
            setSaving(false);
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

    if (loading) return <div className={styles.container}>Загрузка...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>
                    {focusedTaskId ? '✏️ Редактировать подзадачу' : '✏️ Редактировать задачу'}
                </h1>
                {focusedTaskId && (
                    <p className={styles.focusHint}>
                        🔍 Редактирование в рамках фокусной задачи
                    </p>
                )}
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Название *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className={styles.input}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Родительская задача</label>
                        <select
                            name="parent_task"
                            value={formData.parent_task || ''}
                            onChange={handleChange}
                            className={styles.select}
                        >
                            <option value="">-- Без родителя (корневая задача) --</option>
                            {renderTaskOptions(allTasks)}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Описание</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className={styles.textarea}
                            rows="4"
                        />
                    </div>

                    {/* Участники */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Участники</label>
                        <div className={styles.sectionBox}>
                            <button
                                type="button"
                                onClick={() => setShowPersonManager(true)}
                                className={styles.addButton}
                            >
                                + Добавить участника
                            </button>
                            {formData.assigned_people.length > 0 && (
                                <div className={styles.itemsList}>
                                    {formData.assigned_people.map(person => (
                                        <div key={person.id} className={styles.itemTag}>
                                            <span>👤 {person.first_name} {person.last_name || ''}</span>
                                            <button
                                                type="button"
                                                onClick={() => removePerson(person.id)}
                                                className={styles.removeItem}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Теги */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Теги</label>
                        <div className={styles.sectionBox}>
                            <button
                                type="button"
                                onClick={() => setShowTagManager(true)}
                                className={styles.addButton}
                            >
                                + Добавить тег
                            </button>
                            {formData.tags.length > 0 && (
                                <div className={styles.itemsList}>
                                    {formData.tags.map(tag => (
                                        <div
                                            key={tag.id}
                                            className={{
                                                ...styles.itemTag,
                                                backgroundColor: tag.color + '20',
                                                borderLeft: `3px solid ${tag.color}`,
                                            }}
                                        >
                                            <span>🏷️ {tag.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag.id)}
                                                className={styles.removeItem}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Места */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>📍 Места</label>
                        <div className={styles.sectionBox}>
                            <button
                                type="button"
                                onClick={() => setShowPlaceManager(true)}
                                className={styles.addButton}
                            >
                                + Выбрать место
                            </button>
                            {selectedPlaces.length > 0 && (
                                <div className={styles.itemsList}>
                                    {selectedPlaces.map(place => (
                                        <div key={place.id} className={styles.itemTag}>
                                            <span>📍 {place.name}</span>
                                            {place.address && (
                                                <span className={{ fontSize: '0.8rem', color: '#666' }}>
                                                    ({place.address})
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removePlace(place.id)}
                                                className={styles.removeItem}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ресурсы */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>📎 Ресурсы</label>
                        <div className={styles.sectionBox}>
                            <button
                                type="button"
                                onClick={() => setShowResourceManager(true)}
                                className={styles.addButton}
                            >
                                + Добавить ресурс
                            </button>
                            {selectedResources.length > 0 && (
                                <div className={styles.itemsList}>
                                    {selectedResources.map(resource => (
                                        <div key={resource.id} className={styles.itemTag}>
                                            <span>
                                                {resource.resource_type === 'link' ? '🔗' : '📄'} {resource.name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeResource(resource.id)}
                                                className={styles.removeItem}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Начало</label>
                            <input
                                type="datetime-local"
                                name="scheduled_start"
                                value={formData.scheduled_start}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Окончание</label>
                            <input
                                type="datetime-local"
                                name="scheduled_end"
                                value={formData.scheduled_end}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.buttons}>
                        <button
                            type="button"
                            onClick={() => navigate(focusedTaskId ? `/tasks/${focusedTaskId}` : '/dashboard')}
                            className={styles.cancelButton}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className={styles.submitButton}
                        >
                            {saving ? 'Сохранение...' : 'Сохранить изменения'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Модальные окна EntityManager */}
            {showPersonManager && (
                <EntityManager
                    {...personConfig}
                    onClose={() => setShowPersonManager(false)}
                    onSelect={handlePersonSelect}
                    selectedIds={formData.assigned_people.map(p => p.id)}
                />
            )}

            {showTagManager && (
                <EntityManager
                    {...tagConfig}
                    onClose={() => setShowTagManager(false)}
                    onSelect={handleTagSelect}
                    selectedIds={formData.tags.map(t => t.id)}
                />
            )}

            {showPlaceManager && (
                <EntityManager
                    {...placeConfig}
                    onClose={() => setShowPlaceManager(false)}
                    onSelect={handlePlaceSelect}
                    selectedIds={formData.related_places}
                />
            )}

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




export default EditTaskForm;