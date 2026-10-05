import * as api from './userApi';
import * as hooks from './hooks';

export const userService = {
    ...api,
    ...hooks
};