import { useCallback, useEffect, useMemo, useState } from "react";
import { CreatePlaylist, Playlist } from "../playlistTypes";
import { playlistService } from "../services";
import { useSearch } from "@common/utils/hooks/useSearch";
import { useData } from "@common";

export const usePlaylists = () => {

    const { playlists } = useData();

    const { filteredList, searchQuery, setSearchQuery} = useSearch(playlists);

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

    return {  
        setSearchQuery,
        searchQuery, deletePlaylist,
        filteredList,
        createPlaylist, importToRoom
    };
}