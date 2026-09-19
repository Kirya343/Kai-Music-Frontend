import { IRole } from "@permission";

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