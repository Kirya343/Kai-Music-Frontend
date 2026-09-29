import { apiFetch } from "@common";
import { PlaybackMode } from "../playlistTypes";
import { IQueueItemCreate } from "@playback";

export const setPlaylistPlaybackMode = (playlistId: number, mode: PlaybackMode) => apiFetch(`/playlist/${playlistId}/mode`, {method: "PATCH"}, {mode})
export const addToQueue = (list: IQueueItemCreate[]) => 
    apiFetch(
        `/playlist/queue`, 
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },  
            body: JSON.stringify(list) 
        })
export const removeFromQueue = (list: number[]) => 
    apiFetch(
        `/playlist/queue`, 
        { 
            method: "DELETE", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(list) 
        })
