import Audio from "@/components/Audio";
import { useAuth } from "@/lib";
import { Link } from "react-router-dom";

const MainPage = () => {

    const { user } = useAuth();

    return (
        <>
            <div>Пользователь: {user?.name}</div>
            <Link to="/login">Войти</Link>

            <Audio />
        </>
    )
}

export default MainPage;