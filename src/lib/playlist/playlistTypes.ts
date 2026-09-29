import { IQueueItem } from "../playback/playbackTypes";

export enum PlaybackMode {
    NORMAL = "NORMAL",
    REPEAT_ALL = "REPEAT_ALL",
    SHUFFLE = "SHUFFLE",
    REPEAT_ONE = "REPEAT_ONE"
}

export interface Playlist {
    id: number;
    ownerId: number;
    title: string;
    mode: PlaybackMode;
    queue: IQueueItem[];
}