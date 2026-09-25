import { PlaybackMode } from "@/components/ui/player/PlaybackModeToggle";
import { IAudio } from "../audio";

export interface IListeningRoom extends IShortRoom{
    mode: PlaybackMode;
    queue: IQueueItem[];
    audio: IAudio;
}

export interface IShortRoom {
    id: number;
    title: string;
    ownerId: number;
    code: string;
    membersCount: number;
}

export interface IRoomUpdate {
    title: string;
}

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