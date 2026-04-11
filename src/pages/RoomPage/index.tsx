import { useRef, useState } from "react";
import { useListeningRoom, useWebSocket } from "@/lib";
import { Link } from "react-router-dom";
import PlayIcon from "@/components/icons/PlayIcon";
import PauseIcon from "@/components/icons/PauseIcon";

const RoomPage = () => {
    const [loaded, setLoaded] = useState<boolean>(false);
    const [selectedTracks, setSelectedTracks] = useState<number[]>([]);
    const [selectMode, setSelectMode] = useState<boolean>(false);
    const { room, removeFromQueue, updateTrackPosition, playbackState, localPosition } = useListeningRoom();
    const { error } = useWebSocket();

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

    return (
        <>
            {loaded ? (
                <>
                    <div className="room-header">
                        <span className="room-name">#{room?.id} {room?.title}</span>
                        <Link to={`/library?roomId=${room?.id}`}>
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="24" height="24" 
                                viewBox="0 0 24 24" fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"
                            />
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                        </Link>
                    </div>

                    {error && (<div className="error">Ошибка подключения к комнате</div>)}

                    <div className="track-list">
                        {room?.queue.map(queueItem => (
                            <div 
                                key={queueItem.id} 
                                className={`track ${queueItem.id == playbackState?.entryId ? "active" : ""}`}
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
                                <span className="audio-name">{queueItem.name}</span>
                            </div>
                        ))}
                    </div>
                </>
                ) : <div className="click-overlay" onClick={() => setLoaded(true)}>Нажмите чтобы подключиться к комнате</div>
            }

            {selectMode && selectedTracks.length > 0 && (
                <div className="selected-tracks-actions">
                    <button 
                        onClick={deleteFromRoom}
                        style={{backgroundColor: "#4b1129"}}
                    >Удалить из очереди</button>
                    <button 
                        style={{backgroundColor: "#156451"}}
                        onClick={() => setSelectedTracks([])}
                    >Очистить список</button>
                    <button 
                        style={{backgroundColor: "#156451"}}
                        onClick={() =>  {
                            setSelectMode(false)
                            setSelectedTracks([])
                        }}
                    >Отменить</button>
                </div>
            )}
        </>
    )
}

export default RoomPage;