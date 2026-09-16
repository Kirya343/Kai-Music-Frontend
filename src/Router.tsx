import { Route, Routes } from "react-router-dom";
import { LoginPage, LoginSuccessPage, LogoutPage, MainPage, RegisterPage } from "./pages";
import MainLayout from "./components/layout/MainLayout/MainLayout";
import RoomPage from "./pages/RoomPage";
import LibraryPage from "./pages/LibraryPage";
import PrivateRoute from "./PrivateRoute";
import StartLayout from "./components/layout/StartLayout/StartLayout";

const AppRouter = () => {
    return (
        <>
            <Routes>
                <Route element={<StartLayout/>}>
                    <Route element={<MainLayout/>}>
                        <Route index element={<MainPage />} />
                        <Route element={<PrivateRoute/> }>
                            <Route path="room" element={<RoomPage />} />
                            <Route path="library" element={<LibraryPage />}/>
                        </Route>

                        <Route path="login" element={<LoginPage />} />
                        <Route path="register" element={<RegisterPage />} />
                        <Route path="login/success" element={<LoginSuccessPage />} />
                        <Route path="logout" element={<LogoutPage />} />
                    </Route>
                </Route>
            </Routes>
        </>
    );
};

export default AppRouter;