// LoginSuccessPage.jsx
import { useEffect } from "react";
import { useAuth } from "@/lib";
import { useNavigate, useLocation } from "react-router-dom";

const LoginSuccessPage = () => {
    const { user, loadUser, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    useEffect(() => {
        if (!loading && user) {
            const from = new URLSearchParams(location.search).get("redirect") || "/";
            navigate(from, { replace: true });
        }
    }, [loading, user, location.search, navigate]);

    return null;
};
export default LoginSuccessPage;