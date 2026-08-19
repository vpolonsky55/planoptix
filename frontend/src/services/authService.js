import api from './api';

export const authService = {
    register: async (username, email, password, password2) => {
        const response = await api.post('/core/register/', {
            username,
            email,
            password,
            password2,
        });
        return response.data;
    },
};