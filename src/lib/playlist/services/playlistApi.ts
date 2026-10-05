import { createApi } from "@common";
import { CreatePlaylist, PlaybackMode, Playlist } from "../playlistTypes";
import { IQueueItemCreate } from "@playback";

const playlistApi = createApi("/playlist")

export const setPlaylistPlaybackMode = (playlistId: number, mode: PlaybackMode) => 
    playlistApi.patch<void>(`/${playlistId}/mode`, {}, { params: { mode }})

export const loadPlaylists = () => playlistApi.get<Playlist[]>("/my")

export const loadPlaylistById = (playlistId: number) => playlistApi.get<Playlist>(`/${playlistId}`)

export const deletePlaylist = (playlistId: number) => playlistApi.delete<void>(`/${playlistId}`)

export const importToRoom = (targetPlaylistId: number, importPlaylistId: number) => 
    playlistApi.post<void>(`/${targetPlaylistId}/import`, {}, { params: { playlistId: importPlaylistId } })

export const createPlaylist = (playlist: CreatePlaylist) => playlistApi.post<void>("", playlist)

export const addToQueue = (playlistId: number, list: IQueueItemCreate[]) => 
    playlistApi.post(`/${playlistId}/queue`, list)

export const removeFromQueue = (playlistId: number, list: number[]) => 
    playlistApi.delete<void>(`/${playlistId}/queue`, { data: list })