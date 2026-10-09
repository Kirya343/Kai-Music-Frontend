import { Playlist } from "@/lib/playlist"
import KebabMenu, { IKebabAction } from "@/components/ui/KebabMenu/KebabMenu"
import styles from "./PlaylistCard.module.scss"
import { ReactNode } from "react";

/**
 * PlaylistCard is universal component to inherit from it and modify it
 * 
 * @param title is string title that doesn't display
 * @param func is void that works on action click
 * @param icon is react-svg icon that describes the action and displays on  button
 */
interface IPlaylistAction {
    title: string;
    func: () => void;
    icon?: ReactNode;
}

/**
 * PlaylistCard is universal component to inherit from it and modify it
 * 
 * @param playlist is Playlist to display on this card 
 * @param actions is actions-list to disaplay as buttons on this card
 * @param extraActions is actions-list to fill the KebabMenu on the card
 * @param onClick is void that works on card clicking
 */
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
                {extraActions && <KebabMenu actions={extraActions}/>}
            </div>
        </article>
    )
}

export default PlaylistCard;