import { apiFetch, apiFetchJson } from "@common";
import { CreatePlaylist, PlaybackMode } from "../playlistTypes";
import { IQueueItemCreate } from "@playback";

export const setPlaylistPlaybackMode = (playlistId: number, mode: PlaybackMode) => apiFetch(`/playlist/${playlistId}/mode`, {method: "PATCH"}, {mode})
export const loadPlaylists = () => apiFetchJson("/playlist/my")
export const loadPlaylistById = (playlistId: number) => apiFetchJson(`/playlist/${playlistId}`)
export const deletePlaylist = (playlistId: number) => apiFetch(`/playlist/${playlistId}`, { method: "DELETE" })
export const importToRoom = (playlistId: number) => apiFetch(`/playlist/${playlistId}/import`, { method: "POST" })
export const createPlaylist = (playlist: CreatePlaylist) => 
    apiFetchJson(
        `/playlist`, 
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },  
            body: JSON.stringify(playlist) 
        })

export const addToQueue = (playlistId: number, list: IQueueItemCreate[]) => 
    apiFetch(
        `/playlist/${playlistId}/queue`, 
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },  
            body: JSON.stringify(list) 
        })
export const removeFromQueue = (playlistId: number, list: number[]) => 
    apiFetch(
        `/playlist/${playlistId}/queue`, 
        { 
            method: "DELETE", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(list) 
        })