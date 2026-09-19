import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@auth";
import { apiFetch } from "@common";

const LogoutPage = () => {

    const navigate = useNavigate();

    const { loadUser } = useAuth();

    const logout = useCallback(async () => {
        try {
            await apiFetch("/auth/logout", { method: "POST" });
        } catch (e) {
            console.error("Logout failed", e);
        } finally {
            navigate("/");
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