import { useAuth, useListeningRoom } from "@/lib";
import Audio from "@/components/ui/player/Audio/Audio";
import { Link, Outlet, useNavigate } from "react-router-dom";
import styles from "./MainLayout.module.scss"

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
                        <Link to="/library">Библиотека</Link>
                        {room && <Link to="/room">Вернуться в комнату</Link>}
                    </div>
                    {isAuthenticated ? (
                        <div className={styles.auth}>Пользователь: <span className={styles.userName}>{user?.name}</span></div>
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