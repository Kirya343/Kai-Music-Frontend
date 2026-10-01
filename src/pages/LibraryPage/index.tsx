import { useRoomPlayback } from "@room";
import { audioService, IAudio } from "@audio";
import { useMemo, useRef, useState } from "react";
import styles from "./LibraryPage.module.scss"
import CheckmarkIcon from "@/components/icons/CheckmarkIcon";
import CrossIcon from "@/components/icons/CrossIcon";
import AudioFileModal from "@/components/pages/library/AudioFileModal/AudioFileModal";
import TrashIcon from "@/components/icons/TrashIcon";
import AudioPlayerOpener from "@/components/ui/player/AudioPlayerOpener/AudioPlayerOpener";
import PenIcon from "@/components/icons/PenIcon";
import ShazamIcon from "@/components/icons/ShazamIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import Track from "@/components/ui/Track/Track";
import { useSearchParams } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
import { playlistService } from "@/lib/playlist";
import { useLibrary } from "@audio/hooks/useLibrary";
import LoadingSpinnerIcon from "@/components/icons/LoadingSpinnerIcon";
import CirclePlusIcon from "@/components/icons/CirclePlusIcon";

const LibraryPage = () => {

    const { 
        visibleAudios, loading, 
        setAudios, deleteAudio, 
        updateAudio, setSearchQuery,
        searchQuery, uploadAudios,
        uploading, filteredAudios,
        visibleCount, setVisibleCount
    } = useLibrary();

    const [audioFileView, setAudioFileView] = useState<IAudio | null>(null);
    
    const { playlist, playbackState, roomLoaded } = useRoomPlayback();

    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: visibleAudios.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 80,
        overscan: 10,

        onChange: (instance, sync) => {
            if (!sync) {
                return;
            }

            const items = instance.getVirtualItems();

            if (!items.length) {
                return;
            }

            const lastItem = items[items.length - 1];

            if (
                lastItem.index >= visibleAudios.length - 10 &&
                visibleCount < filteredAudios.length
            ) {
                setVisibleCount(count =>
                    Math.min(
                        count + 50,
                        filteredAudios.length
                    )
                );
            }
        },
    });

    const playlistAudioIds = useMemo(() => {
        return new Set(
            playlist?.queue.map(item => item.audio.id)
        );
    }, [playlist?.queue]);

    const playingAudioId = useMemo(() => {
        return playlist?.queue.find(
            item => item.id === playbackState?.entryId
        )?.audio.id;
    }, [playlist?.queue, playbackState?.entryId]);

    return (
        <>
            <div className={styles.page} ref={parentRef}>
                <h2 className={styles.header}>Library</h2>
                
                <div className={styles.sorting}>

                    <div className={styles.row}>
                        <label htmlFor="uploadAudio" className={styles.upload}>
                            <CirclePlusIcon solid />
                            <span>Upload new</span>
                        </label>

                        <input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.search}
                            placeholder="Search audios..."
                        />
                    </div>

                    {searchQuery.length != 0 && <span>Found {filteredAudios.length} audios</span>}
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
                                    <span>{item.file?.name}</span>
                                    <span className={styles.percent}>{item.progress}%</span>
                                    {item.success && <CheckmarkIcon className={`${styles.status} ${styles.success}`} />}
                                    {item.success === false && <CrossIcon className={`${styles.status} ${styles.error}`} />}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {loading && (
                    <div className={styles.synchronization}>
                        <LoadingSpinnerIcon/>
                        <span>synchronization</span>
                    </div>
                )}
                
                <div className={styles.trackList}>
                    <div
                        style={{
                            height: `${rowVirtualizer.getTotalSize()}px`,
                            position: "relative",
                        }}
                    >
                        {rowVirtualizer.getVirtualItems().map(item => {
                            const audio = visibleAudios[item.index];

                            return (
                                <div
                                    key={audio.id}
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        transform: `translateY(${item.start}px)`,
                                    }}
                                >
                                    <LibraryTrack
                                        audio={audio}
                                        id={item.index + 1}
                                        isInPlaylist={playlistAudioIds.has(audio.id)}
                                        updateAudio={updateAudio}
                                        openEditModal={setAudioFileView}
                                        handleDelete={deleteAudio}
                                        playing={playingAudioId === audio.id}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                <input 
                    type="file"
                    accept="audio/*"
                    id="uploadAudio"
                    className={styles.uploadAudio}
                    multiple
                    onChange={uploadAudios}
                />

                <AudioFileModal audioFile={audioFileView} setAudioFile={setAudioFileView} setAudios={setAudios}/>
            </div>

            {roomLoaded && <AudioPlayerOpener />}
        </>
    )
}

const LibraryTrack = ({
    audio, 
    id,
    playing,
    isInPlaylist,
    updateAudio,
    openEditModal,
    handleDelete
}: {
    audio: IAudio, 
    id: number,
    playing: boolean,
    isInPlaylist: boolean,
    updateAudio: (audio: IAudio) => void,
    openEditModal: (audio: IAudio) => void,
    handleDelete: (audio: IAudio) => void
}) => {

    const [searchParams] = useSearchParams();
    const roomId = searchParams.get("roomId");

    const recognizeAudio = async (audio: IAudio) => {
        const updatedAudio: IAudio = await audioService.recognizeAudio(audio.id)

        console.log("recognition result:", updatedAudio)

        updateAudio(updatedAudio);
    }

    const actions = roomId ? [
            {
                icon: <PlusIcon/>,
                title: "Add to Room",
                func: async () => await playlistService.addToQueue([{audioId: audio.id}])
            }
        ] : []

    const extraActions = [
            {
                icon: isInPlaylist ? <CheckmarkIcon/> : <PlusIcon/> ,
                title: "Add to Room",
                func: async () => await playlistService.addToQueue([{audioId: audio.id}])
            },
            {
                icon: <ShazamIcon/>,
                title: "Autofill info with Shazam",
                func: () => recognizeAudio(audio)
            },
            {
                icon: <PenIcon/>,
                title: "Edit audio info",
                func: () => openEditModal(audio)
            },
            {
                icon: <TrashIcon/>,
                title: "Delete from library",
                func: () => handleDelete(audio)
            }
        ]
    return (
        <Track
            audio={audio}
            id={id}
            actions={actions}
            extraActions={extraActions}
            className={styles.track}
            playing={playing}
        />
    )
}

export default LibraryPage;