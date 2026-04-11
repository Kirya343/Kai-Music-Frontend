import axios, { AxiosProgressEvent } from "axios";
import { PlaybackMode } from "@/components/ui/player/PlaybackModeToggle";
import { apiFetch, apiFetchJson } from "../utils/apiClient";
import { API_BASE } from "@/config";

export const loadAudioInfo = (entryId: number) => apiFetchJson(`/audio/${entryId}/info`)
export const loadCurrentRoom = () => apiFetchJson("/audio/room")
export const setRoomPlaybackMode = (roomId: number, mode: PlaybackMode) => apiFetch(`/audio/room/${roomId}/mode`, {method: "PATCH"}, {mode})
export const loadLibrary = () => apiFetchJson("/audio/library")
export const addToQueue = (roomId: number, audioId: number) => apiFetchJson(`/audio/room/${roomId}`, {method: "PATCH"}, {audioId})
export const removeFromQueue = (roomId: number, queueItemId: number) => apiFetch(`/audio/room/${roomId}`, {method: "DELETE"}, {queueItemId})

export const upload = (
    formData: FormData,
    onProgress?: (event: AxiosProgressEvent) => void
) => {
    return axios.post(`${API_BASE}/audio/upload`, formData, {
        onUploadProgress: onProgress,
        withCredentials: true
    });
};

export const getCurrentRoomState = (roomId: number) => apiFetchJson(`/audio/room/${roomId}/playback-state`);
export const getRoomsList = () => apiFetchJson(`/audio/room/all`)
export const createRoom = () => apiFetch(`/audio/room`, {method: "POST"})