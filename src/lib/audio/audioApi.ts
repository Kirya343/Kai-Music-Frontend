import { AxiosProgressEvent } from "axios";
import { createApi } from "@common";
import { IAudio, IAudioUpdate } from "@audio";


const audioApi = createApi('/audio')

/**
 * Retrieves audio metadata by entry ID.
 */
export const loadAudioInfo = (entryId: number) => audioApi.get<IAudio>(`/${entryId}/info`)

/**
 * Retrieves all audio tracks available in the library.
 */
export const loadLibrary = () => audioApi.get<IAudio[]>("/library")

/**
 * Uploads an audio file.
 *
 * @param formData - Form data containing the audio file.
 * @param onProgress - Optional callback for upload progress updates.
 */
export const upload = (
    formData: FormData,
    onProgress?: (event: AxiosProgressEvent) => void
) => {
    return audioApi.post<void>(`/upload`, formData, {
        onUploadProgress: onProgress,
    });
};

/**
 * Updates audio metadata.
 *
 * @param audioId - ID of the audio track.
 * @param audio - Updated audio metadata.
 */
export const updateAudio = (audioId: number, audio: IAudioUpdate) => audioApi.patch<void>(`/${audioId}`, audio)

/**
 * Deletes an audio track.
 *
 * @param audioId - ID of the audio track.
 */
export const deleteAudio = (audioId: number) => audioApi.delete<void>(`/${audioId}`)

/**
 * Requests audio recognition.
 *
 * @param audioId - ID of the audio track to recognize.
 */
export const recognizeAudio = (audioId: number) => audioApi.post<void>(`/recognize/${audioId}`)
