import { useCallback, useEffect, useState } from "react";
import { Playlist } from "../playlistTypes";
import { playlistService } from "../services";
import { useWebSocket } from "@websocket";

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
    }, [])

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
    
    return { playlists, syncPlaylists }
}