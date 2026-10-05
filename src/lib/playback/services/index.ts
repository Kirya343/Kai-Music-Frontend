import * as api from './playbackApi';
import * as hooks from './playbackHooks';

export const playbackService = {
    ...api,
    ...hooks
};