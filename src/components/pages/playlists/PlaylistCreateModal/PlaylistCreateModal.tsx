import { useState } from "react";
import styles from "./PlaylistCreateModal.module.scss"
import Modal from "@/components/ui/Modal/Modal";
import { CreatePlaylist } from "@/lib/playlist";
import { useData } from "@common";

/**
 * PlaylistCreateModal is modal to create playlist
 * it collects data from user and use it to create playlist
 * 
 * @param isOpen boolean to view modal 
 * @param setOpen void to switch view
 */
const PlaylistCreateModal = ({ 
    isOpen, onClose
}: { 
    isOpen: boolean;
    onClose: () => void;
}) => {

    const { playlists } = useData();

    // new playlist title
    const [title, setTitle] = useState<string>("");

    /**
     * void that creates tries to create playlist
     * 
     * doesn't work if title is empty
     * 
     * if playlist creating is successfull, closes modal
     */
    const create = () => {
        if (title.length === 0) return;

        const playlist: CreatePlaylist = { title }

        try {
            playlists.createPlaylist(playlist)
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