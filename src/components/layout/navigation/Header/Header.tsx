import { Link, NavLink, useNavigate } from "react-router-dom";
import { useRoomPlayback } from "@room";
import styles from "./Header.module.scss"
import { useAuth } from "@/lib/auth";
import { PlaylistIcon, DoorIcon, LibraryIcon, UserIcon } from "@/assets/icons";

const Header = () => {

    const { user, isAuthenticated } = useAuth();
    const { room } = useRoomPlayback();
    const navigate = useNavigate();

    const isMobile = window.innerWidth < 768;

    if (isMobile) return null;
    
    return (
        <header className={styles.header}>
            <div className={styles.headerContainer}>
                <img className={styles.logo} src="/image/logo.png" onClick={() => navigate("/")}/>
                <div className={styles.navigation}>
                    {room && (
                        <NavLink to="/room" className={styles.link} onClick={() => console.log("ROOM CLICK")}>
                            <DoorIcon className={styles.linkIcon}/>
                            <span className={styles.subtitle}>Room</span>
                        </NavLink>
                    )}
                    {isAuthenticated && (
                        <>
                            <NavLink to="/library" className={styles.link}>
                                <LibraryIcon className={styles.linkIcon}/>
                                <span className={styles.subtitle}>Library</span>
                            </NavLink>

                            <NavLink to={"/playlists"} className={styles.link}>
                                <PlaylistIcon className={styles.linkIcon} />
                                <span className={styles.subtitle}>Playlists</span>
                            </NavLink>
                        </>
                    )}
                </div>
                {isAuthenticated ? (
                    <div className={styles.auth}>
                        <UserIcon className={styles.icon}/>
                        <span className={styles.userName}>{user?.name}</span>
                    </div>
                ) : (
                    <Link to="/login">Sign In</Link>
                )}
            </div>
        </header>
    )
}

export default Header;