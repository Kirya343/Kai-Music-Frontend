import axios, { AxiosProgressEvent } from "axios";
import { apiFetch, apiFetchJson } from "@common";
import { API_BASE } from "@/config";
import { IAudioUpdate } from "@audio";

export const loadAudioInfo = (entryId: number) => apiFetchJson(`/audio/${entryId}/info`)
export const loadLibrary = () => apiFetchJson("/audio/library")

export const upload = (
    formData: FormData,
    onProgress?: (event: AxiosProgressEvent) => void
) => {
    return axios.post(`${API_BASE}/audio/upload`, formData, {
        onUploadProgress: onProgress,
        withCredentials: true
    });
};

export const updateAudio = (audioId: number, audio: IAudioUpdate) => 
    apiFetch(`/audio/${audioId}`, 
        {
            method: "PATCH", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(audio)
        }, {})

export const deleteAudio = (audioId: number) => apiFetch(`/audio/${audioId}`, { method: "DELETE" })
export const recognizeAudio = (audioId: number) => apiFetchJson(`/audio/recognize/${audioId}`, { method: "POST" })
