import { Playlist } from "@/lib/playlist"
import PlaylistCard from "./PlaylistCard/PlaylistCard"

const SelectPlaylist = ({
    playlist,
    onClick
}: {
    playlist: Playlist
    onClick: () => void
}) => {
    return <PlaylistCard playlist={playlist} onClick={onClick} />
}

export default SelectPlaylist;