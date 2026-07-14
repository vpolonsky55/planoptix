import React, { useState, useEffect, useCallback } from 'react'; // Добавь useCallback
import { taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TaskFilters from '../components/common/TaskFilters';


function DashboardPage() {
    const [allTasks, setAllTasks] = useState([]);      // Все задачи (плоский список)
    const [rootTasks, setRootTasks] = useState([]);    // Корневые задачи (для отображения)
    const [filteredTasks, setFilteredTasks] = useState([]); // Отфильтрованные корневые задачи
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortType, setSortType] = useState('newest'); // 'newest', 'oldest', 'alphabet'
    const [filters, setFilters] = useState({
        people: [],
        tags: [],
        places: [],
        status: 'all',
        dateRange: 'all'
    });
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadTasks();
    }, []);




    const loadTasks = async () => {
        try {
            setLoading(true);
            const data = await taskService.getTasks();

            // Сохраняем корневые задачи для отображения
            const root = Array.isArray(data) ? data : [];
            setRootTasks(root);

            // Функция для сбора всех задач (включая подзадачи) в плоский список
            const flattenTasks = (tasks, result = []) => {
                tasks.forEach(task => {
                    result.push(task);
                    if (task.subtasks && task.subtasks.length > 0) {
                        flattenTasks(task.subtasks, result);
                    }
                });
                return result;
            };

            const allFlattenedTasks = flattenTasks(root);
            console.log('Все задачи (включая подзадачи):', allFlattenedTasks);

            setAllTasks(allFlattenedTasks);
            setError(null);
        } catch (err) {
            console.error('Ошибка при загрузке задач:', err);
            setError('Не удалось загрузить задачи');
            setAllTasks([]);
            setRootTasks([]);
        } finally {
            setLoading(false);
        }
    };

    // Функция сортировки с сохранением иерархии
    const sortTasks = useCallback((tasks) => {
        // 1. Сначала рекурсивно сортируем подзадачи (по scheduled_end)
        const sortSubtasksRecursively = (taskList) => {
            return taskList.map(task => {
                if (task.subtasks && task.subtasks.length > 0) {
                    // Сортируем подзадачи по запланированному окончанию (сначала ближайшие)
                    const sortedSubtasks = [...task.subtasks].sort((a, b) => {
                        if (a.scheduled_end && b.scheduled_end) {
                            return new Date(a.scheduled_end) - new Date(b.scheduled_end);
                        }
                        if (!a.scheduled_end) return 1;
                        if (!b.scheduled_end) return -1;
                        return 0;
                    });
                    return {
                        ...task,
                        subtasks: sortSubtasksRecursively(sortedSubtasks)
                    };
                }
                return task;
            });
        };

        // Сортируем подзадачи внутри всех задач
        const tasksWithSortedSubtasks = sortSubtasksRecursively([...tasks]);

        // 2. Теперь сортируем только корневые задачи по выбранному типу
        let sortedRoots;
        switch (sortType) {
            case 'newest':
                sortedRoots = tasksWithSortedSubtasks.sort((a, b) => 
                    new Date(b.created_at) - new Date(a.created_at)
                );
                break;
            case 'oldest':
                sortedRoots = tasksWithSortedSubtasks.sort((a, b) => 
                    new Date(a.created_at) - new Date(b.created_at)
                );
                break;
            case 'alphabet':
                sortedRoots = tasksWithSortedSubtasks.sort((a, b) => 
                    a.title.localeCompare(b.title)
                );
                break;
            default:
                sortedRoots = tasksWithSortedSubtasks;
        }

        return sortedRoots;
    }, [sortType]);

    // Оборачиваем applyFilters в useCallback
    const applyFilters = useCallback(() => {
        // Сначала фильтруем плоский список всех задач
        let filteredAll = [...allTasks];

        // Фильтр по статусу
        if (filters.status === 'active') {
            filteredAll = filteredAll.filter(task => !task.completed);
        } else if (filters.status === 'completed') {
            filteredAll = filteredAll.filter(task => task.completed);
        }

        // Фильтр по датам
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        filteredAll = filteredAll.filter(task => {
            if (filters.dateRange === 'all') return true;
            if (filters.dateRange === 'no_date') {
                return !task.scheduled_end;
            }
            if (!task.scheduled_end) return false;
            const taskDate = new Date(task.scheduled_end);
            taskDate.setHours(0, 0, 0, 0);
            switch (filters.dateRange) {
                case 'today': return taskDate.getTime() === today.getTime();
                case 'tomorrow': return taskDate.getTime() === tomorrow.getTime();
                case 'this_week': return taskDate >= today && taskDate < nextWeek;
                case 'next_week':
                    const nextWeekStart = new Date(nextWeek);
                    const twoWeeks = new Date(nextWeek);
                    twoWeeks.setDate(twoWeeks.getDate() + 7);
                    return taskDate >= nextWeekStart && taskDate < twoWeeks;
                case 'overdue': return taskDate < today && !task.completed;
                default: return true;
            }
        });

        // Фильтр по участникам
        if (filters.people && filters.people.length > 0) {
            filteredAll = filteredAll.filter(task => {
                if (!task.assigned_people_detail) return false;
                return filters.people.some(person =>
                    task.assigned_people_detail.some(p => p.id === person.id)
                );
            });
        }

        // Фильтр по тегам (с родителями и потомками)
        if (filters.tags && filters.tags.length > 0) {
            const tasksWithTags = allTasks.filter(task => {
                if (!task.tags_detail) return false;
                return filters.tags.some(tag =>
                    task.tags_detail.some(t => t.id === tag.id)
                );
            });

            const relatedTaskIds = new Set();

            const collectParents = (task) => {
                if (task.parent_task) {
                    relatedTaskIds.add(task.parent_task);
                    const parentTask = allTasks.find(t => t.id === task.parent_task);
                    if (parentTask) {
                        collectParents(parentTask);
                    }
                }
            };

            const collectChildren = (task) => {
                if (task.subtasks && task.subtasks.length > 0) {
                    task.subtasks.forEach(child => {
                        relatedTaskIds.add(child.id);
                        collectChildren(child);
                    });
                }
            };

            tasksWithTags.forEach(task => {
                relatedTaskIds.add(task.id);
                collectParents(task);
                collectChildren(task);
            });

            const relatedTasks = allTasks.filter(task => relatedTaskIds.has(task.id));
            filteredAll = filteredAll.filter(task => relatedTasks.some(r => r.id === task.id));
        }

        // Фильтр по местам
        if (filters.places && filters.places.length > 0) {
            filteredAll = filteredAll.filter(task => {
                if (!task.place_detail) return false;
                return filters.places.some(place =>
                    task.place_detail.id === place.id
                );
            });
        }

        // Получаем ID задач, которые прошли фильтр
        const filteredIds = new Set(filteredAll.map(t => t.id));

        // Функция для фильтрации дерева задач
        const filterTree = (tasks) => {
            return tasks.filter(task => {
                // Если задача прошла фильтр, показываем её
                if (filteredIds.has(task.id)) {
                    // Рекурсивно фильтруем подзадачи
                    if (task.subtasks && task.subtasks.length > 0) {
                        task.subtasks = filterTree(task.subtasks);
                    }
                    return true;
                }
                // Если задача не прошла фильтр, проверяем подзадачи
                if (task.subtasks && task.subtasks.length > 0) {
                    const filteredSubtasks = filterTree(task.subtasks);
                    if (filteredSubtasks.length > 0) {
                        task.subtasks = filteredSubtasks;
                        return true;
                    }
                }
                return false;
            });
        };

        // Применяем фильтр к корневым задачам
        const filteredRoot = filterTree([...rootTasks]);
        const sortedFiltered = sortTasks(filteredRoot);
        setFilteredTasks(sortedFiltered);
        console.log('=== applyFilters завершён, filteredTasks:', filteredTasks.length);

    }, [allTasks, rootTasks, filters, sortTasks]); // Добавляем все зависимости;


    useEffect(() => {
        applyFilters();
    }, [applyFilters]); // ← теперь правильно

    // Оберни handleFilterChange в useCallback
    const handleFilterChange = useCallback((newFilters) => {
        console.log('handleFilterChange вызван с:', newFilters);
        setFilters(newFilters);
    }, []); // Пустой массив зависимостей, так как setFilters стабилен    

    const handleComplete = async (id) => {
        try {
            // Получаем текущую задачу, чтобы узнать ее статус
            const task = allTasks.find(t => t.id === id);
            if (!task) return;
            
            // Если задача выполнена - снимаем отметку, иначе - отмечаем как выполненную
            if (task.completed) {
                await taskService.uncompleteTask(id);  // Новый метод
            } else {
                await taskService.completeTask(id);
            }
            loadTasks();
        } catch (err) {
            console.error('Ошибка при изменении статуса задачи', err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Удалить задачу?')) {
            try {
                await taskService.deleteTask(id);
                loadTasks();
            } catch (err) {
                console.error('Ошибка при удалении', err);
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderTask = (task, level = 0) => {
        if (!task) return null;
        return (
            <div key={task.id} style={{ marginLeft: `${level * 20}px`, marginBottom: '8px' }}>
                <div style={styles.taskItem}>
                    <div style={styles.taskContent}>
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleComplete(task.id)}
                            style={styles.checkbox}
                        />
                        <div style={styles.taskInfo}>
                            <span style={{
                                ...styles.taskTitle,
                                textDecoration: task.completed ? 'line-through' : 'none',
                                color: task.completed ? '#888' : '#333'
                            }}>
                                {task.title}
                            </span>
                            {task.tags_detail && task.tags_detail.length > 0 && (
                                <div style={styles.tagsContainer}>
                                    {task.tags_detail.map(tag => (
                                        <span
                                            key={tag.id}
                                            style={{
                                                ...styles.tag,
                                                backgroundColor: tag.color + '20',
                                                borderLeft: `3px solid ${tag.color}`,
                                            }}
                                        >
                                            🏷️ {tag.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {task.assigned_people_detail && task.assigned_people_detail.length > 0 && (
                                <div style={styles.peopleTags}>
                                    {task.assigned_people_detail.map(person => (
                                        <span key={person.id} style={styles.personTag}>
                                            👤 {person.first_name} {person.last_name || ''}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {task.place_detail && (
                                <div style={styles.placeInfo}>
                                    📍 {task.place_detail.name}
                                    {task.place_detail.address && <span> ({task.place_detail.address})</span>}
                                </div>
                            )}
                            {/* отображение ресурсов */}
                            {task.resources_detail && task.resources_detail.length > 0 && (
                                <div style={styles.resourcesContainer}>
                                    {task.resources_detail.map(resource => (
                                        <span key={resource.id} style={styles.resourceTag}>
                                            {resource.resource_type === 'link' ? '🔗' : '📄'} {resource.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        {task.scheduled_end && (
                            <span style={styles.deadline}>
                                📅 {new Date(task.scheduled_end).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => handleDelete(task.id)}
                        style={styles.deleteButton}
                    >
                        🗑️
                    </button>
                    <button
                        onClick={() => navigate(`/tasks/edit/${task.id}`)}
                        style={styles.editButton}
                    >
                        ✏️
                    </button>
                </div>
                {task.subtasks && Array.isArray(task.subtasks) && task.subtasks.map(subtask => renderTask(subtask, level + 1))}
            </div>
        );
    };


    if (loading) return <div style={styles.container}>Загрузка...</div>;
    if (error) return <div style={{ ...styles.container, color: 'red' }}>{error}</div>;

    const hasFilters = filters.people.length > 0 ||
        filters.tags.length > 0 ||
        filters.status !== 'all' ||
        filters.dateRange !== 'all';

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>📋 Мои задачи</h1>
                <div style={styles.headerRight}>
                    <div style={styles.sortButtons}>
                        <button
                            onClick={() => setSortType('newest')}
                            style={{
                                ...styles.sortButton,
                                backgroundColor: sortType === 'newest' ? '#007bff' : '#e9ecef',
                                color: sortType === 'newest' ? 'white' : '#333',
                            }}
                            title="Сначала новые"
                        >
                            📅 Новые
                        </button>
                        <button
                            onClick={() => setSortType('oldest')}
                            style={{
                                ...styles.sortButton,
                                backgroundColor: sortType === 'oldest' ? '#007bff' : '#e9ecef',
                                color: sortType === 'oldest' ? 'white' : '#333',
                            }}
                            title="Сначала старые"
                        >
                            📅 Старые
                        </button>
                        <button
                            onClick={() => setSortType('alphabet')}
                            style={{
                                ...styles.sortButton,
                                backgroundColor: sortType === 'alphabet' ? '#007bff' : '#e9ecef',
                                color: sortType === 'alphabet' ? 'white' : '#333',
                            }}
                            title="По алфавиту"
                        >
                            🔤 А-Я
                        </button>
                    </div>
                    <button onClick={handleLogout} style={styles.logoutButton}>
                        Выйти
                    </button>
                </div>
            </div>

            <button
                onClick={() => navigate('/tasks/new')}
                style={styles.addButton}
            >
                + Новая задача
            </button>

            <TaskFilters onFilterChange={handleFilterChange} currentFilters={filters} />

            {hasFilters && filteredTasks.length === 0 ? (
                <p style={styles.empty}>Нет задач, соответствующих выбранным фильтрам</p>
            ) : filteredTasks.length === 0 ? (
                <p style={styles.empty}>Нет задач. Создайте первую задачу!</p>
            ) : (
                <div style={styles.taskList}>
                    {filteredTasks.map(task => renderTask(task))}
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        padding: '2rem',
        maxWidth: '800px',
        margin: '0 auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '0.5rem',
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
    },
    sortButtons: {
        display: 'flex',
        gap: '0.25rem',
    },
    sortButton: {
        padding: '0.4rem 0.75rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.8rem',
        transition: 'all 0.2s',
    },
    logoutButton: {
        padding: '0.4rem 0.75rem',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.85rem',
    },
    addButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginBottom: '1.5rem',
        fontSize: '1rem',
    },
    taskList: {
        marginTop: '1rem',
    },
    taskItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px',
        border: '1px solid #eee',
    },
    taskContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flex: 1,
    },
    checkbox: {
        width: '20px',
        height: '20px',
        cursor: 'pointer',
    },
    taskTitle: {
        flex: 1,
    },
    deadline: {
        fontSize: '0.85rem',
        color: '#888',
    },
    deleteButton: {
        padding: '0.25rem 0.5rem',
        backgroundColor: '#ffebee',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1.2rem',
    },
    editButton: {
        padding: '0.25rem 0.5rem',
        backgroundColor: '#e3f2fd',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1.2rem',
        marginRight: '0.5rem',
    },
    empty: {
        textAlign: 'center',
        color: '#888',
        marginTop: '2rem',
    },
    taskInfo: {
        flex: 1,
    },
    tagsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: '0.5rem',
    },
    tag: {
        fontSize: '0.7rem',
        padding: '0.2rem 0.5rem',
        borderRadius: '4px',
        color: '#495057',
    },
    peopleTags: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: '0.5rem',
    },
    personTag: {
        fontSize: '0.75rem',
        padding: '0.2rem 0.5rem',
        backgroundColor: '#e9ecef',
        borderRadius: '4px',
        color: '#495057',
    },
    placeInfo: {
        fontSize: '0.75rem',
        color: '#666',
        marginTop: '0.25rem',
    },
    resourcesContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: '0.5rem',
    },
    resourceTag: {
        fontSize: '0.7rem',
        padding: '0.2rem 0.5rem',
        backgroundColor: '#e8eaf6',
        borderRadius: '4px',
        color: '#3f51b5',
    },
};

export default DashboardPage;