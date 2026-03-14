import { useCallback, useEffect, useState } from "react"
import { audioService } from ".";
import { IListeningRoom } from "@/lib/types";

export const useCurrentRoom = () => {
    const [room, setRoom] = useState<IListeningRoom | null>(null);

    const addToQueue = useCallback(async (audioId: number) => {
        if (!room) return;
        const data = await audioService.addToQueue(room.id, audioId);
        setRoom(p => {
            if (!p) return p;
            return {
                ...p,
                queue: [...p.queue, data] // добавляем новый элемент в конец массива
            };
        });
    }, [room])

    useEffect(() => {
        async function loadRoom() {
            const data = await audioService.loadCurrentRoom();
            setRoom(data);
        }
    
        loadRoom();
    }, [])

    return { room, addToQueue }
}