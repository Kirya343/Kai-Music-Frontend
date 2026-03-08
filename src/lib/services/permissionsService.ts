import { IPermission, IPermissionUpdate } from '../types';
import { apiFetchJson, apiFetch } from './apiClient';
export const permissionService = {
    getAllRoles: () => apiFetchJson('/permissions/roles'),
    getAllPermissions: () => apiFetchJson('/permissions'),
    getRolePermissions: (roleId: number) => apiFetchJson(`/permissions/${roleId}/get`),

    createPermission: (name: string) => apiFetchJson(`/permissions/create/permission?permissionName=${name}`, { method: "POST" }),
    createRole: (name: string) => apiFetchJson(`/permissions/create/role?roleName=${name}`, { method: "POST" }),
    updateRolePermissions: (roleId: number, update: IPermissionUpdate) => apiFetch(`/permissions/${roleId}/save`, { method: 'PUT' }, update),
    updatePermission: (permId: number, pemissionMeta: IPermission) => apiFetch(`/permissions/update/permission/${permId}`, {method: "POST"}, pemissionMeta),

    addRoleToUser: (userId: number, roleId: number) => apiFetch(`/permissions/user/role`, {method: "POST"}, {userId, roleId}),
    removeRoleFromUser: (userId: number, roleId: number) => apiFetch(`/permissions/user/role`, {method: "DELETE"}, {userId, roleId})
}