import api from './api';

export const taskService = {
    // Получить список корневых задач
    getTasks: async () => {
        const response = await api.get('/tasks/tasks/');
        return response.data;
    },
    
    // Получить одну задачу по ID (для редактирования)
    getTask: async (id) => {
        const response = await api.get(`/tasks/tasks/${id}/`);
        return response.data;
    },
    
    // Получить все задачи (для выбора родителя)
    getAllTasks: async () => {
        const response = await api.get('/tasks/tasks/all/');
        return response.data;
    },
    
    // Создать задачу
    createTask: async (taskData) => {
        const response = await api.post('/tasks/tasks/', taskData);
        return response.data;
    },
    
    // Обновить задачу
    updateTask: async (id, taskData) => {
        const response = await api.patch(`/tasks/tasks/${id}/`, taskData);
        return response.data;
    },
    
    // Удалить задачу
    deleteTask: async (id) => {
        await api.delete(`/tasks/tasks/${id}/`);
    },
    
    // Отметить как выполненную
    completeTask: async (id) => {
        const response = await api.post(`/tasks/tasks/${id}/complete/`);
        return response.data;
    },

    // Отметить как невыполненную
    uncompleteTask: async (id) => {
        const response = await api.post(`/tasks/tasks/${id}/incomplete/`);
        return response.data;
    },
    
    // Задачи на сегодня
    getTodayTasks: async () => {
        const response = await api.get('/tasks/tasks/today/');
        return response.data;
    },
};