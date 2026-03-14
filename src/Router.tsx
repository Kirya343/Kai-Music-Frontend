import { Route, Routes } from "react-router-dom";
import { LoginPage, LoginSuccessPage, LogoutPage, MainPage, RegisterPage } from "./pages";
import MainLayout from "./components/layout/MainLayout";

const AppRouter = () => {
    return (
        <>
            <Routes>
                <Route element={<MainLayout/>}>
                    <Route index element={<MainPage />} />
                </Route>

                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="login/success" element={<LoginSuccessPage />} />
                <Route path="logout" element={<LogoutPage />} />
            </Routes>
        </>
    );
};

export default AppRouter;