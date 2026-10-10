import { IAudio } from "@audio"
import styles from "./Track.module.scss"
import { MusicNoteIcon, PlayingAudioIcon } from "@/assets/icons"
import { countPosition } from "@common"
import { HTMLAttributes, ReactNode } from "react"
import clsx from "clsx"
import { useRoomPlayback } from "@room"
import KebabMenu, { IKebabAction } from "@/components/ui/KebabMenu/KebabMenu"

/** Defines an action button displayed on a track. */
export interface ITrackAction {

    /** Non-visible track title */
    title: string;

    /** Callback executed then action is triggered */
    func: () => void;

    /** Icon displayed on button */
    icon: ReactNode;
}

/**
 * Controls the visibility of track metadata.
 * Unspecified properties default to visible.
 */
interface TrackVisualParameters {
    /** Show the audio ID. */
    id?: true;

    /** Show the track title. */
    title?: true;

    /** Show the artist name. */
    artist?: true;

    /** Show the album name. */
    album?: true;

    /** Show the track duration. */
    duration?: true;
}

/**
 * Props for the Track component.
 */
interface TrackProps extends HTMLAttributes<HTMLDivElement> {
    /** Audio metadata to display. */
    audio: IAudio;

    /** Action buttons displayed alongside the track. */
    actions?: ITrackAction[];

    /** Additional actions displayed in the kebab menu. */
    extraActions?: IKebabAction[];

    /** Position-based number displayed instead of the audio ID. */
    trackNumber?: number;

    /** Remove the track's border. */
    noBorder?: true;

    /** Controls the visibility of individual metadata fields. */
    visualProps?: TrackVisualParameters;

    /** Display a checkbox for track selection. */
    selectionMode?: boolean;

    /** Whether the track is currently selected. */
    selected?: boolean;

    /** Apply the playing style and display the playback indicator. */
    playing?: boolean;
}

/**
 * Displays an audio track with its metadata and optional actions.
 *
 * Supports customizable metadata visibility, selection mode,
 * playback indication, and standard HTML div attributes.
 */
const Track = ({ 
    audio, 
    actions, 
    extraActions, 
    trackNumber,
    noBorder,
    visualProps,

    onClick,

    selectionMode = false,
    selected = false,

    playing = false,
    className,

    ...divProps
}: TrackProps) => {

    const { playbackState } = useRoomPlayback();

    return (
        <div 
            {...divProps}
            className={clsx(
                styles.track, 
                noBorder && styles.noBorder, 
                playing && styles.playing, 
                className
            )}
        >
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
                    {(!visualProps || visualProps.title) && (
                        <span className={styles.title}>
                            {playing && <PlayingAudioIcon playing={!playbackState?.pause} />}

                            {(!visualProps || visualProps.id) && <span className={styles.id}>#{trackNumber || audio.id}</span>} 
                            {audio?.title ?? audio?.name}
                        </span>
                    )}
                    {(!visualProps || visualProps.artist) && (
                        <span className={styles.artist}>{audio?.artist || "Unknown artist"}</span>
                    )}
                    <span className={styles.info}>
                        {(!visualProps || visualProps.album) && audio?.album && (<>{audio?.album} • </>)}
                        {(!visualProps || visualProps.duration) && audio?.duration && (<>{countPosition(audio?.duration)}</>)}
                    </span>
                </div>
            </div>

            <div className={styles.actions}>
                {actions?.map(act => (
                    <button onClick={act.func} key={act.title}>{act.icon}</button>
                ))}
                {extraActions && <KebabMenu actions={extraActions}/>}
            </div>
        </div>
    )
}

export default Track;