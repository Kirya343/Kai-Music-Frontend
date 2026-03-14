import { IPermission, IPermissionUpdate } from '../../types';
import { apiFetchJson, apiFetch } from '../utils/apiClient';

export const getAllRoles = () => apiFetchJson('/permissions/roles')
export const getAllPermissions = () => apiFetchJson('/permissions')
export const getRolePermissions = (roleId: number) => apiFetchJson(`/permissions/${roleId}/get`)

export const createPermission = (name: string) => apiFetchJson(`/permissions/create/permission?permissionName=${name}`, { method: "POST" })
export const createRole = (name: string) => apiFetchJson(`/permissions/create/role?roleName=${name}`, { method: "POST" })
export const updateRolePermissions = (roleId: number, update: IPermissionUpdate) => apiFetch(`/permissions/${roleId}/save`, { method: 'PUT' }, update)
export const updatePermission = (permId: number, pemissionMeta: IPermission) => apiFetch(`/permissions/update/permission/${permId}`, {method: "POST"}, pemissionMeta)

export const addRoleToUser = (userId: number, roleId: number) => apiFetch(`/permissions/user/role`, {method: "POST"}, {userId, roleId})
export const removeRoleFromUser = (userId: number, roleId: number) => apiFetch(`/permissions/user/role`, {method: "DELETE"}, {userId, roleId})