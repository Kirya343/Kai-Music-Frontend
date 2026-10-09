import { roomService } from "@room";
import { Dispatch, SetStateAction, useState } from "react";
import styles from "./JoinRoomModal.module.scss"
import Modal from "@/components/ui/Modal/Modal";
import { useNavigate } from "react-router-dom";

/**
 * JoinRoomModal is modal for join to any room
 * 
 * @param isOpen boolean to view modal 
 * @param setOpen void to switch view
 */
const JoinRoomModal = ({ 
    isOpen, setOpen
}: { 
    isOpen: boolean, 
    setOpen: Dispatch<SetStateAction<boolean>>
}) => {

    const navigate = useNavigate();

    // room code to join
    const [code, setCode] = useState<string>("");

    /**
     * void to join room, tries to join, then navigates to room if joining was successful
     */
    const joinRoom = async () => {
        try {
            await roomService.joinRoom(code);
            navigate("/room");
        } catch (e) {
            console.error(e)
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