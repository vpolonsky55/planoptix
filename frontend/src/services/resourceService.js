import api from './api';

export const resourceService = {
    get: async () => {  // ← добавить
        const response = await api.get('/resources/resources/');
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/resources/resources/', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.patch(`/resources/resources/${id}/`, data);
        return response.data;
    },
    delete: async (id) => {
        await api.delete(`/resources/resources/${id}/`);
    },

    // Получить список ресурсов
    getResources: async () => {
        const response = await api.get('/resources/resources/');
        return response.data;
    },

    // Создать ресурс
    createResource: async (resourceData) => {
        // Если это FormData, отправляем как есть, иначе как JSON
        if (resourceData instanceof FormData) {
            const response = await api.post('/resources/resources/', resourceData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            return response.data;
        } else {
            const response = await api.post('/resources/resources/', resourceData);
            return response.data;
        }
    },

    // Обновить ресурс
    updateResource: async (id, resourceData) => {
        if (resourceData instanceof FormData) {
            const response = await api.patch(`/resources/resources/${id}/`, resourceData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            return response.data;
        } else {
            const response = await api.patch(`/resources/resources/${id}/`, resourceData);
            return response.data;
        }
    },

    // Удалить ресурс
    deleteResource: async (id) => {
        await api.delete(`/resources/resources/${id}/`);
    },
};