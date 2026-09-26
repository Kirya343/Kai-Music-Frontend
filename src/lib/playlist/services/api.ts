import { PlaybackMode } from "@/components/ui/player/PlaybackModeToggle";
import { apiFetch } from "@common";

export const setPlaylistPlaybackMode = (playlistId: number, mode: PlaybackMode) => apiFetch(`/playlist/${playlistId}/mode`, {method: "PATCH"}, {mode})