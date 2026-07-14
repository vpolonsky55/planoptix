import api from './api';

export const placeService = {
    // Получить список мест
    getPlaces: async () => {
        const response = await api.get('/places/places/');
        return response.data;
    },
    
    // Создать место
    createPlace: async (placeData) => {
        const response = await api.post('/places/places/', placeData);
        return response.data;
    },
    
    // Обновить место
    updatePlace: async (id, placeData) => {
        const response = await api.patch(`/places/places/${id}/`, placeData);
        return response.data;
    },
    
    // Удалить место
    deletePlace: async (id) => {
        await api.delete(`/places/places/${id}/`);
    },
};