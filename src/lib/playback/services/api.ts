import { apiFetch, apiFetchJson } from "@common";
import { IPlaybackState } from "@playback/playbackTypes";

export const getCurrentRoomState = (roomId: number) => 
    apiFetchJson(`/playback/${roomId}/playback-state`);
export const playTrack = (roomId: number, track: "next" | "prev" | number) => 
    apiFetch(
        `/playback/${roomId}/change-track`, 
        { method: "POST" }, 
        { changing: String(track) });
export const updateTrackPosition = (roomId: number, state: IPlaybackState) => 
    apiFetch(
        `/playback/${roomId}/update-state`, 
        { 
            method: "POST",
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(state)
        });