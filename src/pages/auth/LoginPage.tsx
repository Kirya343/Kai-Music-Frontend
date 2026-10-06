import { api } from "@common"
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import clsx from "clsx";
import AuthLayout from "@/components/layout/AuthLayout";

const LoginPage = () => {

    const params = new URLSearchParams(window.location.search);
    const navigate = useNavigate();
    const redirect = params.get("redirect") || `/`;
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<{message: string, success: boolean} | "loading" | null>(null);

    function validateEmail(name: string) {
        if (!name) {
            setMessage({success: false, message: "Enter email"});
            return false;
        }
        return true;
    }

    function validatePassword(password: string) {

        if (!password) {
            setMessage({success: false, message: "Enter password"});
            return false;
        }
        return true;
    }

    const handleLogin = async () => {

        if (!validateEmail(email)) return;
        if (!validatePassword(password)) return;

        // Добавляем redirect к ссылке OAuth encodeURIComponent(redirect)
        const data = {
            email,
            password
        }

        try {
            setMessage("loading")
            const res = await api.post("/auth/login", data);
            setMessage(res.data);

            if (res.data.success == true) {
                setTimeout(() => {
                    navigate(`/login/success?redirect=${encodeURIComponent(redirect)}`)
                }, 1500);
            }
        } catch (e) {
            setMessage({ success: false, message: String(e)});
        }
    };

    return (
        <AuthLayout
            title={"Login"}
            message={message}
            inputs={(
                <>
                    <input 
                        type="text"
                        placeholder="Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="btn" onClick={handleLogin}>Sign In</button>
                </>
            )}
            links={(<Link to="/register">Luo Tili</Link>)}
        />
    );
};

export default LoginPage;