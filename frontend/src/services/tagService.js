import api from './api';

export const tagService = {
    // Получить список тегов
    getTags: async () => {
        const response = await api.get('/core/tags/');
        return response.data;
    },
    
    // Создать тег
    createTag: async (tagData) => {
        const response = await api.post('/core/tags/', tagData);
        return response.data;
    },
    
    // Обновить тег
    updateTag: async (id, tagData) => {
        const response = await api.patch(`/core/tags/${id}/`, tagData);
        return response.data;
    },
    
    // Удалить тег
    deleteTag: async (id) => {
        await api.delete(`/core/tags/${id}/`);
    },
};