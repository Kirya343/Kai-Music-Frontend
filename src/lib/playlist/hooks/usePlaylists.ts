import { useCallback, useEffect, useMemo, useState } from "react";
import { CreatePlaylist, Playlist } from "../playlistTypes";
import { playlistService } from "../services";

export const usePlaylists = () => {

    const [playlists, setPlaylists] = useState<Playlist[]>(() => {
        const saved = localStorage.getItem("playlists");

        return saved ? JSON.parse(saved) : [];
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("")

    const filteredPlaylists = useMemo<Playlist[]>(() => {
        if (!playlists) {
            return [];
        }

        const query = searchQuery.trim().toLowerCase();

        if (!query) {
            return playlists.slice().sort((a, b) => b.id - a.id);
        }

        return playlists.filter(playlist =>
            [
                playlist.id,
                playlist.title
            ].some(value =>
                String(value).toLowerCase().includes(query)
            )
        );
    }, [playlists, searchQuery]);

    const syncPlaylists = useCallback(async () => {
        try {
            const data = await playlistService.loadPlaylists();
            setPlaylists(data)
        } finally {
            setLoading(false)
        }
    }, [])

    const deletePlaylist = useCallback(async (playlist: Playlist) => {
        const success = confirm(`Ary you sure deleting playlist ${playlist.title}`)

        if (success) {
            try {
                await playlistService.deletePlaylist(playlist.id)
                setPlaylists(prev => prev?.filter(a => a.id !== playlist.id) || []);
            } catch (e) {
                console.error(e)
            }
        }
    }, [setPlaylists])

    const createPlaylist = useCallback(async (playlist: CreatePlaylist) => {
        try {
            const newPlaylist = await playlistService.createPlaylist(playlist)
            setPlaylists(prev => ([...prev, newPlaylist]));
        } catch (e) {
            console.error(e)
        }
    }, [setPlaylists])

    const importToRoom = useCallback(async (playlist: Playlist) => {

        const success = confirm(`Ary you sure replace playlist in room?`)

        if (success) {
            await playlistService.importToRoom(playlist.id)
        }
    }, [])

    const updatePlaylist = useCallback((playlist: Playlist) => {
        setPlaylists(prev =>
            prev?.map(item =>
                item.id === playlist.id
                    ? playlist
                    : item
            ) ?? ([playlist])
        );
    }, [setPlaylists])

    useEffect(() => {
        if (playlists) localStorage.setItem("playlists", JSON.stringify(playlists));
    }, [playlists]);

    useEffect(() => {
        syncPlaylists()
    }, []);

    return {  
        loading, setSearchQuery,
        searchQuery, deletePlaylist,
        updatePlaylist, filteredPlaylists,
        createPlaylist, importToRoom
    };
}