import React, { useState, useEffect, useCallback, useMemo } from 'react';  // 👈 Добавь useMemo
import { useNavigate, useParams } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import { useTaskFilters } from '../hooks/useTaskFilters';
import TaskFilters from '../components/common/TaskFilters';
import TaskList from '../components/tasks/TaskList';
import DashboardControls from '../components/dashboard/DashboardControls';

function DashboardPage() {
    const [allTasks, setAllTasks] = useState([]);
    const [rootTasks, setRootTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortType, setSortType] = useState('newest');
    const [expandedTasks, setExpandedTasks] = useState(new Set());
    const [isAllExpanded, setIsAllExpanded] = useState(true);
    
    // 👇 НОВОЕ: состояние для режима фокуса
    const [focusedTaskId, setFocusedTaskId] = useState(null);
    const [focusedTask, setFocusedTask] = useState(null);

    const { logout } = useAuth();
    const navigate = useNavigate();
    const { taskId } = useParams(); // 👈 НОВОЕ: извлекаем taskId из URL

    // 👇 НОВОЕ: определяем, какие задачи показывать
    const displayTasks = useMemo(() => {
        return focusedTaskId ? [focusedTask] : rootTasks;
    }, [focusedTask, rootTasks]);

    const displayAllTasks = useMemo(() => {
        return focusedTaskId 
            ? allTasks.filter(t => t.id === focusedTaskId || t.parent_task === focusedTaskId) 
            : allTasks;
    }, [focusedTaskId, allTasks]);

    // 👇 НОВОЕ: загрузка задачи при фокусе
    // 👇 ИЗМЕНЕНО: защита от бесконечного цикла
    useEffect(() => {
        if (taskId) {
            const id = parseInt(taskId);
            if (!isNaN(id) && id !== focusedTaskId) {
                setFocusedTaskId(id);
            }
        } else if (focusedTaskId) {
            setFocusedTaskId(null);
        }
    }, [taskId]);

    // 👇 НОВОЕ: обновление focusedTask при изменении focusedTaskId или allTasks
    useEffect(() => {
        if (focusedTaskId) {
            const task = allTasks.find(t => t.id === focusedTaskId);
            if (task) {
                setFocusedTask(task);
            }
        } else {
            setFocusedTask(null);
        }
    }, [focusedTaskId, allTasks]);

    const { filters, filteredTasks, hasFilters, handleFilterChange } = useTaskFilters(
        displayAllTasks,
        displayTasks,
        sortType,
        // 👇 НОВОЕ: передаём focusedTaskId в хук
        focusedTaskId,
        { people: [], tags: [], places: [], status: 'all', dateRange: 'all' }
    );

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            setLoading(true);
            const data = await taskService.getTasks();
            const root = Array.isArray(data) ? data : [];
            setRootTasks(root);

            const flattenTasks = (tasks, result = []) => {
                tasks.forEach(task => {
                    result.push(task);
                    if (task.subtasks && task.subtasks.length > 0) {
                        flattenTasks(task.subtasks, result);
                    }
                });
                return result;
            };

            setAllTasks(flattenTasks(root));
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

    // 👇 НОВОЕ: вход в режим фокуса
    const focusTask = (taskId) => {
        setFocusedTaskId(taskId);
        navigate(`/tasks/${taskId}`);
    };

    // 👇 НОВОЕ: выход из режима фокуса
    const exitFocus = () => {
        setFocusedTaskId(null);
        setFocusedTask(null);
        navigate('/dashboard');
    };

    const handleComplete = async (id) => {
        try {
            const task = allTasks.find(t => t.id === id);
            if (!task) return;
            if (task.completed) {
                await taskService.uncompleteTask(id);
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

    const toggleTask = useCallback((taskId) => {
        setExpandedTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    }, []);

    const expandAll = useCallback(() => {
        const collectIds = (tasks) => {
            const ids = new Set();
            const collect = (taskList) => {
                taskList.forEach(task => {
                    ids.add(task.id);
                    if (task.subtasks) collect(task.subtasks);
                });
            };
            collect(tasks);
            return ids;
        };
        setExpandedTasks(collectIds(filteredTasks));
        setIsAllExpanded(true);
    }, [filteredTasks]);

    const collapseAll = useCallback(() => {
        setExpandedTasks(new Set());
        setIsAllExpanded(false);
    }, []);

    if (loading) return <div style={styles.container}>Загрузка...</div>;
    if (error) return <div style={{ ...styles.container, color: 'red' }}>{error}</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                {/* 👇 ИЗМЕНЕНО: левая часть шапки с кнопкой возврата */}
                <div style={styles.headerLeft}>
                    {focusedTaskId ? (
                        <button onClick={exitFocus} style={styles.backButton}>
                            ← Выйти из фокуса
                        </button>
                    ) : (
                        <h1 style={styles.title}>📋 Мои задачи</h1>
                    )}
                    {focusedTaskId && focusedTask && (
                        <h2 style={styles.focusTitle}>🔍 {focusedTask.title}</h2>
                    )}
                </div>
                <DashboardControls
                    sortType={sortType}
                    setSortType={setSortType}
                    onExpandAll={expandAll}
                    onCollapseAll={collapseAll}
                    onLogout={handleLogout}
                />
            </div>

            <button
                onClick={() => navigate('/tasks/new', { state: { focusedTaskId } })}
                style={styles.addButton}
            >
                + {focusedTaskId ? 'Новая подзадача' : 'Новая задача'}
            </button>

            <TaskFilters onFilterChange={handleFilterChange} currentFilters={filters} />

            {hasFilters && filteredTasks.length === 0 ? (
                <p style={styles.empty}>
                    {focusedTaskId 
                        ? 'Нет подзадач, соответствующих выбранным фильтрам' 
                        : 'Нет задач, соответствующих выбранным фильтрам'}
                </p>
            ) : filteredTasks.length === 0 ? (
                <p style={styles.empty}>
                    {focusedTaskId 
                        ? 'Нет подзадач. Создайте первую подзадачу!' 
                        : 'Нет задач. Создайте первую задачу!'}
                </p>
            ) : (
                <TaskList
                    tasks={filteredTasks}
                    expandedTasks={expandedTasks}
                    onToggle={toggleTask}
                    onComplete={handleComplete}
                    onDelete={handleDelete}
                    onFocus={focusTask}  // 👈 НОВОЕ: передаём функцию фокуса
                />
            )}
        </div>
    );
}

// 👇 ИЗМЕНЕНО: добавлены новые стили
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
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
    },
    title: {
        margin: 0,
        fontSize: '1.5rem',
    },
    focusTitle: {
        margin: 0,
        fontSize: '1.2rem',
        color: '#495057',
        fontWeight: 'normal',
    },
    backButton: {
        padding: '0.4rem 1rem',
        backgroundColor: '#e9ecef',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
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
    empty: {
        textAlign: 'center',
        color: '#888',
        marginTop: '2rem',
    },
};

export default DashboardPage;