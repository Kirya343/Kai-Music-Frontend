import { useAuth, useListeningRoom } from "@/lib";
import Audio from "@/components/ui/player/Audio";
import { Link, Outlet } from "react-router-dom";

const MainLayout = () => {

    const { user, isAuthenticated } = useAuth();
    const { room } = useListeningRoom();

    return (
        <div className="main-layout">
            <header className="header">
                <div className="header-container">
                    <img className="logo" src="/image/logo.png"/>
                    <Link to="/library">Библиотека</Link>
                    {room && <Link to="/room">Вернуться в комнату</Link>}
                    {isAuthenticated ? (
                        <div className="header-auth">Пользователь: <span id="userName">{user?.name}</span></div>
                    ) : (
                        <Link to="/login">Войти</Link>
                    )}
                </div>
            </header>

            <main className="page-content">
                <Outlet />
            </main>

            <Audio />
        </div>
    )
}

export default MainLayout;