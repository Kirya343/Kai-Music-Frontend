import { useRef, useState } from "react";
import { IRoomUpdate, useRoomPlayback, roomService } from "@room";
import { Link } from "react-router-dom";
import styles from "./RoomPage.module.scss";
import AudioPlayerOpener from "@/components/ui/player/AudioPlayerOpener/AudioPlayerOpener";
import { useGlobal } from "@common";
import { useWebSocket } from "@websocket";
import Track from "@/components/ui/Track/Track";
import TrashIcon from "@/components/icons/TrashIcon";
import ActionMenu from "@/components/ui/ActionMenu/ActionMenu";
import CheckBoxIcon from "@/components/icons/CheckBoxIcon";

const RoomPage = () => {
    const [selectedTracks, setSelectedTracks] = useState<number[]>([]);
    const [selectMode, setSelectMode] = useState<boolean>(false);
    const { 
        room, removeFromQueue, 
        updateTrackPosition,
        playbackState, loadRoom
    } = useRoomPlayback();
    const { started } = useGlobal();
    const { error } = useWebSocket();
    const [newRoomName, setNewRoomName] = useState<string>(room?.title || "");
    const [editMode, setEditMode] = useState<boolean>(false);

    const toggleTrack = (id: number) => {
        setSelectedTracks(prev =>
            prev?.includes(id)
                ? prev.filter(trackId => trackId !== id)
                : [...prev, id]
        );
    };

    const deleteFromRoom = () => {
        for (const trackId of selectedTracks) {
            setSelectedTracks(prev => prev.filter(id => id !== trackId))
        }

        removeFromQueue(selectedTracks)
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

                <div className={styles.header}>
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

                    <div className={styles.room}>
                        <span className={styles.roomName}>{room?.code || "Room code is unknown"}</span>
                    </div>
                </div>

                <div className={styles.members}>
                    {room?.listeners} Listners
                </div>

                {error && (<div className={styles.error}>Error while connecting to room</div>)}

                <div className={styles.queue}>
                    <div className={styles.header}>
                        <h3>Playback queue</h3>
                        <ActionMenu
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
                        {room?.playlist.queue.map(qi => (
                            <Track
                                onClick={selectMode ? 
                                    () => toggleTrack(qi.id) : 
                                    () => updateTrackPosition({
                                        entryId: qi.id, 
                                        position: playbackState?.entryId === qi.id ? playbackState?.position : 0, 
                                        pause: true})
                                }
                                key={qi.id}
                                audio={qi.audio}
                                id={qi.position + 1}
                                noBorder
                                actions={[
                                    {
                                        icon: <TrashIcon/>,
                                        title: "deleteAudio",
                                        func: () => removeFromQueue([qi.id])
                                    }
                                ]}
                                props={{
                                    title: true,
                                    artist: true
                                }}
                                
                                selectionMode={selectMode}
                                selected={selectedTracks.some(t => t == qi.id)}
                            />
                        ))}
                    </div>

                    <Link 
                        to={`/library?roomId=${room?.id}`}
                        className={styles.addTrack}
                    >
                        Add track
                    </Link>
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
            </div>

            {started && <AudioPlayerOpener />}
        </>
    )
}

export default RoomPage;