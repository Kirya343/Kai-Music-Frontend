import { useEffect, useState } from "react";
import { IRoomUpdate, useRoomPlayback, roomService } from "@room";
import styles from "./RoomPage.module.scss";
import AudioPlayerOpener from "@/components/ui/player/AudioPlayerOpener/AudioPlayerOpener";
import { useGlobal } from "@common";
import { useWebSocket } from "@websocket";
import KebabMenu from "@/components/ui/KebabMenu/KebabMenu";
import { CheckBoxIcon } from "@/assets/icons";
import Loader from "@/components/ui/Loader/Loader";
import { playlistService } from "@/lib/playlist";
import TrackImportModal from "@/components/ui/modals/TrackImportModal/TrackImportModal";
import RoomTrack from "@/components/ui/track/RoomTrack";

const RoomPage = () => {
    const [selectedTracks, setSelectedTracks] = useState<number[]>([]);
    const [selectMode, setSelectMode] = useState<boolean>(false);
    const { room, playbackState, roomPlaylist } = useRoomPlayback();

    const { started } = useGlobal();
    const { error } = useWebSocket();
    const [newRoomName, setNewRoomName] = useState<string>(room?.title || "");
    const [editMode, setEditMode] = useState<boolean>(false);

    const [importOpen, setImportOpen] = useState<boolean>(false)

    const toggleTrack = (id: number) => {
        setSelectedTracks(prev =>
            prev?.includes(id)
                ? prev.filter(trackId => trackId !== id)
                : [...prev, id]
        );
    };

    const deleteFromRoom = async () => {
        if (!roomPlaylist?.id) return;

        for (const trackId of selectedTracks) {
            setSelectedTracks(prev => prev.filter(id => id !== trackId))
        }

        await playlistService.removeFromQueue(roomPlaylist?.id, selectedTracks)
    }

    const saveRoom = async () => {
        if (!room) return;
        const roomUpdate: IRoomUpdate = {
            title: newRoomName
        }

        try {
            await roomService.updateRoom(room.id, roomUpdate);
            setEditMode(false)
        } catch (e) {
            console.error(e)
        }
    }
    
    return (
        <>
            <div className={styles.page}>

                <Loader loadingActive={!room}>

                    <div className={styles.header}>
                        <div className={styles.title}>
                            <span>#{room?.id}</span>
                            {editMode ? (
                                <>  
                                    <input 
                                        className={styles.roomName}
                                        value={newRoomName} 
                                        onChange={(e) => setNewRoomName(e.target.value)} 
                                        placeholder={room?.title}
                                    />
                                    <button className={styles.submitBtn} onClick={saveRoom}>✔</button>
                                </>
                            ) : (
                                <span 
                                    onDoubleClick={() => setEditMode(true)}
                                    className={styles.roomName}
                                >
                                    {room?.title}
                                </span>
                            )}
                        </div>

                        <div className={styles.code}>
                            <span className={styles.roomName}>{room?.code || "Room code is unknown"}</span>
                        </div>

                        <div className={styles.members}>
                            {room?.listeners} Listners
                        </div>
                    </div>

                    {error && (<div className={styles.error}>Error while connecting to room</div>)}

                    <div className={styles.queue}>
                        <div className={styles.header}>
                            <h3>Playback queue</h3>
                            <KebabMenu
                                actions={[
                                    {
                                        icon: <CheckBoxIcon/>,
                                        title: "Select tracks",
                                        func: () => setSelectMode(prev => !prev)
                                    }
                                ]}
                            />
                        </div>

                        <div className={styles.trackList}>
                            {roomPlaylist?.queue.map(qi => (
                                <RoomTrack
                                    key={qi.id}
                                    queueItem={qi}
                                    selected={selectedTracks.some(t => t == qi.id)}
                                    selectMode={selectMode}
                                    toggleTrack={toggleTrack}
                                    playing={playbackState?.entryId === qi.id}
                                />
                            ))}
                        </div>

                        <button className={styles.addTrack} onClick={() => setImportOpen(true)}>
                            Add track
                        </button>
                    </div>

                    {selectMode && (
                        <div className={styles.selectedTracksActions}>
                            <button 
                                onClick={deleteFromRoom}
                                className={styles.action}
                            >
                                Remove from queue
                            </button>
                            <button 
                                className={styles.action}
                                onClick={() => setSelectedTracks([])}
                            >
                                Clean selected
                            </button>
                            <button 
                                className={styles.action}
                                onClick={() =>  {
                                    setSelectMode(false)
                                    setSelectedTracks([])
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </Loader>

                {started && <AudioPlayerOpener />}
            </div>

            {roomPlaylist && <TrackImportModal importPlaylist={roomPlaylist} isOpen={importOpen} onClose={() => setImportOpen(false)} />}
        </>
    )
}

export default RoomPage;