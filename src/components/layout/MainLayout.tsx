import { useAuth, useChats, useListeningRoom } from "@/lib";
import Audio from "@/components/ui/player/Audio/Audio";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import styles from "./MainLayout.module.scss"
import LibraryIcon from "../icons/LibraryIcon";
import DoorIcon from "../icons/DoorIcon";
import UserIcon from "../icons/UserIcon";
import ChatsIcon from "../icons/ChatsIcon";
import { useState } from "react";
import UnreadNotifications from "../ui/notifications/UnreadNotifications/UnreadNotifications";

const MainLayout = () => {

    const { user, isAuthenticated } = useAuth();
    const { room } = useListeningRoom();
    const { unreadMessages } = useChats();
    const navigate = useNavigate();

    const [started, setStarted] = useState<boolean>(false);

    return (
        <div className={styles.layout}>
            {!started ? (
                <>
                    {/* <img src="/image/splash.jpg" style={{objectFit: "cover"}}/> */}
                    <button className={styles.start} onClick={() => setStarted(true)}>Открыть</button>
                </>
            ) : (
                <>
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
                                <NavLink to="/chats" className={styles.link}>
                                    <ChatsIcon className={styles.linkIcon} />
                                    <span className={styles.subtitle}>Сообщения</span>
                                    <UnreadNotifications count={unreadMessages?.length || 0}/>
                                </NavLink>
                            </div>
                            {isAuthenticated ? (
                                <div className={styles.auth}><UserIcon className={styles.icon}/><span className={styles.userName}>{user?.name}</span></div>
                            ) : (
                                <Link to="/login">Войти</Link>
                            )}
                        </div>
                    </header>

                    <main className={styles.content}>
                        <Outlet />
                    </main>

                    <Audio />
                </>
            )}
        </div>
    )
}

export default MainLayout;