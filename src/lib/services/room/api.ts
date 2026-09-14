import { PlaybackMode } from "@/components/ui/player/PlaybackModeToggle";
import { apiFetch, apiFetchJson } from "../utils/apiClient";
import { IRoomUpdate } from "@/lib/types";

export const loadCurrentRoom = () => apiFetchJson("/room")
export const setRoomPlaybackMode = (roomId: number, mode: PlaybackMode) => apiFetch(`/room/${roomId}/mode`, {method: "PATCH"}, {mode})

export const addToQueue = (roomId: number, audioId: number) => apiFetchJson(`/room/${roomId}/queue`, {method: "PATCH"}, {audioId})
export const removeFromQueue = (roomId: number, queueItemId: number) => apiFetch(`/room/${roomId}/queue`, {method: "DELETE"}, {queueItemId})

export const getCurrentRoomState = (roomId: number) => apiFetchJson(`/room/${roomId}/playback-state`);
export const getRoomsPage = () => apiFetchJson(`/room/list/page`)
export const createRoom = () => apiFetch(`/room`, {method: "POST"})
export const joinRoom = (code: string) => apiFetch(`/room/join`, {method: "POST"}, {code})

export const updateRoom = (roomId: number, room: IRoomUpdate) => 
    apiFetch(`/room/${roomId}`, 
        {
            method: "PATCH", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(room)
        }, {})