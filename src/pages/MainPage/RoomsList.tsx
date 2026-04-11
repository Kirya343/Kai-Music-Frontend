import { IShortRoom, useListeningRoom, userService } from "@/lib";
import { audioService } from "@/lib/services/audio";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const RoomsList = () => {

    const { room, loadRoom } = useListeningRoom();
    const navigate = useNavigate();

    const [rooms, setRooms] = useState<IShortRoom[] | null>(null);

    useEffect(() => {
        async function loadRooms() {
            const data = await audioService.getRoomsList();
            setRooms(data)
        }

        loadRooms()
    }, [])

    const onSelect = async (roomId: number) => {
        try {
            await userService.setUserRoom(roomId);
        } finally {
            loadRoom();
            navigate("/room");
        }
    }

    const createRoom = async () => {
        try {
            await audioService.createRoom();
        } finally {
            loadRoom();
        }
    }

    return (
        <div className="box">
            <div className="box-header">
                <span className="room-name">Комнаты</span>
                <button onClick={() => createRoom()}>
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" height="24" 
                        viewBox="0 0 24 24" fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"
                    />
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                </button>
            </div>
            <div className="box-list">
                {rooms?.map(r => (
                    <div 
                        key={r.id}
                        className={`box-list-item room-item ${r.id == room?.id ? "active" : ""}`} 
                        onClick={() => onSelect(r.id)}
                    >
                        <span>#{r.id}</span>
                        <span>{r.title}</span>
                        <span>{r.membersCount}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RoomsList