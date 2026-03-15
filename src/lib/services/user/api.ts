import { apiFetchJson, apiFetch } from '@/lib';

export const getCurrent = () => apiFetchJson(`/user/current`)
export const getById = (userId: number) => apiFetchJson(`/user/get/${userId}`)
export const getProfile = (userOpenId: string) => apiFetchJson(`/user/profile/${userOpenId}`)
export const getSettings = () => apiFetchJson(`/user/current/settings`)
export const getRecentUsers = (count: number) => apiFetchJson(`/user/recent/${count}`)

export const getFullInfo = (userOpenId: string) => apiFetchJson(`/user/${userOpenId}/full-info`)
export const updateProfile = (name: string) => apiFetch('/user/update-profile', { method: "POST" }, {name})
export const setStatus = (status: string, userId: number) => apiFetch(`/user/status/set/${userId}`, {method: 'POST'}, {status})
export const setUserRoom = (roomId: number) => apiFetch(`/user/room`, {method: "PATCH"}, {roomId})