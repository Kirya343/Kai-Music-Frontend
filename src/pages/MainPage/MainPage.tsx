import styles from "./MainPage.module.scss";
import { IShortRoom, useRoomPlayback, roomService } from "@room";
import { useEffect, useState } from "react";
import AudioPlayerOpener from "@/components/ui/player/AudioPlayerOpener/AudioPlayerOpener";
import clsx from "clsx";
import { 
    CirclePlusIcon, MusicNoteIcon,
    UserGroupIcon,
    DiscIcon, DoorIcon
} from "@/assets/icons";
import JoinRoomModal from "@/components/ui/modals/JoinRoomModal/JoinRoomModal";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout/PageLayout";

const MainPage = () => {

    const { roomLoaded } = useRoomPlayback();

    const [rooms, setRooms] = useState<IShortRoom[] | null>(null);
    const [isOpen, setOpen] = useState<boolean>(false);
    const [stat, setStat] = useState<{activeListners: number, activeRooms: number} | null>(null);
    const navigate = useNavigate()

    useEffect(() => {
        async function loadPage() {
            const res = await roomService.getRoomsPage();
            setRooms(res.data.publicRooms)
            setStat({
                activeListners: res.data.activeListners,
                activeRooms: res.data.activeRooms
            })
        }

        loadPage()
    }, [])

    const createRoom = async () => {
        try {
            await roomService.createRoom();
        } finally {
            navigate("/room");
        }
    }

    const joinRoom = async (code: string) => {
        try {
            await roomService.joinRoom(code);
        } finally {
            navigate("/room");
        }
    }

    return (
        <PageLayout>
            <div className={styles.layout}>
                <div className={styles.page}>
                    <div className={styles.welcome}>
                        <h1>Welcome to Kai Music</h1>
                        <p>Kai Music connects friends through shared music experiences. Create rooms, listen together, and find new tracks with your community.</p>
                    </div>

                    <div className={styles.community}>
                        <h2>Community Buzz</h2>

                        <div className={styles.statItem}>
                            <UserGroupIcon className={styles.icon}/>
                            <span>Currently Listening: <br/><strong>{stat?.activeListners ? stat?.activeListners : 0} people</strong></span>
                        </div>

                        <div className={styles.statItem}>
                            <DiscIcon className={styles.icon}/>

                            <span>Total Rooms Active: <br/><strong>{stat?.activeRooms}</strong></span>
                        </div>
                    </div>
                </div>

                <div className={clsx(styles.box, styles.sidebar)}>

                    <section className={styles.actions}>
                        <button className={styles.actionBtn} onClick={createRoom}>
                            <CirclePlusIcon />
                            <span>Create New Room</span>
                        </button>

                        <button className={styles.actionBtn} onClick={() => setOpen(true)}>
                            <DoorIcon />
                            <span>Join a Room</span>
                        </button>
                    </section>
                    
                    <section className={styles.publicRooms}>
                        <h3>Public rooms to join</h3>

                        <div className={styles.roomsList}>

                            {rooms?.map(r => (
                                <div className={styles.room} key={r.id} onClick={() => joinRoom(r.code)}>
                                    
                                    <div className={styles.audioCover}>
                                        <MusicNoteIcon/>
                                    </div>

                                    <div className={styles.meta}>
                                        <span className={styles.roomName}>{r.title}</span>
                                        <span className={styles.audioName}>Audio name</span>
                                        <span className={styles.listnersCount}>- {r.listeners} lisners</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {roomLoaded && <AudioPlayerOpener />}

            <JoinRoomModal isOpen={isOpen} setOpen={setOpen}/>
        </PageLayout>
    )
}

export default MainPage;