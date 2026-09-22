export interface IRole {
    id: number;
    name: string;
    level: number;
}

export interface IPermission {
    id: number;
    name: string;
    comment: string;
}

export interface IPermissionUpdate {
    permissionId: number,
    enabled: boolean
}