import { IAudio, IAudioUpdate, audioService } from "@audio";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import styles from "./AudioFileModal.module.scss"
import Modal from "@/components/ui/Modal/Modal";

const AudioFileModal = ({ 
    audioFile, setAudioFile, setAudios
}: { 
    audioFile: IAudio | null, 
    setAudioFile: Dispatch<SetStateAction<IAudio | null>>,
    setAudios: Dispatch<SetStateAction<IAudio[] | null>>,
}) => {

    const [editMode, setEditMode] = useState<boolean>(false);
    const [title, setTitle] = useState<string | null>(null);
    const [album, setAlbum] = useState<string | null>("");
    const [artist, setArtist] = useState<string | null>("");
    const [coverUrl, setCoverUrl] = useState<string | null>("");

    useEffect(() => {
        setTitle(audioFile?.title || null)
        setAlbum(audioFile?.album || null)
        setArtist(audioFile?.artist || null)
        setCoverUrl(audioFile?.coverUrl || null)
        setEditMode(false);
    }, [audioFile])

    const save = async () => {
        if (!audioFile) return;
        const audioUpdate: IAudioUpdate = {
            title: title || "",
            album: album || "",
            artist: artist || "",
            coverUrl: coverUrl || ""
        }
        const res = await audioService.updateAudio(audioFile.id, audioUpdate);
        if (res.ok) {
            setAudios(prev => 
                prev ? 
                    prev.map(a => 
                        a.id == audioFile.id 
                        ? {
                            ...a,
                            title: audioUpdate.title,
                            album: audioUpdate.album,
                            artist: audioUpdate.artist,
                            coverUrl: audioUpdate.coverUrl,
                        } 
                        : a
                    )
                    : prev
            );
            setEditMode(false)
        }
    }

    return (
        <Modal
            isOpen={!!audioFile} 
            onClose={() => setAudioFile(null)} 
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