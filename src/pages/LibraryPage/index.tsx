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
import { useNavigate, useSearchParams } from "react-router-dom";
import MusicNoteIcon from "@/components/icons/MusicNoteIcon";
import { countPosition } from "@/lib/services/utils/interfaceFunctions";
import Loader from "@/components/ui/Loader/Loader";
import AudioFileModal from "@/components/pages/library/AudioFileModal/AudioFileModal";
import { useGlobal } from "@/lib/contexts/GlobalContext";

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
    const navigate = useNavigate()

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

        navigate("/room");
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
                <label htmlFor="uploadAudio" className={styles.action}>
                    <CirclePlusIcon solid />
                    <span className={styles.subtitle}>Upload new</span>
                </label>
                <button className={styles.action}>
                    <PlaylistIcon />
                    <span className={styles.subtitle}>Playlists</span>
                </button>
                <button className={styles.action}>
                    <HeartIcon filled={false}/>
                    <span className={styles.subtitle}>Favorite</span>
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

            <Loader loadingActive={!audios}>
                <div className={styles.trackList}>
                    {audios?.map(audio => (
                        <div 
                            key={audio.id} 
                            className={styles.track} 
                            onClick={() => handleClick(audio.id)}
                        >
                            {roomTopUpMode && (
                                <input
                                    type="checkbox"
                                    checked={selectedTracks.includes(audio.id)}
                                    readOnly
                                />
                            )}

                            <div className={styles.audioCover}>
                                <MusicNoteIcon/>
                            </div>

                            <div className={styles.meta}>
                                <span className={styles.id}>#{audio.id}</span>
                                <span className={styles.name}>{audio?.title ?? audio?.name}</span>
                                <span className={styles.artist}>{audio?.artist || "Unknown artist"}</span>
                                <span className={styles.info}>
                                    {audio?.album && (<>{audio?.album} • </>)}
                                    {audio?.duration && (<>{countPosition(audio?.duration)}</>)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </Loader>

            {roomTopUpMode && selectedTracks.length > 0 && (
                <div className={styles.roomTopUpActions}>
                    {roomId && (
                        <button 
                            onClick={addSelectedToRoom}
                            className={styles.listAction}
                        >
                            Add to room #{roomId}
                        </button>
                    )}

                    <button 
                        onClick={() => setSelectedTracks([])}
                        className={styles.listAction}
                    >
                        Clean list
                    </button>

                    <button 
                        onClick={() =>  {
                            setRoomTopUpMode(false)
                            setSelectedTracks([])
                        }}
                        className={styles.listAction}
                    >
                        Cancel
                    </button>
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