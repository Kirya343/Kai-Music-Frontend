import { createApi } from "@common";
import { IPlaybackState } from "@playback";

const playbackApi = createApi("/playback")

/**
 * Retrieves current playback state of room
 *  
 * @param roomId - ID of the room.
 */
export const getCurrentRoomState = (roomId: number) => playbackApi.get<IPlaybackState>(`/${roomId}/playback-state`);

/**
 * Changes track in playback.
 *
 * @param roomId - ID of the room.
 * @param track - ID of the track, or "prev" or "next"
 */
export const playTrack = (roomId: number, track: "next" | "prev" | number) => 
    playbackApi.post<void>(`/${roomId}/change-track`, {}, { params: { changing: String(track) }});

/**
 * Updates state of playback in room.
 *
 * @param roomId - ID of the room.
 * @param state - is playback state
 */
export const updateTrackPosition = (roomId: number, state: IPlaybackState) => 
    playbackApi.post<void>(`/${roomId}/update-state`, state);