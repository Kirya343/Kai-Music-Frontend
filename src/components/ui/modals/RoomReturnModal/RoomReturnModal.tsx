import { useEffect, useState } from "react";
import styles from "./RoomReturnModal.module.scss"
import { useNavigate } from "react-router-dom";
import { IShortRoom, roomService } from "@room";
import Modal from "../../Modal/Modal";

/**
 * RoomReturnModal is component that helps to return to room that was before 
 * user left application
 */
const RoomReturnModal = () => {

    const [room, setRoom] = useState<IShortRoom | null>(null);
    const navigate = useNavigate();

    // loads room
    useEffect(() => {
        async function loadRoom() {
            try {
                const res = await roomService.loadCurrentRoom();
                setRoom(res.data);
            } catch (e) {
                console.log(e)
            }
        }

        loadRoom()
    }, [])

    /**
     * void that tries to join room
     */
    const joinRoom = async () => {
        if (!room?.code) return;
        try {
            await roomService.joinRoom(room.code);
            navigate("/room");
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * void that tries leave room
     */
    const leaveRoom = async () => {
        try {
            await roomService.leaveRoom();
        } finally {
            setRoom(null);
        }
    }

    return room?.code && (
        <Modal
            isOpen={true} 
            onClose={() => setRoom(null)}
            title={`You have left room ${room.title}`}
        >
            <div className={styles.body}>
                <button className={styles.btn} onClick={joinRoom}>Join room</button>
                <button className={styles.btn} onClick={leaveRoom}>Cancel</button>
            </div>
        </Modal>
    )
}

export default RoomReturnModal;