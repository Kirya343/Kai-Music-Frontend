import { Playlist } from "@/lib/playlist"
import ActionMenu, { IKebabAction } from "../../ActionMenu/ActionMenu"
import styles from "./PlaylistCard.module.scss"
import { ReactNode } from "react";

interface IPlaylistAction {
    title: string;
    func: () => void;
    icon?: ReactNode;
}

const PlaylistCard = ({
    playlist,
    actions,
    extraActions,
    onClick
}: {
    playlist: Playlist;
    actions?: IPlaylistAction[];
    extraActions?: IKebabAction[];
    onClick?: () => void;
}) => {

    return (
        <article className={styles.playlistCard} onClick={onClick}>
            <div className={styles.body}>
                <span className={styles.title}>{playlist.title}</span>
            </div>

            <div className={styles.actions}>
                {actions?.map(act => (
                    <button onClick={act.func} key={act.title}>{act.icon}</button>
                ))}
                {extraActions && <ActionMenu actions={extraActions}/>}
            </div>
        </article>
    )
}

export default PlaylistCard;