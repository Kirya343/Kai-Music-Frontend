import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth, useListeningRoom } from "@/lib";
import styles from "./Header.module.scss"
import DoorIcon from "@/components/icons/DoorIcon"
import LibraryIcon from "@/components/icons/LibraryIcon"
import UserIcon from "@/components/icons/UserIcon"

const Header = () => {

    const { user, isAuthenticated } = useAuth();
    const { room } = useListeningRoom();
    const navigate = useNavigate();
    
    return (
        <header className={styles.header}>
            <div className={styles.headerContainer}>
                <img className={styles.logo} src="/image/logo.png" onClick={() => navigate("/")}/>
                <div className={styles.navigation}>
                    {room && (
                        <NavLink to="/room" className={styles.link}>
                            <DoorIcon className={styles.linkIcon}/>
                            <span className={styles.subtitle}>Room</span>
                        </NavLink>
                    )}
                    {isAuthenticated && (
                        <NavLink to="/library" className={styles.link}>
                            <LibraryIcon className={styles.linkIcon}/>
                            <span className={styles.subtitle}>Library</span>
                        </NavLink>
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