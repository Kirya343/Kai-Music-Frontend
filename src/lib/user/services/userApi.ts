import { createApi } from '@common';
import { IUser } from '@user/userTypes';

const userApi = createApi("/user")

export const getCurrent = () => userApi.get<IUser>(`/current`)