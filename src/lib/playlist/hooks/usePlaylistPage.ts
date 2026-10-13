import { useMemo } from "react";
import { Playlist } from "@playlist";
import { useSearch, useData } from "@common";
import { IQueueItem } from "@playback";

export const usePlaylistPage = (playlistId: number) => {

    const { playlists } = useData();

    const playlist = useMemo<Playlist | null>(() => {
        if (!playlistId) return null;

        return playlists.data.find(p => p.id === playlistId) || null
    }, [playlists.data])

    const queue = useMemo<IQueueItem[]>(() => {
        if (!playlist?.queue) return []

        return playlist?.queue
    }, [playlist?.queue])
    
    const { filteredList, searchQuery, setSearchQuery } = useSearch(queue);

    return {  
        setSearchQuery,
        searchQuery, filteredList, 
        playlist
    };
}