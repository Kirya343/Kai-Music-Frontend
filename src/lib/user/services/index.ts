import * as api from './api';
import * as hooks from './hooks';

export const userService = {
    ...api,
    ...hooks
};