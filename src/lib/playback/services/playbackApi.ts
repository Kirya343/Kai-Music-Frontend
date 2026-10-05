import { createApi } from "@common";
import { IPlaybackState } from "@playback/playbackTypes";

const playbackApi = createApi("/playback")

export const getCurrentRoomState = (roomId: number) => playbackApi.get<IPlaybackState>(`/${roomId}/playback-state`);
export const playTrack = (roomId: number, track: "next" | "prev" | number) => 
    playbackApi.post<void>(`/${roomId}/change-track`, { changing: String(track) });
export const updateTrackPosition = (roomId: number, state: IPlaybackState) => 
    playbackApi.post<void>(`/${roomId}/update-state`, state);