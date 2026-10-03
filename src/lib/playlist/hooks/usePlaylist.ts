import { useCallback, useEffect, useMemo, useState } from "react";
import { Playlist } from "../playlistTypes";
import { playlistService } from "../services";
import { useSearch } from "@common/utils/hooks/useSearch";
import { audioService, IAudio } from "@audio";
import { IQueueItem } from "@playback";

export const usePlaylist = (playlistId: number) => {

    const [playlist, setPlaylist] = useState<Playlist | null>(null);

    const queue = useMemo<IQueueItem[]>(() => {
        if (!playlist?.queue) return []

        return playlist?.queue
    }, [playlist?.queue])

    const [loading, setLoading] = useState<boolean>(true);
    
    const { filteredList, searchQuery, setSearchQuery } = useSearch(queue);

    const syncPlaylist = useCallback(async () => {
        try {
            const data = await playlistService.loadPlaylistById(playlistId);
            setPlaylist(data)
        } finally {
            setLoading(false)
        }
    }, [playlistId])

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
            setPlaylist(prev => {
                if (!prev) {
                    return prev;
                }

                return {
                    ...prev,
                    queue: prev.queue.filter(
                        item => item.id !== queueItem.id
                    )
                };
            });
        } catch (e) {
            console.error(e)
        }
    }, [playlist?.id, setPlaylist])

    useEffect(() => {
        syncPlaylist()
    }, []);

    const recognizeAudio = useCallback(async (audio: IAudio) => {
        const updatedAudio: IAudio = await audioService.recognizeAudio(audio.id)

        console.log("recognition result:", updatedAudio)

        updateAudio(updatedAudio);
    }, [])

    const updateAudio = useCallback((audio: IAudio) => {
        setPlaylist(prev => {
            if (!prev) {
                return prev;
            }

            return {
                ...prev,
                queue: prev.queue.map(item =>
                    item.audio.id === audio.id
                        ? { ...item, audio }
                        : item
                )
            };
        });
    }, [setPlaylist]);

    return {  
        loading, setSearchQuery,
        searchQuery, filteredList, 
        importToRoom, pagePlaylist: playlist,
        recognizeAudio, updateAudio,
        removeAudio
    };
}