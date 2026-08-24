// src/utils/filterStorage.js

const STORAGE_KEY = 'planoptix_filters';

// Сохранить фильтры
export const saveFilters = (filters) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
        console.error('Ошибка при сохранении фильтров:', error);
    }
};

// Загрузить фильтры
export const loadFilters = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (error) {
        console.error('Ошибка при загрузке фильтров:', error);
    }
    return null;
};

// Очистить фильтры
export const clearFilters = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Ошибка при очистке фильтров:', error);
    }
};