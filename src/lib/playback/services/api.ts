import { apiFetchJson } from "@common";

export const getCurrentRoomState = (roomId: number) => apiFetchJson(`/playback/${roomId}/playback-state`);