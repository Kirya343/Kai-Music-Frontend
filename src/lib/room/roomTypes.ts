import { PlaybackMode } from "@/components/ui/player/PlaybackModeToggle";
import { IAudio } from "../audio";
import { IQueueItem } from "../playback/playbackTypes";

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