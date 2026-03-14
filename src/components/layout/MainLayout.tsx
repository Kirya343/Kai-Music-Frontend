import { useAuth } from "@/lib";
import { Link, Outlet } from "react-router-dom";

const MainLayout = () => {

    const { user, isAuthenticated } = useAuth();

    return (
        <div className="main-layout">
            <header className="header">
                <div className="header-container">
                    <img className="logo" src="/image/logo.png"/>
                    {isAuthenticated ? (
                        <div className="header-auth">Пользователь: <span id="userName">{user?.name}</span></div>
                    ) : (
                        <Link to="/login">Войти</Link>
                    )}
                </div>
            </header>

            <Outlet />
        </div>
    )
}

export default MainLayout;