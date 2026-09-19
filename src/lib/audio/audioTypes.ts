import { PlaybackMode } from "@/components/ui/player/PlaybackModeToggle";

export interface AudioChunk {
    bytes: Uint8Array;
    sequence: number;
    duration: number;
    initialization: boolean;
};

export interface TimeRange {
    start: number; 
    end: number
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
