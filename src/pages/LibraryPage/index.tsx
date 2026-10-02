import { useRoomPlayback } from "@room";
import { IAudio } from "@audio";
import { useMemo, useState } from "react";
import styles from "./LibraryPage.module.scss"
import CheckmarkIcon from "@/components/icons/CheckmarkIcon";
import CrossIcon from "@/components/icons/CrossIcon";
import AudioFileModal from "@/components/pages/library/AudioFileModal/AudioFileModal";
import AudioPlayerOpener from "@/components/ui/player/AudioPlayerOpener/AudioPlayerOpener";
import { useLibrary } from "@audio/hooks/useLibrary";
import LoadingSpinnerIcon from "@/components/icons/LoadingSpinnerIcon";
import CirclePlusIcon from "@/components/icons/CirclePlusIcon";
import LibraryTrack from "@/components/ui/library/LibraryTrack";

const LibraryPage = () => {

    const { 
        visibleAudios, loading, 
        deleteAudio, 
        updateAudio, setSearchQuery,
        searchQuery, uploadAudios,
        uploading, filteredList,
        rowVirtualizer, parentRef,
        recognizeAudio
    } = useLibrary();

    const [audioFileView, setAudioFileView] = useState<IAudio | null>(null);
    
    const { playlist, playbackState, roomLoaded } = useRoomPlayback();

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

                    {searchQuery.length != 0 && <span>Found {filteredList.length} audios</span>}
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
                                        recognizeAudio={recognizeAudio}
                                        playlistId={playlist?.id}
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

                <AudioFileModal 
                    audioFile={audioFileView} 
                    onClose={() => setAudioFileView(null)} 
                    updateAudio={updateAudio}
                />
            </div>

            {roomLoaded && <AudioPlayerOpener />}
        </>
    )
}

export default LibraryPage;