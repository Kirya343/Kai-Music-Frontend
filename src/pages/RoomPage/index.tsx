import { useRef, useState } from "react";
import { IRoomUpdate, useListeningRoom, useWebSocket } from "@/lib";
import { Link } from "react-router-dom";
import PlayIcon from "@/components/icons/PlayIcon";
import PauseIcon from "@/components/icons/PauseIcon";
import styles from "./RoomPage.module.scss";
import AudioPlayerOpener from "@/components/ui/player/AudioPlayerOpener/AudioPlayerOpener";
import { useGlobal } from "@/lib/contexts/GlobalContext";
import clsx from "clsx";
import MusicNoteIcon from "@/components/icons/MusicNoteIcon";
import { roomService } from "@/lib/services/room";

const RoomPage = () => {
    const [selectedTracks, setSelectedTracks] = useState<number[]>([]);
    const [selectMode, setSelectMode] = useState<boolean>(false);
    const { room, removeFromQueue, updateTrackPosition, playbackState, localPosition, loadRoom } = useListeningRoom();
    const { started } = useGlobal();
    const { error } = useWebSocket();
    const [newRoomName, setNewRoomName] = useState<string>(room?.title || "");
    const [editMode, setEditMode] = useState<boolean>(false);

    const timeoutRef = useRef<number | null>(null);

    const handleMouseDown = (id: number) => {
        timeoutRef.current = setTimeout(() => {
            setSelectedTracks([id]);
            setSelectMode(true);
        }, 1200);
    };

    const clearTimer = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    const toggleTrack = (id: number) => {
        setSelectedTracks(prev =>
            prev?.includes(id)
                ? prev.filter(trackId => trackId !== id)
                : [...prev, id]
        );
    };

    const deleteFromRoom = () => {
        for (const trackId of selectedTracks) {
            removeFromQueue(trackId)
            setSelectedTracks(prev => prev.filter(id => id !== trackId))
        }
    }

    const saveRoom = async () => {
        if (!room) return;
        const roomUpdate: IRoomUpdate = {
            title: newRoomName
        }
        const res = await roomService.updateRoom(room.id, roomUpdate);
        if (res.ok) {
            setEditMode(false)
            loadRoom()
        }
    }

    return (
        <>
            <div className={styles.page}>
                <div className={styles.room}>
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

                <div className={styles.members}>
                    3 Listners
                </div>

                {error && (<div className={styles.error}>Error while connecting to room</div>)}

                <div className={styles.queue}>
                    <div className={styles.header}>
                        <h3>Playback queue</h3>
                    </div>

                    <div className={styles.trackList}>
                        {room?.queue.map(queueItem => (
                            <div 
                                key={queueItem.id} 
                                className={clsx(styles.track, queueItem.id == playbackState?.entryId ? styles.active : "")}
                                onClick={() => toggleTrack(queueItem.id)}
                                onMouseDown={() => handleMouseDown(queueItem.id)}
                                onMouseUp={clearTimer}
                                onMouseLeave={clearTimer}
                                onTouchStart={() => handleMouseDown(queueItem.id)}
                                onTouchEnd={clearTimer}
                            >
                                {selectMode && (
                                    <input
                                        type="checkbox"
                                        checked={selectedTracks.includes(queueItem.id)}
                                        readOnly
                                    />
                                )}
                                <div className={styles.audioCover}>
                                    <MusicNoteIcon/>

                                    {queueItem.id == playbackState?.entryId && !playbackState.pause ? (
                                        <button 
                                            className={clsx(styles.action, styles.pause)}
                                            onClick={() => updateTrackPosition(queueItem.id, localPosition, true)} 
                                        >
                                            <PauseIcon />
                                        </button>
                                    ) : (
                                        <button 
                                            className={clsx(styles.action, styles.play)}
                                            onClick={() => updateTrackPosition(queueItem.id, 0, false)} 
                                        >
                                            <PlayIcon />
                                        </button>
                                    )}
                                </div>

                                <div className={styles.meta}>
                                    <span className={styles.name}>{queueItem?.name}</span>
                                    <span className={styles.artist}>{`<Artist name>`}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Link 
                        to={`/library?roomId=${room?.id}`}
                        className={styles.addTrack}
                    >
                        Add track
                    </Link>
                </div>

                {selectMode && selectedTracks.length > 0 && (
                    <div className={styles.selectedTracksActions}>
                        <button 
                            onClick={deleteFromRoom}
                            style={{backgroundColor: "#4b1129"}}
                        >Remove from queue</button>
                        <button 
                            style={{backgroundColor: "#156451"}}
                            onClick={() => setSelectedTracks([])}
                        >Clean selected</button>
                        <button 
                            style={{backgroundColor: "#58161f"}}
                            onClick={() =>  {
                                setSelectMode(false)
                                setSelectedTracks([])
                            }}
                        >Cancel</button>
                    </div>
                )}
            </div>

            {started && <AudioPlayerOpener />}
        </>
    )
}

export default RoomPage;