
import Audio from "./player/Audio";
import UserLibrary from "./UserLibrary";
import { useListeningRoom } from "@/lib";

const ListeningRoom = () => {

    const { room, addToQueue, removeFromQueue, updateTrackPosition, playbackState } = useListeningRoom();

    return (
        <div className="box">
            <div className="box-header">
                <span className="room-name">{room?.title}</span>
                <UserLibrary addToQueue={addToQueue} />
            </div>

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
        </div>
    );
}

export default ListeningRoom