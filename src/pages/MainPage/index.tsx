import PlusIcon from "@/components/icons/PlusIcon";
import styles from "./MainPage.module.scss";
import { IShortRoom, useListeningRoom, userService } from "@/lib";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { audioService } from "@/lib/services/audio";
import UserIcon from "@/components/icons/UserIcon";
import AudioPlayerOpener from "@/components/ui/player/AudioPlayerOpener/AudioPlayerOpener";
import clsx from "clsx";
import DoorIcon from "@/components/icons/DoorIcon";
import CirclePlusIcon from "@/components/icons/CirclePlusIcon";
import MusicNoteIcon from "@/components/icons/MusicNoteIcon";

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
            <div className={styles.layout}>
                <div className={styles.page}>
                    <div className={styles.welcome}>
                        <h1>Welcome to Kai Music</h1>
                        <p>Kai Music connects friends through shared music experiences. Create rooms, listen together, and find new tracks with your community.</p>
                    </div>

                    <div className={styles.community}>
                        <h2>Community Buzz</h2>

                        <div className={styles.statItem}>
                            {/* icon */}

                            <span>Currently Listening: <br/><strong>{/* 5 people */}</strong></span>
                        </div>

                        <div className={styles.statItem}>
                            {/* icon */}

                            <span>Total Rooms Active: <br/><strong>{/* 5 */}</strong></span>
                        </div>
                    </div>
                </div>

                <div className={clsx(styles.box, styles.sidebar)}>

                    <section className={styles.actions}>
                        <button className={styles.actionBtn}>
                            <CirclePlusIcon />
                            <span>Create New Room</span>
                        </button>

                        <button className={styles.actionBtn}>
                            <DoorIcon />
                            <span>Join a Room</span>
                        </button>
                    </section>
                    
                    <section className={styles.publicRooms}>
                        <h3>Public rooms to join</h3>

                        <div className={styles.roomsList}>

                            {rooms?.map(r => (
                                <div className={styles.room} key={r.id}>
                                    
                                    <div className={styles.audioCover}>
                                        <MusicNoteIcon/>
                                    </div>

                                    <div className={styles.meta}>
                                        <span className={styles.roomName}>{r.title}</span>
                                        <span className={styles.audioName}>Audio name</span>
                                        <span className={styles.listnersCount}>- {r.membersCount} lisners</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {roomLoaded && <AudioPlayerOpener />}
        </>
    )
}

export default MainPage;