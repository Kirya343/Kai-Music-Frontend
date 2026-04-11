import { useState } from "react";
import { useListeningRoom, useWebSocket } from "@/lib";
import { Link } from "react-router-dom";

const RoomPage = () => {
    const [loaded, setLoaded] = useState<boolean>(false);
    const { room, addToQueue, removeFromQueue, updateTrackPosition, playbackState } = useListeningRoom();
    const { error } = useWebSocket();

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
                                onClick={() => updateTrackPosition(queueItem.id, 0, false)}
                                onDoubleClick={() => removeFromQueue(queueItem.id)}
                            >
                                <span className="audio-name">{queueItem.name}</span>
                            </div>
                        ))}
                    </div>
                </>
                ) : <div className="click-overlay" onClick={() => setLoaded(true)}>Нажмите чтобы подключиться к комнате</div>
            }
        </>
    )
}

export default RoomPage;