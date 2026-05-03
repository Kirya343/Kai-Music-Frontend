import { apiFetchJson, apiFetchJsonDebug } from "@/lib"
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const LoginPage = () => {

    const params = new URLSearchParams(window.location.search);
    const navigate = useNavigate();
    const error = params.get("error") || "";
    const redirect = params.get("redirect") || `/`;
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<{message: string, success: boolean} | null>(null);

    function validateEmail(name: string) {
        if (!name) {
            setMessage({success: false, message: "Введите email"});
            return false;
        }
        return true;
    }

    function validatePassword(password: string) {

        if (!password) {
            setMessage({success: false, message: "Введите пароль"});
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
        const res = await apiFetchJson("/auth/login", { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        setMessage(res);
        if (res.success == true) {
            setTimeout(() => {
                navigate(`/login/success?redirect=${encodeURIComponent(redirect)}`)
            }, 1500);
        }
    };

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            console.log(event)
            if (event.data?.type === 'oauthSuccess') {
                setMessage({success: false, message: "Вы успешно авторизовались"});
                navigate((event.data.isNewUser ? "/register/oauth" : "/login/success") + `?redirect=${encodeURIComponent(redirect)}` || '/');
            } else if (event.data?.type === 'oauthFailure') {
                setMessage({success: false, message: "Ошибка авторизации"});
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [navigate]);

    return (
        <div className="login-body">

            <div className="form-wrap" role="main">
                <div className="logo">
                    <img src="/image/logo.png"/>
                </div>

                {message?.message && <div className={`message ${message?.success ? "success" : "error"}`}>{message?.message}</div>}

                <div className="inputs">
                    <input 
                        type="text"
                        placeholder="Почта" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input 
                        type="password" 
                        placeholder="Пароль" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="btn" onClick={handleLogin}>Войти</button>
                </div>

                <div className="links">
                    <Link to="/register">Регистрация</Link> &nbsp;|&nbsp;
                    <a href="#">Забыли пароль?</a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;