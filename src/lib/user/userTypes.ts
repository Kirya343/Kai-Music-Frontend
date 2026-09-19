export interface IShortUser {
    openId: string;
    name: string;
    avatarUrl?: string;
}

export interface IUser extends IShortUser {
    type: string;
    name: string;
    email: string;
    provider: string;
    roles: IRole[];
    status: string | null;
    createdAt: string;
}

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