import { audioService } from "@audio/audioService";
import { IAudio } from "@audio/audioTypes";
import { useWebSocket } from "@websocket";
import { useCallback, useEffect, useState } from "react";

export const useAudioData = () => {

    const { addOnConnectHandler } = useWebSocket();

    const [audios, setAudios] = useState<IAudio[]>(() => {
        const saved = localStorage.getItem("audios");

        return saved ? JSON.parse(saved) : [];
    });

    const syncAudios = useCallback(async () => {
        try {
            const data = await audioService.loadLibrary();
            setAudios(data)
        } finally {

        }
    }, [])

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
    
    return { audios, syncAudios}
}