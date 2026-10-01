import { useState } from "react";
import styles from "./PlaylistCreateModal.module.scss"
import Modal from "@/components/ui/Modal/Modal";
import { CreatePlaylist } from "@/lib/playlist";

const PlaylistCreateModal = ({ 
    isOpen, onClose,
    createPlaylist
}: { 
    isOpen: boolean;
    onClose: () => void;
    createPlaylist: (playlist: CreatePlaylist) => void;
}) => {

    const [title, setTitle] = useState<string>("");

    const create = () => {
        if (title.length === 0) return;

        const playlist: CreatePlaylist = { title }

        try {
            createPlaylist(playlist)
        } finally {
            setTitle("")
            onClose()
        }
    }

    return (
        <Modal
            isOpen={isOpen} 
            onClose={onClose} 
            title={`Create playlist`}
        >
            <div className={styles.section}>
                <span className={styles.label}>Title:</span> 
                <input
                    className={styles.editable}
                    value={title || ""} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder={"My playlist"}
                />
            </div>
            <button className={styles.submitBtn} onClick={create}>Create</button>
        </Modal>
    )
}

export default PlaylistCreateModal;