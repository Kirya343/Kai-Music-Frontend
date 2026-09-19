import { useListeningRoom } from "@/lib";
import { Dispatch, SetStateAction, useState } from "react";
import styles from "./JoinRoomModal.module.scss"
import Modal from "@/components/ui/Modal/Modal";
import { useNavigate } from "react-router-dom";
import { roomService } from "@/lib/old/services/room";

const JoinRoomModal = ({ 
    isOpen, setOpen
}: { 
    isOpen: boolean, 
    setOpen: Dispatch<SetStateAction<boolean>>
}) => {

    const [code, setCode] = useState<string>("");
    const { loadRoom } = useListeningRoom();
    const navigate = useNavigate();

    const joinRoom = async () => {
        try {
            await roomService.joinRoom(code);
        } finally {
            loadRoom();
            navigate("/room");
        }
    }

    return (
        <Modal
            isOpen={isOpen} 
            onClose={() => setOpen(false)} 
            title={`Enter room code:`}
        >
            <input
                className={styles.input}
                value={code || ""} 
                onChange={(e) => setCode(e.target.value)} 
                placeholder={"CFOD34"}
            />
            <button className={styles.join} onClick={joinRoom}>Join room</button>
        </Modal>
    )
}

export default JoinRoomModal;