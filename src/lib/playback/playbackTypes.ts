import { IAudio } from "@audio";

export interface IQueueItem {
    id: number;
    position: number;
    audio: IAudio;
}

export interface IQueueItemCreate {
    audioId: number;
    position?: number;
}

export interface IPlaybackState {
    user?: string;
    entryId: number;
    position: number;
    pause: boolean;
}