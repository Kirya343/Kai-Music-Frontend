import clsx from "clsx";
import styles from "./PlayingAudioIcon.module.scss"

const PlayingAudioIcon = ({playing}: {playing: boolean}) => {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 40 40"
            fill="none"
            width="15"
            className={clsx(styles.icon, playing && styles.playing)}
        >
            <rect className={styles.bar} x="2" y="6" width="6" height="32" rx="2" fill="currentColor" />
            <rect className={styles.bar} x="12" y="6" width="6" height="32" rx="2" fill="currentColor" />
            <rect className={styles.bar} x="21" y="6" width="6" height="32" rx="2" fill="currentColor" />
            <rect className={styles.bar} x="31" y="6" width="6" height="32" rx="2" fill="currentColor" />
        </svg>
    )
}

export default PlayingAudioIcon;