import { IAudio } from "@audio"
import styles from "./Track.module.scss"
import MusicNoteIcon from "@/components/icons/MusicNoteIcon"
import { countPosition } from "@common"
import { ReactNode } from "react"
import ActionMenu, { IKebabAction } from "../ActionMenu/ActionMenu"
import clsx from "clsx"
import PlayingAudioIcon from "@/components/icons/animated/PlayingAudioIcon"
import { useRoomPlayback } from "@room"

/**
 * The universal element for any AudioTracks
 * 
 * Pro
 */
interface ITrackAction {
    title: string;
    func: () => void;
    icon?: ReactNode;
}

interface TrackVisualParameters {
    id?: true;
    title?: true;
    artist?: true;
    album?: true;

    duration?: true;
}

interface TrackProps {
    audio: IAudio;
    actions?: ITrackAction[];
    extraActions?: IKebabAction[];
    id: number;
    noBorder?: true;
    props?: TrackVisualParameters;

    onClick?: () => void;

    selectionMode?: boolean;
    selected?: boolean;

    playing?: boolean
}

const Track = ({ 
    audio, 
    actions, 
    extraActions, 
    id,
    noBorder,
    props,

    onClick = () => {},

    selectionMode = false,
    selected = false
}: TrackProps) => {

    const { room, playbackState } = useRoomPlayback();

    const playing = room?.playlist.queue.find(i => playbackState?.entryId === i.id)?.audio.id === audio.id;

    return (
        <div className={clsx(styles.track, noBorder && styles.noBorder, playing && styles.playing)}>
            <div className={styles.body} onClick={onClick}>

                {selectionMode && (
                    <input
                        type="checkbox"
                        checked={selected}
                        readOnly
                    />
                )}

                <div className={styles.audioCover}>
                    <MusicNoteIcon/>
                </div>

                <div className={styles.meta}>
                    {(!props || props.title) && (
                        <span className={styles.title}>
                            {playing && <PlayingAudioIcon playing={!playbackState?.pause} />}

                            {(!props || props.id) && <span className={styles.id}>#{id ? id :audio.id}</span>} 
                            {audio?.title ?? audio?.name}
                        </span>
                    )}
                    {(!props || props.artist) && (
                        <span className={styles.artist}>{audio?.artist || "Unknown artist"}</span>
                    )}
                    <span className={styles.info}>
                        {(!props || props.album) && audio?.album && (<>{audio?.album} • </>)}
                        {(!props || props.duration) && audio?.duration && (<>{countPosition(audio?.duration)}</>)}
                    </span>
                </div>
            </div>

            <div className={styles.actions}>
                {actions?.map(act => (
                    <button onClick={act.func} key={act.title}>{act.icon}</button>
                ))}
                {extraActions && <ActionMenu actions={extraActions}/>}
            </div>
        </div>
    )
}

export default Track;