import styles from "./PlaylistPage.module.scss"
import { useMemo, useState } from "react";
import { Playlist } from "@playlist";
import { IAudio } from "@audio";
import AudioFileModal from "@/components/ui/modals/AudioFileModal/AudioFileModal";
import PlaylistTrack from "@/components/ui/track/PlaylistTrack";
import { useParams } from "react-router-dom";
import { CirclePlusIcon } from "@/assets/icons";
import SearchableLayout from "@/components/layout/SearchableLayout/SearchableLayout";
import { useData, useSearch } from "@common";
import { useRoomPlayback } from "@playback";

const PlaylistPage = ({}: {}) => {

    const { id } = useParams<{ id: string }>();

    const playlistId = Number(id)
    
    const [audioFileView, setAudioFileView] = useState<IAudio | null>(null);
    const [importOpen, setImportOpen] = useState<boolean>(false)

    const { roomPlaylist, playbackState } = useRoomPlayback();

    const { playlists } = useData();
        
    const playlist = useMemo<Playlist | null>(() => {
        if (!playlistId) return null;

        return playlists.data.find(p => p.id === playlistId) || null
    }, [playlists.data])
    
    const { filteredList, searchQuery, setSearchQuery } = useSearch(playlist?.queue || []);

    const playingAudioId = useMemo(() => {
        return roomPlaylist?.queue.find(
            item => item.id === playbackState?.entryId
        )?.audio.id;
    }, [roomPlaylist?.queue, playbackState?.entryId]);

    if (!playlist) return null;

    return (
        <SearchableLayout
            title={playlist?.title || ""}
            search={{searchQuery, setSearchQuery, filteredList}}
            extraActions={[
                <button className={styles.upload} onClick={() => setImportOpen(true)}>
                    <CirclePlusIcon />
                    <span>Create new</span>
                </button>
            ]}
        >
            <div className={styles.trackList}>
                {filteredList.map((qi, idx) => (
                    <PlaylistTrack
                        queueItem={qi}
                        trackNumber={idx + 1}
                        isInPlaylist={false}
                        currentPlaylistId={playlist.id}
                        openEditModal={setAudioFileView}
                        handleRemove={playlists.removeAudio}
                        playing={playingAudioId === qi.audio.id}
                    />
                ))}
            </div>

            <AudioFileModal
                audioFile={audioFileView} 
                onClose={() => setAudioFileView(null)} 
            />
        </SearchableLayout>
    )
}

export default PlaylistPage;