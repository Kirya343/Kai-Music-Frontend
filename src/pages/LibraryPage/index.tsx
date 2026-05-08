import { IAudio, useListeningRoom } from "@/lib";
import { audioService } from "@/lib/services/audio";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./LibraryPage.module.scss"
import CirclePlusIcon from "@/components/icons/CirclePlusIcon";
import PlaylistIcon from "@/components/icons/PlaylistIcon";
import HeartIcon from "@/components/icons/HeartIcon";
import { AxiosProgressEvent } from "axios";
import CheckmarkIcon from "@/components/icons/CheckmarkIcon";
import CrossIcon from "@/components/icons/CrossIcon";
import { useSearchParams } from "react-router-dom";
import AudioFileModal from "@/components/ui/library/AudioFileModal/AudioFileModal";

interface IUploadingAudio {
    file: File;
    progress: number;
    id: string; // временный id
    success?: boolean
}

const LibraryPage = () => {

    const [audios, setAudios] = useState<IAudio[] | null>(null);
    const [selectedTracks, setSelectedTracks] = useState<number[]>([])
    const [uploading, setUploading] = useState<IUploadingAudio[]>([]);
    const [roomTopUpMode, setRoomTopUpMode] = useState<boolean>(false);
    const [searchParams] = useSearchParams();
    const [audioFileView, setAudioFileView] = useState<IAudio | null>(null);
    const roomId = searchParams.get("roomId");

    useEffect(() => {
        if (roomId) setRoomTopUpMode(true);
    }, [roomId]);

    const handleClick = (id: number) => {
        if (roomTopUpMode) {
            setSelectedTracks(prev =>
                prev?.includes(id)
                    ? prev.filter(trackId => trackId !== id)
                    : [...prev, id]
            );
        } else {
            const audio = audios?.find(a => a.id == id);
            console.log("audio для просмотра: ", audio)
            setAudioFileView(audio || null)
        }
    };

    const { addToQueue } = useListeningRoom();

    const addSelectedToRoom = () => {
        if (selectedTracks.length < 1) return;
        
        for (const trackId of selectedTracks) {
            addToQueue(trackId)
            setSelectedTracks(prev => prev.filter(id => id !== trackId))
        }
    }

    const loadLibrary = useCallback(async () => {
        const data = await audioService.loadLibrary();
        setAudios(data)
    }, [])

    useEffect(() => {
        loadLibrary()
    }, []);

    const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (!files) return;

        const fileArray: File[] = Array.from(files);

        for (const file of fileArray) {

            const uploadId = `${file.name}-${Date.now()}`;

            setUploading(prev => [
                ...prev,
                {
                    id: uploadId,
                    file,
                    progress: 0
                }
            ]);

            const formData = new FormData();
            formData.append("file", file);

            try {
                await audioService.upload(formData, (progressEvent: AxiosProgressEvent) => {
                    if (!progressEvent.total) return;

                    const percent = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );

                    setUploading(prev =>
                        prev.map(item =>
                            item.id === uploadId
                                ? {
                                    ...item,
                                    progress: percent,
                                    success: percent >= 100 ? true : undefined
                                }
                                : item
                        )
                    );
                });
            } catch (error) {
                setUploading(prev =>
                    prev.map(item =>
                        item.id === uploadId
                            ? { ...item, success: false }
                            : item
                    )
                );
            }

            // удаляем после загрузки
            /* setUploading(prev => prev.filter(item => item.id !== uploadId)); */
        }

        loadLibrary();
    };

    return (
        <div className={styles.library}>
            <h1 className={styles.header}>Библиотека треков</h1>
            <div className={styles.topPanel}>
                <label htmlFor="uploadAudio" className={styles.action} style={{backgroundColor: "#215f3d"}}>
                    <CirclePlusIcon />
                    <span className={styles.subtitle}>Загрузить</span>
                </label>
                <button className={styles.action} style={{backgroundColor: "#40125a"}}>
                    <PlaylistIcon />
                    <span className={styles.subtitle}>Плейлисты</span>
                </button>
                <button className={styles.action} style={{backgroundColor: "#6d2652"}}>
                    <HeartIcon filled={false}/>
                    <span className={styles.subtitle}>Избранное</span>
                </button>
            </div>

            <div className={styles.uploadingList}>
                {uploading.map(item => (
                    <div key={item.id} className={styles.uploadItem}>
                        <div className={styles.progressBar} style={{ width: `${item.progress}%` }}/>
                        <span>{item.file.name}</span>
                        <span className={styles.percent}>{item.progress}%</span>
                        {item.success && <CheckmarkIcon className={`${styles.status} ${styles.success}`} />}
                        {item.success === false && <CrossIcon className={`${styles.status} ${styles.error}`} />}
                    </div>
                ))}
            </div>

            <div className={styles.trackList}>
                {audios?.map(audio => (
                    <div 
                        key={audio.id} className={styles.track} 
                        onClick={() => handleClick(audio.id)}
                    >
                        {roomTopUpMode && (
                            <input
                                type="checkbox"
                                checked={selectedTracks.includes(audio.id)}
                                readOnly
                            />
                        )}
                        <span className={styles.trackId}>#{audio.id}</span>
                        <span className={styles.trackName}>{audio?.title ?? audio?.name}</span>
                    </div>
                ))}
            </div>

            {roomTopUpMode && selectedTracks.length > 0 && (
                <div className={styles.roomTopUpActions}>
                    {roomId && <button 
                        onClick={addSelectedToRoom}
                        style={{backgroundColor: "#1f4e21"}}
                    >Добавить в комнату #{roomId}</button>}
                    <button 
                        style={{backgroundColor: "#156451"}}
                        onClick={() => setSelectedTracks([])}
                    >Очистить список</button>
                    <button 
                        style={{backgroundColor: "#58161f"}}
                        onClick={() =>  {
                            setRoomTopUpMode(false)
                            setSelectedTracks([])
                        }}
                    >Отменить</button>
                </div>
            )}

            <input 
                type="file"
                accept="audio/*"
                id="uploadAudio"
                className={styles.uploadAudio}
                multiple
                onChange={handleAudioUpload}
            />

            <AudioFileModal audioFile={audioFileView} setAudioFile={setAudioFileView} setAudios={setAudios}/>
        </div>
    )
}

export default LibraryPage;