import { IAudio, IAudioUpdate } from "@/lib";
import Modal from "../../Modal/Modal";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import styles from "./AudioFileModal.module.scss"
import { audioService } from "@/lib/services/audio";

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
            title={`Информация о треке ${audioFile?.title || audioFile?.name}`}
        >
            <div className={styles.section}>
                <span className={styles.label}>Название:</span> 
                {editMode ? (
                    <input
                        className={styles.input}
                        value={title || ""} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder={audioFile?.title}
                    />
                ) : ( title || "отсутствует" )}
            </div>
            <div className={styles.section}>
                <span className={styles.label}>Исполнитель: </span> 
                {editMode ? (
                    <input
                        className={styles.input}
                        value={artist || ""} 
                        onChange={(e) => setArtist(e.target.value)} 
                        placeholder={audioFile?.artist}
                    />
                ) : ( album || "отсутствует" )}
            </div>
            <div className={styles.section}>
                <span className={styles.label}>Альбом:</span> 
                {editMode ? (
                    <input
                        className={styles.input}
                        value={album || ""} 
                        onChange={(e) => setAlbum(e.target.value)} 
                        placeholder={audioFile?.album}
                    />
                ) : ( artist || "отсутствует" )}
            </div>
            <div className={styles.section}>
                <span className={styles.label}>Изображение:</span> 
                {editMode ? (
                    <input
                        className={styles.input}
                        value={coverUrl || ""} 
                        onChange={(e) => setCoverUrl(e.target.value)} 
                        placeholder={audioFile?.coverUrl}
                    />
                ) : ( coverUrl || "отсутствует" )}
            </div>
            {editMode ? (
                <button className={styles.submitBtn} onClick={save}>Сохранить</button>
            ) : (
                <button className={styles.submitBtn} onClick={() => setEditMode(true)}>Изменить</button>
            )}
        </Modal>
    )
}

export default AudioFileModal;