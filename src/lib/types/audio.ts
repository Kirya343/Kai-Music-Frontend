import { PlaybackMode } from "@/components/ui/player/PlaybackModeToggle";

export interface IListeningRoom extends IShortRoom{
    mode: PlaybackMode;
    queue: IQueueItem[]
}

export interface IShortRoom {
    id: number;
    title: string;
    ownerId: number;
    membersCount: number;
}

export interface IRoomUpdate {
    title: string;
}

export interface IQueueItem {
    id: number;
    audioId: number;
    name: string;
    position: number;
}

export interface IAudio {
    id: number;
    name: string;
    format: string;
    title: string;
    artist: string;
    album: string;
    duration: number;
    coverUrl: string;
}

export interface IAudioUpdate {
    title: string;
    artist: string;
    album: string;
    coverUrl: string;
}

export interface IPlaybackState {
    user?: string;
    entryId: number;
    position: number;
    pause: boolean;
}