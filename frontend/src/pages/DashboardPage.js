import React, { useState, useEffect, useCallback, useMemo } from 'react';  // 👈 Добавь useMemo
import { useNavigate, useParams } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import { useTaskFilters } from '../hooks/useTaskFilters';
import TaskFilters from '../components/common/TaskFilters';
import TaskList from '../components/tasks/TaskList';
import DashboardControls from '../components/dashboard/DashboardControls';
import styles from './DashboardPage.module.css';
import logo from '../assets/images/planoptix_logo.png';
import background from '../assets/images/background.jpeg';

function DashboardPage() {
    const [allTasks, setAllTasks] = useState([]);
    const [rootTasks, setRootTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortType, setSortType] = useState('newest');
    const [expandedTasks, setExpandedTasks] = useState(new Set());
    const [savedExpandedTasks, setSavedExpandedTasks] = useState(new Set());
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
        if (!focusedTaskId) return allTasks;
        
        // Рекурсивно собираем все подзадачи
        const getAllSubtaskIds = (taskId, allTasksList) => {
            const ids = [taskId];
            // Находим все задачи, у которых parent_task = taskId
            const directChildren = allTasksList.filter(t => t.parent_task === taskId);
            directChildren.forEach(child => {
                // Рекурсивно собираем подзадачи для каждого ребёнка
                ids.push(...getAllSubtaskIds(child.id, allTasksList));
            });
            return ids;
        };
        
        const allowedIds = getAllSubtaskIds(focusedTaskId, allTasks);
        return allTasks.filter(task => allowedIds.includes(task.id));
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

    // Вход в режим фокуса
    const focusTask = (taskId) => {
        // Сохраняем текущее состояние развёрнутости
        setSavedExpandedTasks(new Set(expandedTasks));
        setFocusedTaskId(taskId);
        
        // Разворачиваем все задачи в фокусе
        const task = allTasks.find(t => t.id === taskId);
        if (task) {
            const allIds = new Set();
            const collectIds = (t) => {
                allIds.add(t.id);
                if (t.subtasks) {
                    t.subtasks.forEach(sub => collectIds(sub));
                }
            };
            collectIds(task);
            setExpandedTasks(allIds);
        }
        
        navigate(`/tasks/${taskId}`);
    };

    // Выход из режима фокуса (на уровень вверх)
    const exitFocus = () => {
        const currentTask = allTasks.find(t => t.id === focusedTaskId);
        
        if (currentTask && currentTask.parent_task) {
            const parentId = currentTask.parent_task;
            const parentTask = allTasks.find(t => t.id === parentId);
            if (parentTask) {
                setFocusedTaskId(parentId);
                setFocusedTask(parentTask);
                // Восстанавливаем состояние развёрнутости
                setExpandedTasks(savedExpandedTasks);
                navigate(`/tasks/${parentId}`);
            } else {
                setFocusedTaskId(null);
                setFocusedTask(null);
                setExpandedTasks(savedExpandedTasks);
                navigate('/dashboard');
            }
        } else {
            setFocusedTaskId(null);
            setFocusedTask(null);
            setExpandedTasks(savedExpandedTasks);
            navigate('/dashboard');
        }
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
        console.log('🔵 toggleTask вызван для ID:', taskId);
        console.log('Текущее expandedTasks до изменения:', Array.from(expandedTasks));
        
        setExpandedTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                console.log('🟡 Сворачиваем задачу:', taskId);
                newSet.delete(taskId);
            } else {
                console.log('🟢 Разворачиваем задачу:', taskId);
                newSet.add(taskId);
            }
            console.log('Новое состояние expandedTasks:', Array.from(newSet));
            return newSet;
        });
    }, [expandedTasks]);

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

    if (loading) return <div className={styles.container}>Загрузка...</div>;
    if (error) return <div className={styles.container} style={{ color: 'red' }}>{error}</div>;

    const backgroundStyle = {
        backgroundImage: `url(${background})`,
    };

    return (
        <div className={styles.container} style={backgroundStyle}>
            <div className={styles.header}>
                {/* 👇 ИЗМЕНЕНО: левая часть шапки с кнопкой возврата */}
                <div className={styles.headerLeft}>
                    {focusedTaskId ? (
                        <button onClick={exitFocus} className={styles.backButton}>
                            ← Выйти из фокуса
                        </button>
                    ) : (
                        <div className={styles.logoContainer}>
                            <img src={logo} alt="Planoptix" className={styles.logo} />
                        </div>
                    )}
                    {focusedTaskId && focusedTask && (
                        <h2 className={styles.focusTitle}>🔍 {focusedTask.title}</h2>
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
                className={styles.addButton}
            >
                + {focusedTaskId ? 'Новая подзадача' : 'Новая задача'}
            </button>

            <TaskFilters onFilterChange={handleFilterChange} currentFilters={filters} />

            {hasFilters && filteredTasks.length === 0 ? (
                <p className={styles.empty}>
                    {focusedTaskId 
                        ? 'Нет подзадач, соответствующих выбранным фильтрам' 
                        : 'Нет задач, соответствующих выбранным фильтрам'}
                </p>
            ) : filteredTasks.length === 0 ? (
                <p className={styles.empty}>
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



export default DashboardPage;