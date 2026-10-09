import { useCallback, useEffect, useState } from "react";
import { CreatePlaylist, Playlist } from "../playlistTypes";
import { playlistService } from "../services";
import { useWebSocket } from "@websocket";
import { IQueueItem } from "@playback";

export const usePlaylistsData = () => {
    
    const { addOnConnectHandler } = useWebSocket();

    const [playlists, setPlaylists] = useState<Playlist[]>(() => {
        const saved = localStorage.getItem("playlists");

        return saved ? JSON.parse(saved) : [];
    });

    const syncPlaylists = useCallback(async () => {
        try {
            const res = await playlistService.loadPlaylists();
            setPlaylists(res.data);
        } finally {

        }
    }, [setPlaylists])

    const updatePlaylist = useCallback((playlist: Playlist) => {
        setPlaylists(prev => {
            const exists = prev.some(pl => pl.id === playlist.id);

            if (exists) {
                return prev.map(pl =>
                    pl.id === playlist.id
                        ? playlist
                        : pl
                );
            }

            return [...prev, playlist];
        });
    }, [setPlaylists]);

    const deletePlaylist = useCallback(async (playlist: Playlist) => {
        const success = confirm(`Ary you sure deleting playlist ${playlist.title}`)

        if (success) {
            try {
                await playlistService.deletePlaylist(playlist.id)
            } catch (e) {
                console.error(e)
            }
        }
    }, [])

    const createPlaylist = useCallback(async (playlist: CreatePlaylist) => {
        try {
            await playlistService.createPlaylist(playlist)
        } catch (e) {
            console.error(e)
        }
    }, [])

    const importToRoom = useCallback(async (importPlaylist: Playlist, targetPlaylist: Playlist) => {

        if (!targetPlaylist?.id) return;

        const success = confirm(`Ary you sure replace playlist in room?`)

        if (success) {
            await playlistService.importToRoom(importPlaylist.id, targetPlaylist.id)
        }
    }, [])

    const removeAudio = async (playlistId: number, queueItem: IQueueItem) => {
        if (!playlistId) return;
        try {
            await playlistService.removeFromQueue(playlistId, [queueItem.id])
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        localStorage.setItem("playlists", JSON.stringify(playlists));
    }, [playlists]);

    useEffect(() => {
        const unsubscribe = addOnConnectHandler((client) => {

            const playlistSub = client.subscribe(`/user/queue/playlists`, (message) => {
                updatePlaylist(JSON.parse(message.body));
            });

            return () => {
                playlistSub.unsubscribe();
            }
        });

        return unsubscribe;
    }, [addOnConnectHandler]);
    
    return { 
        data: playlists, 
        syncPlaylists,
        deletePlaylist,
        createPlaylist,
        importToRoom,
        removeAudio
    }
}