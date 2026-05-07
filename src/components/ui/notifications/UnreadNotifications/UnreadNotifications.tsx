import styles from "./UnreadNotifications.module.scss";

export default function UnreadNotifications({count}: {count: number}) {
    return count > 0 && (
        <span className={styles.unreadCount}>
            {count}
        </span>
    )
}