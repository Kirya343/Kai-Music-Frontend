import { audioService, IAudio } from "@audio";
import { useWebSocket } from "@websocket";
import { useCallback, useEffect, useState } from "react";

/**
 * Manages the list of user's audio tracks, initializes it from localStorage,
 * synchronizes it with the server, and provides methods for managing
 * audio data.
 */
export const useAudioData = () => {

    const { addOnConnectHandler } = useWebSocket();

    const [audios, setAudios] = useState<IAudio[]>(() => {
        const saved = localStorage.getItem("audios");

        return saved ? JSON.parse(saved) : [];
    });

    /**
     * synchronizes list of audios with the server  
     */
    const syncAudios = useCallback(async () => {
        try {
            const res = await audioService.loadLibrary();
            setAudios(res.data)
        } finally {
            
        }
    }, [])

    /**
     * deletes audio from server
     */
    const deleteAudio = useCallback(async (audio: IAudio) => {
        const success = confirm(`Ary you sure deleting audio ${audio.name}`)

        if (success) {
            try {
                await audioService.deleteAudio(audio.id)
            } catch (e) {
                console.error(e)
            }
        }
    }, [])

    /**
     * updates audio metadata on server
     */
    const updateAudio = useCallback((audio: IAudio) => {
        setAudios(prev => {
            const exists = prev.some(a => a.id === audio.id);

            if (exists) {
                return prev.map(a =>
                    a.id === audio.id
                        ? audio
                        : a
                );
            }

            return [...prev, audio];
        });
    }, [setAudios]);

    // updates audio-list in localstorage
    useEffect(() => {
        if (audios) localStorage.setItem("audios", JSON.stringify(audios));
    }, [audios]);

    useEffect(() => {
        const unsubscribe = addOnConnectHandler((client) => {

            const audioInfoSub = client.subscribe(`/user/queue/audios`, (message) => {
                updateAudio(JSON.parse(message.body));
            });

            return () => {
                audioInfoSub.unsubscribe();
            }
        });

        return unsubscribe;
    }, [addOnConnectHandler]);
    
    return { data: audios, syncAudios, deleteAudio, updateAudio}
}