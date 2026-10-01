import { Outlet } from "react-router-dom";
import styles from "./LibraryLayout.module.scss"

const LibraryLayout = () => {
    return (
        <div className={styles.library}>
            {/* <div className={styles.topPanel}>
                <Link to={"/library"} className={styles.action}>
                    <LibraryIcon />
                    <span className={styles.subtitle}>Tracks</span>
                </Link>
                <Link to={"/library/playlists"} className={styles.action}>
                    <PlaylistIcon />
                    <span className={styles.subtitle}>Playlists</span>
                </Link>
                <button className={styles.action}>
                    <HeartIcon filled={false}/>
                    <span className={styles.subtitle}>Favorite</span>
                </button>
            </div> */}

            <Outlet />
        </div>
    );
}

export default LibraryLayout;