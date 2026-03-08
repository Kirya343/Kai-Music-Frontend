import { useCallback, useEffect } from "react";
import { apiFetch, useAuth } from "@/lib";
import { useNavigate } from "react-router-dom";

const LogoutPage = () => {

    const navigate = useNavigate();

    const { loadUser } = useAuth();

    const logout = useCallback(async () => {
        try {
            await apiFetch("/auth/logout", { method: "POST" });
        } catch (e) {
            console.error("Logout failed", e);
        } finally {
            navigate("/main");
            loadUser();
        }
    }, [navigate, loadUser]);

    useEffect(() => {
        logout()
    }, [logout])
    
    return (
        <></>
    );
};

export default LogoutPage;