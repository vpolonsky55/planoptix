import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
    const [isAllExpanded, setIsAllExpanded] = useState(true);
    
    const savedExpandedTasksRef = useRef(new Set());

    const [focusedTaskId, setFocusedTaskId] = useState(null);
    const [focusedTask, setFocusedTask] = useState(null);

    const { logout } = useAuth();
    const navigate = useNavigate();
    const { taskId } = useParams();

    const displayTasks = useMemo(() => {
        return focusedTaskId ? [focusedTask] : rootTasks;
    }, [focusedTask, rootTasks]);

    const displayAllTasks = useMemo(() => {
        if (!focusedTaskId) return allTasks;
        
        const getAllSubtaskIds = (taskId, allTasksList) => {
            const ids = [taskId];
            const directChildren = allTasksList.filter(t => t.parent_task === taskId);
            directChildren.forEach(child => {
                ids.push(...getAllSubtaskIds(child.id, allTasksList));
            });
            return ids;
        };
        
        const allowedIds = getAllSubtaskIds(focusedTaskId, allTasks);
        return allTasks.filter(task => allowedIds.includes(task.id));
    }, [focusedTaskId, allTasks]);

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

    const focusTask = (taskId) => {
        
        savedExpandedTasksRef.current = new Set(expandedTasks);
        
        setFocusedTaskId(taskId);
        
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

    const exitFocus = () => {
        const currentTask = allTasks.find(t => t.id === focusedTaskId);
        
        // Восстанавливаем состояние
        const restoredExpanded = new Set(savedExpandedTasksRef.current);
        
        // Добавляем подзадачи из фокуса
        expandedTasks.forEach(id => {
            restoredExpanded.add(id);
        });
        
        // Добавляем цепочку родителей
        if (currentTask) {
            let parent = currentTask.parent_task ? allTasks.find(t => t.id === currentTask.parent_task) : null;
            while (parent) {
                restoredExpanded.add(parent.id);
                parent = parent.parent_task ? allTasks.find(t => t.id === parent.parent_task) : null;
            }
            restoredExpanded.add(currentTask.id);
        }
        
        setExpandedTasks(restoredExpanded);
        
        // Принудительно перезагружаем задачи
        loadTasks();
        
        // Выход
        if (currentTask && currentTask.parent_task) {
            const parentId = currentTask.parent_task;
            const parentTask = allTasks.find(t => t.id === parentId);
            if (parentTask) {
                setFocusedTaskId(parentId);
                setFocusedTask(parentTask);
                navigate(`/tasks/${parentId}`);
                return;
            }
        }
        
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

    if (loading) return <div className={styles.container}>Загрузка...</div>;
    if (error) return <div className={styles.container} style={{ color: 'red' }}>{error}</div>;

    const backgroundStyle = {
        backgroundImage: `url(${background})`,
    };

    return (
        <div className={styles.container} style={backgroundStyle}>
            <div className={styles.header}>
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
                    onFocus={focusTask}
                />
            )}
        </div>
    );
}

export default DashboardPage;