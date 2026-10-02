import { useCallback, useEffect, useMemo, useState } from "react";
import { Playlist } from "../playlistTypes";
import { playlistService } from "../services";
import { useSearch } from "@common/utils/hooks/useSearch";
import { IAudio } from "@audio";

export const usePlaylist = (playlistId: number) => {

    const [playlist, setPlaylist] = useState<Playlist | null>(null);

    const audios = useMemo<IAudio[]>(() => {
        if (!playlist?.queue) return []

        return playlist?.queue.map(q => q.audio)
    }, [playlist?.queue])

    const [loading, setLoading] = useState<boolean>(true);
    
    const { filteredList, searchQuery, setSearchQuery } = useSearch(audios);

    const syncPlaylist = useCallback(async () => {
        try {
            const data = await playlistService.loadPlaylistById(playlistId);
            setPlaylist(data)
        } finally {
            setLoading(false)
        }
    }, [playlistId])

    const importToRoom = useCallback(async (playlist: Playlist) => {

        const success = confirm(`Ary you sure replace playlist in room?`)

        if (success) {
            await playlistService.importToRoom(playlist.id)
        }
    }, [])

    useEffect(() => {
        syncPlaylist()
    }, []);

    return {  
        loading, setSearchQuery,
        searchQuery, filteredList, 
        importToRoom
    };
}