import { IAudio } from "@audio";

/**
 * Represents an entry of playlist queue
 */
export interface IQueueItem {
    /** ID of queue entry */
    id: number;

    /** Position of the entry in queue */
    position: number;

    /** Audio metadata of queue item */
    audio: IAudio;
}

/**
 * Represents the DTO to create new queue item
 */
export interface IQueueItemCreate {
    /** ID of the audio than adds to queue */
    audioId: number;

    /** Position of audui in queue */
    position?: number;
}

/**
 * Represents the state of playback
 */
export interface IPlaybackState {

    /** User that initialized the update */
    user?: string;

    /** ID of the playing entry */
    entryId: number;

    /** Position on the audio */
    position: number;

    /** Is track paused */
    pause: boolean;
}