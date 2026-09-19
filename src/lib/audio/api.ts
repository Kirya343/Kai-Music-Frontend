import axios, { AxiosProgressEvent } from "axios";
import { apiFetch, apiFetchJson } from "@/lib/common/utils/apiClient";
import { API_BASE } from "@/config";
import { IAudioUpdate } from "@/lib/audio/audioTypes";

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