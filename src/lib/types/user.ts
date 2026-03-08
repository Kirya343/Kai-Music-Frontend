export interface IFullUser {
    id: number;
    openId: string;
    name: string;
    avatarUrl: string | null;
    status: string;
    roles: IRole[]
    createdAt: string;
}

export interface IUser {
    id: number;
    openId: string;
    type: string;
    name: string;
    phone: string | null;
    email: string;
    bio: string | null;
    avatarUrl: string | null;
    provider: string;
    roles: IRole[];
    status: string | null;
    rating: number | null;
    createdAt: string;
}

export interface IShortUser {
    id: number;
    openId: string;
    name: string;
    avatarUrl?: string;
}

export interface IShortUserProfile {
    id: number;
    openId: string;
    name: string;
    phone: string | null;
    email: string | null;
    avatarUrl: string | null;
    bio: string | null;
    languages: string[] | null;
    rating: number;
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