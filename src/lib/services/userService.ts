import { apiFetchJson, apiFetch } from './apiClient';

export const userService = {
    getCurrent: () => apiFetchJson(`/user/current`),
    getById: (userId: number) => apiFetchJson(`/user/get/${userId}`),
    getProfile: (userOpenId: string) => apiFetchJson(`/user/profile/${userOpenId}`),
    getSettings: () => apiFetchJson(`/user/current/settings`),
    getRecentUsers: (count: number) => apiFetchJson(`/user/recent/${count}`),

    getFullInfo: (userOpenId: string) => apiFetchJson(`/user/${userOpenId}/full-info`),
    updateProfile: (name: string) => apiFetch('/user/update-profile', { method: "POST" }, {name}),
    setStatus: (status: string, userId: number) => apiFetch(`/user/status/set/${userId}`, {method: 'POST'}, {status})
};