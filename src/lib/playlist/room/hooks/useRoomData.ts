import { IListeningRoom } from "@room";
import { useEffect, useState } from "react";

export const useRoomData = () => {
    const [room, setRoom] = useState<IListeningRoom | null>(() => {
        const saved = localStorage.getItem("room");

        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        localStorage.setItem("room", JSON.stringify(room));
    }, [room]);
    
    return { room, setRoom }
}