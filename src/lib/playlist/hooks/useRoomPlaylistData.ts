import { useEffect, useState } from "react";
import { Playlist } from "../playlistTypes";
import { useWebSocket } from "@websocket";

export const useRoomPlaylistData = () => {
    
    const { addOnConnectHandler } = useWebSocket();

    const [roomPlaylist, setRoomPlaylist] = useState<Playlist | null>(() => {
        const saved = localStorage.getItem("roomPlaylist");

        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        localStorage.setItem("roomPlaylist", JSON.stringify(roomPlaylist));
    }, [roomPlaylist]);

    useEffect(() => {
        const unsubscribe = addOnConnectHandler((client) => {

            const playlistSub = client.subscribe(`/user/queue/playlist.room`, (message) => {
                setRoomPlaylist(JSON.parse(message.body));
            });

            return () => {
                playlistSub.unsubscribe();
            }
        });

        return unsubscribe;
    }, [addOnConnectHandler]);
    
    return { roomPlaylist, setRoomPlaylist }
}