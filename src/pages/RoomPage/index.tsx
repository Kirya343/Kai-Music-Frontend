import { useRef, useState } from "react";
import { IRoomUpdate, useListeningRoom, useWebSocket } from "@/lib";
import { Link } from "react-router-dom";
import PlayIcon from "@/components/icons/PlayIcon";
import PauseIcon from "@/components/icons/PauseIcon";
import styles from "./RoomPage.module.scss";
import AudioPlayerOpener from "@/components/ui/player/AudioPlayerOpener/AudioPlayerOpener";
import { useGlobal } from "@/lib/contexts/GlobalContext";
import { audioService } from "@/lib/services/audio";

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
        const res = await audioService.updateRoom(room.id, roomUpdate);
        if (res.ok) {
            setEditMode(false)
            loadRoom()
        }
    }

    return (
        <>
            <div className={styles.header}>
                <span className={styles.roomName}>
                    <span>#{room?.id}</span>
                    {editMode ? (
                        <>  
                            <input 
                                className={styles.newRoomNameInput}
                                value={newRoomName} 
                                onChange={(e) => setNewRoomName(e.target.value)} 
                                placeholder={room?.title}
                            />
                            <button className={styles.submitBtn} onClick={saveRoom}>✔</button>
                        </>
                    ) : (
                        <span onDoubleClick={() => setEditMode(true)}>{room?.title}</span>
                    )}
                </span>
                <Link to={`/library?roomId=${room?.id}`}>
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" height="24" 
                        viewBox="0 0 24 24" fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    >
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                </Link>
            </div>

            {error && (<div className={styles.error}>Ошибка подключения к комнате</div>)}

            <div className={styles.trackList}>
                {room?.queue.map(queueItem => (
                    <div 
                        key={queueItem.id} 
                        className={`${styles.track} ${queueItem.id == playbackState?.entryId ? styles.active : ""}`}
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
                        {queueItem.id == playbackState?.entryId && !playbackState.pause ? (
                            <button 
                                onClick={() => updateTrackPosition(queueItem.id, localPosition, true)} 
                            >
                                <PauseIcon />
                            </button>
                        ) : (
                            <button 
                                onClick={() => updateTrackPosition(queueItem.id, 0, false)} 
                            >
                                <PlayIcon />
                            </button>
                        )}
                        <span className={styles.audioName}>{queueItem.name}</span>
                    </div>
                ))}
            </div>

            {selectMode && selectedTracks.length > 0 && (
                <div className={styles.selectedTracksActions}>
                    <button 
                        onClick={deleteFromRoom}
                        style={{backgroundColor: "#4b1129"}}
                    >Удалить из очереди</button>
                    <button 
                        style={{backgroundColor: "#156451"}}
                        onClick={() => setSelectedTracks([])}
                    >Очистить список</button>
                    <button 
                        style={{backgroundColor: "#58161f"}}
                        onClick={() =>  {
                            setSelectMode(false)
                            setSelectedTracks([])
                        }}
                    >Отменить</button>
                </div>
            )}

            {started && <AudioPlayerOpener />}
        </>
    )
}

export default RoomPage;