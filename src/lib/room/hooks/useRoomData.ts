import { useEffect, useState } from "react";
import { IListeningRoom } from "@room/roomTypes";
import { useWebSocket } from "@websocket";

export const useRoomData = () => {

    const { addOnConnectHandler } = useWebSocket();

    const [room, setRoom] = useState<IListeningRoom | null>(() => {
        const saved = localStorage.getItem("room");

        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        localStorage.setItem("room", JSON.stringify(room));
    }, [room]);

    useEffect(() => {
        const unsubscribe = addOnConnectHandler((client) => {

            const roomSub = client.subscribe(`/user/queue/room`, (message) => {
                const room: IListeningRoom = JSON.parse(message.body);
                
                setRoom(room);
            });

            return () => {
                roomSub.unsubscribe();
            }
        });

        return unsubscribe;
    }, [addOnConnectHandler]);
    
    return { room, setRoom }
}