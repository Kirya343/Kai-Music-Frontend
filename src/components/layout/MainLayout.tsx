import { useAuth, useListeningRoom } from "@/lib";
import Audio from "@/components/ui/player/Audio/Audio";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import styles from "./MainLayout.module.scss"
import LibraryIcon from "../icons/LibraryIcon";
import DoorIcon from "../icons/DoorIcon";
import UserIcon from "../icons/UserIcon";

const MainLayout = () => {

    const { user, isAuthenticated } = useAuth();
    const { room } = useListeningRoom();
    const navigate = useNavigate();

    return (
        <div className={styles.layout}>
            <header className={styles.header}>
                <div className={styles.headerContainer}>
                    <img className={styles.logo} src="/image/logo.png" onClick={() => navigate("/")}/>
                    <div className={styles.navigation}>
                        {room && (
                            <NavLink to="/room" className={styles.link}>
                                <DoorIcon className={styles.linkIcon}/>
                                <span className={styles.subtitle}>В комнату</span>
                            </NavLink>
                        )}
                        <NavLink to="/library" className={styles.link}>
                            <LibraryIcon className={styles.linkIcon}/>
                            <span className={styles.subtitle}>Библиотека</span>
                        </NavLink>
                    </div>
                    {isAuthenticated ? (
                        <div className={styles.auth}><UserIcon/><span className={styles.userName}>{user?.name}</span></div>
                    ) : (
                        <Link to="/login">Войти</Link>
                    )}
                </div>
            </header>

            <main className={styles.content}>
                <Outlet />
            </main>

            <Audio />
        </div>
    )
}

export default MainLayout;