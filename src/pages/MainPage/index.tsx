import PlusIcon from "@/components/icons/PlusIcon";
import styles from "./MainPage.module.scss";
import { IShortRoom, useListeningRoom, userService } from "@/lib";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { audioService } from "@/lib/services/audio";
import UserIcon from "@/components/icons/UserIcon";
import AudioPlayerOpener from "@/components/ui/player/AudioPlayerOpener/AudioPlayerOpener";

const MainPage = () => {

    const { room, loadRoom, roomLoaded } = useListeningRoom();
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
        <>
            <div className={styles.header}>
                <span>Комнаты</span>
                <button onClick={() => createRoom()}>
                    <PlusIcon/>
                </button>
            </div>
            <div className={styles.list}>
                {rooms?.map(r => (
                    <div 
                        key={r.id}
                        className={`${styles.room} ${r.id == room?.id ? styles.active : ""}`} 
                        onClick={() => onSelect(r.id)}
                    >
                        <span>#{r.id}</span>
                        <span>{r.title}</span>
                        <div className={styles.users}><span>{r.membersCount}</span><UserIcon/></div>
                    </div>
                ))}
            </div>

            {roomLoaded && <AudioPlayerOpener />}
        </>
    )
}

export default MainPage;