import { useRoomPlayback } from "@room";
import { audioService, IAudio } from "@audio";
import { useCallback, useEffect, useState } from "react";
import styles from "./LibraryPage.module.scss"
import CirclePlusIcon from "@/components/icons/CirclePlusIcon";
import PlaylistIcon from "@/components/icons/PlaylistIcon";
import HeartIcon from "@/components/icons/HeartIcon";
import { AxiosProgressEvent } from "axios";
import CheckmarkIcon from "@/components/icons/CheckmarkIcon";
import CrossIcon from "@/components/icons/CrossIcon";
import Loader from "@/components/ui/Loader/Loader";
import AudioFileModal from "@/components/pages/library/AudioFileModal/AudioFileModal";
import TrashIcon from "@/components/icons/TrashIcon";
import AudioPlayerOpener from "@/components/ui/player/AudioPlayerOpener/AudioPlayerOpener";
import PenIcon from "@/components/icons/PenIcon";
import ShazamIcon from "@/components/icons/ShazamIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import Track from "@/components/ui/Track/Track";

interface IUploadingAudio {
    file: File;
    progress: number;
    id: string; // временный id
    success?: boolean
}

const LibraryPage = () => {

    const [audios, setAudios] = useState<IAudio[] | null>(null);
    const [uploading, setUploading] = useState<IUploadingAudio[]>([]);
    const [audioFileView, setAudioFileView] = useState<IAudio | null>(null);

    const { roomLoaded } = useRoomPlayback();

    const recognizeAudio = async (audio: IAudio) => {
        const updatedAudio: IAudio = await audioService.recognizeAudio(audio.id)

        console.log("recognition result:", updatedAudio)

        setAudios(prev =>
            prev?.map(item =>
                item.id === updatedAudio.id
                    ? updatedAudio
                    : item
            ) ?? ([updatedAudio])
        );
    }

    const handleDelete = async (audio: IAudio) => {
        const success = confirm(`Ary you sure deleting audio ${audio.name}`)

        if (success) {
            try {
                await audioService.deleteAudio(audio.id)
                audios?.filter(a => a.id == audio.id);
            } catch (e) {
                console.error(e)
            }
        }
    }

    const { addToQueue } = useRoomPlayback();

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

        const fileList = Array.from(files);

        let identifiedList: { id: string, file: File}[] = [];

        for (const file of fileList) {
            const uploadId = `${file.name}-${Date.now()}`;

            setUploading(prev => [
                ...prev,
                {
                    id: uploadId,
                    file,
                    progress: 0
                }
            ]);

            identifiedList.push({id: uploadId, file})
        }

        for (const fileItem of identifiedList) {

            const file = fileItem.file;

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
                            item.id === fileItem.id
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
                        item.id === fileItem.id
                            ? { ...item, success: false }
                            : item
                    )
                );
            }
        }

        loadLibrary();
    };

    return (
        <>
            <div className={styles.library}>
                <h1 className={styles.header}>Track Library</h1>
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

                {uploading.length > 0 && (
                    <>
                        <div className={styles.uploadingStat}>
                            <span>Uploaded: <strong>{uploading.filter(a => a.progress == 100).length}/{uploading.length}</strong></span>
                            <span>||</span>
                            <span>Success: <strong>{uploading.filter(a => a.success && a.progress == 100).length}</strong></span>
                            <span>||</span>
                            <span>Failed: <strong>{uploading.filter(a => !a.success && a.progress == 100).length}</strong></span>
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
                    </>
                )}

                <Loader loadingActive={!audios}>
                    <div className={styles.trackList}>
                        {audios?.map((audio, idx) => (
                            <Track
                                key={audio.id}
                                audio={audio}
                                id={idx + 1}
                                extraActions={[
                                    {
                                        icon: <PlusIcon/>,
                                        title: "Add to Room",
                                        func: () => addToQueue([{audioId: audio.id}])
                                    },
                                    {
                                        icon: <ShazamIcon/>,
                                        title: "Autofill info with Shazam",
                                        func: () => recognizeAudio(audio)
                                    },
                                    {
                                        icon: <PenIcon/>,
                                        title: "Edit audio info",
                                        func: () => setAudioFileView(audio)
                                    },
                                    {
                                        icon: <TrashIcon/>,
                                        title: "Delete from library",
                                        func: () => handleDelete(audio)
                                    }
                                ]}
                            />
                        ))}
                    </div>
                </Loader>

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

            {roomLoaded && <AudioPlayerOpener />}
        </>
    )
}

export default LibraryPage;