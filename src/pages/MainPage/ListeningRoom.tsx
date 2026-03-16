
import Audio from "./player/Audio";
import UserLibrary from "./UserLibrary";
import { useListeningRoom, useWebSocket } from "@/lib";

const ListeningRoom = () => {

    const { room, addToQueue, removeFromQueue, updateTrackPosition, playbackState } = useListeningRoom();
    const { error } = useWebSocket();

    return (
        <>
            <div className="box-header">
                <span className="room-name">{room?.title}</span>
                <UserLibrary addToQueue={addToQueue} />
            </div>

            {error && (<div className="error">Ошибка подключения к комнате</div>)}

            <div className="box-list">
                {room?.queue.map(queueItem => (
                    <div 
                        key={queueItem.id} 
                        className={`box-list-item ${queueItem.audioId == playbackState?.audioId ? "active" : ""}`} 
                        onClick={() => updateTrackPosition(queueItem.audioId, 0, true)}
                        onDoubleClick={() => removeFromQueue(queueItem.id)}
                    >
                        <span className="audio-name">{queueItem.name}</span>
                    </div>
                ))}
            </div>

            <Audio />
        </>
    );
}

export default ListeningRoom