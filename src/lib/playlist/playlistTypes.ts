import { PlaybackMode } from "@/components/ui/player/PlaybackModeToggle";
import { IQueueItem } from "../playback/playbackTypes";

export interface Playlist {
    id: number;
    ownerId: number;
    title: string;
    mode: PlaybackMode;
    queue: IQueueItem[];
}