import api from './api';

export const personService = {
    get: async () => {  // ← добавить
        const response = await api.get('/core/people/');
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/core/people/', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.patch(`/core/people/${id}/`, data);
        return response.data;
    },
    delete: async (id) => {
        await api.delete(`/core/people/${id}/`);
    },

    // Получить список контактов
    getPeople: async () => {
        const response = await api.get('/core/people/');
        return response.data;
    },
    
    // Создать контакт
    createPerson: async (personData) => {
        const response = await api.post('/core/people/', personData);
        return response.data;
    },
    
    // Обновить контакт
    updatePerson: async (id, personData) => {
        const response = await api.patch(`/core/people/${id}/`, personData);
        return response.data;
    },
    
    // Удалить контакт
    deletePerson: async (id) => {
        await api.delete(`/core/people/${id}/`);
    },
};