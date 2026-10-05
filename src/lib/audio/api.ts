import { AxiosProgressEvent } from "axios";
import { createApi } from "@common";
import { IAudio, IAudioUpdate } from "@audio";

const audioApi = createApi('/audio')

export const loadAudioInfo = (entryId: number) => audioApi.get<IAudio>(`/${entryId}/info`)
export const loadLibrary = () => audioApi.get<IAudio[]>("/library")

export const upload = (
    formData: FormData,
    onProgress?: (event: AxiosProgressEvent) => void
) => {
    return audioApi.post<void>(`/upload`, formData, {
        onUploadProgress: onProgress,
    });
};

export const updateAudio = (audioId: number, audio: IAudioUpdate) => audioApi.patch<void>(`/${audioId}`, audio)

export const deleteAudio = (audioId: number) => audioApi.delete<void>(`/${audioId}`)
export const recognizeAudio = (audioId: number) => audioApi.delete<void>(`/recognize/${audioId}`)
