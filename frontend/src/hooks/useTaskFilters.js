import { useState, useCallback, useEffect } from 'react';

export const useTaskFilters = (allTasks, rootTasks, sortType, initialFilters = {}) => {
    const [filters, setFilters] = useState({
        people: [],
        tags: [],
        places: [],
        status: 'all',
        dateRange: 'all',
        ...initialFilters,
    });

    const [filteredTasks, setFilteredTasks] = useState([]);

    const sortTasks = useCallback((tasks) => {
        if (!tasks || tasks.length === 0) return tasks;

        const sortSubtasksRecursively = (taskList) => {
            return taskList.map(task => {
                if (task.subtasks && task.subtasks.length > 0) {
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

        const tasksWithSortedSubtasks = sortSubtasksRecursively([...tasks]);

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

    const applyFilters = useCallback(() => {
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

        // Фильтр по тегам (логика И)
        if (filters.tags && filters.tags.length > 0) {
            const tasksWithTags = allTasks.filter(task => {
                if (!task.tags_detail) return false;
                return filters.tags.every(tag =>
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

        // Фильтрация дерева
        const filteredIds = new Set(filteredAll.map(t => t.id));

        const filterTree = (tasks) => {
            return tasks.filter(task => {
                if (filteredIds.has(task.id)) {
                    if (task.subtasks && task.subtasks.length > 0) {
                        task.subtasks = filterTree(task.subtasks);
                    }
                    return true;
                }
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

        const filteredRoot = filterTree([...rootTasks]);
        const sortedFiltered = sortTasks(filteredRoot);
        setFilteredTasks(sortedFiltered);
    }, [allTasks, rootTasks, filters, sortTasks]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const handleFilterChange = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const hasFilters = filters.people.length > 0 ||
        filters.tags.length > 0 ||
        filters.places.length > 0 ||
        filters.status !== 'all' ||
        filters.dateRange !== 'all';

    return {
        filters,
        filteredTasks,
        hasFilters,
        handleFilterChange,
    };
};