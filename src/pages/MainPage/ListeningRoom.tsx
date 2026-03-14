import Audio from "@/components/Audio";
import { audioService } from "@/lib/services/audio";
import { useState } from "react";
import UserLibrary from "./UserLibrary";

const ListeningRoom = () => {

    const { room, addToQueue } = audioService.useCurrentRoom();

    const [currentAudioId, setCurrentAudioId] = useState<number | null>(null);

    return (
        <div className="listening-room">
            <div className="room-header">
                <span className="room-name">{room?.title}</span>
                <UserLibrary addToQueue={addToQueue} />
            </div>

            <div className="audio-list">
                {room?.queue.map(audio => (
                    <div key={audio.id} className="audio-item" onClick={() => setCurrentAudioId(audio.audioId)}>
                        <span className="audio-name">{audio.name}</span>
                    </div>
                ))}
            </div>

            <Audio audioId={currentAudioId}/>
        </div>
    );
}

export default ListeningRoom