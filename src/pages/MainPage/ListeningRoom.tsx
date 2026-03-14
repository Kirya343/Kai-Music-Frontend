import Audio from "@/components/Audio";
import UserLibrary from "./UserLibrary";
import { useListeningRoom } from "@/lib";

const ListeningRoom = () => {

    const { room, addToQueue, updateTrackPosition } = useListeningRoom();

    return (
        <div className="listening-room">
            <div className="room-header">
                <span className="room-name">{room?.title}</span>
                <UserLibrary addToQueue={addToQueue} />
            </div>

            <div className="audio-list">
                {room?.queue.map(queueItem => (
                    <div key={queueItem.id} className="audio-item" onClick={() => updateTrackPosition(queueItem.audioId, 0, true)}>
                        <span className="audio-name">{queueItem.name}</span>
                    </div>
                ))}
            </div>

            <Audio />
        </div>
    );
}

export default ListeningRoom