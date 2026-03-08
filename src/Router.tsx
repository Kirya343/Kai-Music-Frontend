import { Route, Routes } from "react-router-dom";
import { LoginPage, LoginSuccessPage, LogoutPage, MainPage, RegisterPage } from "./pages";

const AppRouter = () => {
    return (
        <>
            <Routes>
                <Route index element={<MainPage />} />

                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="login/success" element={<LoginSuccessPage />} />
                <Route path="logout" element={<LogoutPage />} />
            </Routes>
        </>
    );
};

export default AppRouter;