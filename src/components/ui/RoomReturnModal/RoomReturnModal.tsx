import { useEffect, useState } from "react";
import styles from "./RoomReturnModal.module.scss"
import { useNavigate } from "react-router-dom";
import { IShortRoom, roomService } from "@room";
import Modal from "../Modal/Modal";

const RoomReturnModal = () => {

    const [room, setRoom] = useState<IShortRoom | null>(null);
    const navigate = useNavigate();

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

    const joinRoom = async () => {
        if (!room?.code) return;
        try {
            await roomService.joinRoom(room.code);
        } finally {
            navigate("/room");
            setRoom(null);
        }
    }

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