import { apiFetch, apiFetchJson } from "@common";
import { IRoomUpdate } from "@room";

export const loadCurrentRoom = () => apiFetchJson("/room")

export const getCurrentRoomState = (roomId: number) => apiFetchJson(`/room/${roomId}/playback-state`);
export const getRoomsPage = () => apiFetchJson(`/room/list/page`)
export const createRoom = () => apiFetch(`/room`, {method: "POST"})
export const joinRoom = (code: string) => apiFetch(`/room/join`, {method: "POST"}, {code})
export const leaveRoom = () => apiFetch(`/room/leave`, {method: "POST"})

export const updateRoom = (roomId: number, room: IRoomUpdate) => 
    apiFetch(`/room/${roomId}`, 
        {
            method: "PATCH", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(room)
        })