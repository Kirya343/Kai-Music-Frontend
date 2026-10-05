import { IPermission, IPermissionUpdate, IRole } from '@permission';
import { createApi } from '@common';

const permissionApi = createApi('/permissions')

export const getAllRoles = () => permissionApi.get<IRole[]>('/roles')
export const getAllPermissions = () => permissionApi.get<IPermission[]>('')
export const getRolePermissions = (roleId: number) => permissionApi.get<IPermission[]>(`/${roleId}/get`)

export const createPermission = (name: string) => permissionApi.post<void>(`/create/permission`, {}, { params: { permissionName: name }})
export const createRole = (name: string) => permissionApi.post<void>(`/create/role`, {}, { params: { roleName: name }})

export const updateRolePermissions = (roleId: number, update: IPermissionUpdate) => permissionApi.put<void>(`/${roleId}/save`, update)
export const updatePermission = (permId: number, pemissionMeta: IPermission) => permissionApi.post<void>(`/update/permission/${permId}`, pemissionMeta)

export const addRoleToUser = (userId: number, roleId: number) => permissionApi.post<void>(`/user/role`, { params: { userId, roleId } })
export const removeRoleFromUser = (userId: number, roleId: number) => permissionApi.delete<void>(`/user/role`, { params: { userId, roleId } })