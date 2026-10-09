import { IAudio, IAudioUpdate, audioService } from "@audio";
import { useEffect, useState } from "react";
import styles from "./AudioFileModal.module.scss"
import Modal from "@/components/ui/Modal/Modal";

/**
 * AudioFileModal is modal to view and edit data of audiofiles
 * 
 * @param audioFile data to edit 
 * @param onClose void to close modal 
 */
const AudioFileModal = ({ 
    audioFile, onClose
}: { 
    audioFile: IAudio | null, 
    onClose: () => void
}) => {

    // turns on/off editMode, that switches view to readonly and editable 
    const [editMode, setEditMode] = useState<boolean>(false);

    // data to edit
    const [title, setTitle] = useState<string>(audioFile?.title || "");
    const [album, setAlbum] = useState<string>(audioFile?.album || "");
    const [artist, setArtist] = useState<string>(audioFile?.artist || "");
    const [coverUrl, setCoverUrl] = useState<string>(audioFile?.coverUrl || "");

    const save = async () => {
        if (!audioFile) return;
        const audioUpdate: IAudioUpdate = {
            title: title,
            album: album,
            artist: artist,
            coverUrl: coverUrl
        }
        await audioService.updateAudio(audioFile.id, audioUpdate);
    }

    return (
        <Modal
            isOpen={!!audioFile} 
            onClose={onClose} 
            title={`Info of track: ${audioFile?.title || audioFile?.name}`}
        >
            <div className={styles.section}>
                <span className={styles.label}>Title:</span> 
                {editMode ? (
                    <input
                        className={styles.editable}
                        value={title || ""} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder={audioFile?.title}
                    />
                ) : ( 
                    <span className={styles.editable}>
                        {title || "Unknown"}
                    </span> 
                )}
            </div>
            <div className={styles.section}>
                <span className={styles.label}>Artist: </span> 
                {editMode ? (
                    <input
                        className={styles.editable}
                        value={artist || ""} 
                        onChange={(e) => setArtist(e.target.value)} 
                        placeholder={audioFile?.artist}
                    />
                ) : ( 
                    <span className={styles.editable}>
                        {artist || "Unknown"}
                    </span> 
                )}
            </div>
            <div className={styles.section}>
                <span className={styles.label}>Album:</span> 
                {editMode ? (
                    <input
                        className={styles.editable}
                        value={album || ""} 
                        onChange={(e) => setAlbum(e.target.value)} 
                        placeholder={audioFile?.album}
                    />
                ) : ( 
                    <span className={styles.editable}>
                        {album || "Unknown"}
                    </span> 
                )}
            </div>
            <div className={styles.section}>
                <span className={styles.label}>Cover URL:</span> 
                {editMode ? (
                    <input
                        className={styles.editable}
                        value={coverUrl || ""} 
                        onChange={(e) => setCoverUrl(e.target.value)} 
                        placeholder={audioFile?.coverUrl}
                    />
                ) : ( 
                    <span className={styles.editable}>
                        {coverUrl || "Unknown"}
                    </span> 
                )}
            </div>
            {editMode ? (
                <button className={styles.submitBtn} onClick={save}>Save</button>
            ) : (
                <button className={styles.submitBtn} onClick={() => setEditMode(true)}>Edit</button>
            )}
        </Modal>
    )
}

export default AudioFileModal;