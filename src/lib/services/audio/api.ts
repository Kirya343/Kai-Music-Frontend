import { apiFetch, apiFetchJson } from "../utils/apiClient";

export const loadCurrentRoom = () => apiFetchJson("/audio/room")
export const loadLibrary = () => apiFetchJson("/audio/library")
export const addToQueue = (roomId: number, audioId: number) => apiFetchJson(`/audio/room/${roomId}`, {method: "PATCH"}, {audioId})
export const upload = (formData: FormData) => apiFetch("/audio/upload", {method: "POST", body: formData})