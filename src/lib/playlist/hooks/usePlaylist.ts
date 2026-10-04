import { useCallback, useMemo, useState } from "react";
import { Playlist } from "../playlistTypes";
import { playlistService } from "../services";
import { useSearch } from "@common/utils/hooks/useSearch";
import { audioService, IAudio } from "@audio";
import { IQueueItem } from "@playback";
import { useData } from "@common";

export const usePlaylist = (playlistId: number) => {

    const { playlists } = useData();

    const playlist = useMemo<Playlist | null>(() => {
        if (!playlistId) return null;

        return playlists.find(p => p.id === playlistId) || null
    }, [playlists])

    const queue = useMemo<IQueueItem[]>(() => {
        if (!playlist?.queue) return []

        return playlist?.queue
    }, [playlist?.queue])
    
    const { filteredList, searchQuery, setSearchQuery } = useSearch(queue);

    const importToRoom = useCallback(async (importPlaylist: Playlist) => {

        if (!playlist?.id) return;

        const success = confirm(`Ary you sure replace playlist in room?`)

        if (success) {
            await playlistService.importToRoom(importPlaylist.id, playlist.id)
        }
    }, [playlist?.id])

    const removeAudio = useCallback(async (queueItem: IQueueItem) => {
        if (!playlist?.id) return;
        try {
            await playlistService.removeFromQueue(playlist?.id, [queueItem.id])
        } catch (e) {
            console.error(e)
        }
    }, [playlist?.id])

    return {  
        setSearchQuery,
        searchQuery, filteredList, 
        importToRoom, playlist,
        removeAudio
    };
}