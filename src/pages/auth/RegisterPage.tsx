import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
    apiFetchJson,
    useAuth
} from "@/lib";

const RegisterPage = () => {

    const {loadUser} = useAuth();
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect") || `/`;
    const error = params.get("error") || "";
    const navigate = useNavigate();

    const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [passwordConfirm, setPasswordConfirm] = useState<string>('');
    const [message, setMessage] = useState<{message: string, success: boolean} | null>(null);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const register = async () => {

        if (!validateEmail(email)) return;
        if (!validateName(name)) return;
        if (!validatePassword(password)) return;

        // Добавляем redirect к ссылке OAuth encodeURIComponent(redirect)
        const data = { email, name, password }

        const res = await apiFetchJson("/auth/register", { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (res) {
            setMessage(res)
        }

        if (res.success == true) {
            loadUser();
            navigate(`/login/success?redirect=${encodeURIComponent(redirect)}`)
        }
    };

    function validateEmail(email: string) {

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            setMessage({success: false, message: "Введине email"});
            return false;
        }

        if (!emailRegex.test(email)) {
            setMessage({success: false, message: "Это не похоже на email"});
            return false;
        }
        return true;
    }

    function validateName(name: string) {
        if (!name) {
            setMessage({success: false, message: "Введите имя"});
            return false;
        }
        const pattern = /^[A-Za-z0-9_]{3,16}$/;
        if(!pattern.test(name.trim())) {
            setMessage({success: false, message: "Имя может содержать только латинские символы и цифры"});
            return false;
        }
        return true;
    }

    function validatePassword(password: string) {

        if (!password) {
            setMessage({success: false, message: "Введите пароль"});
            return false;
        }

        if (password.length < 8) {
            setMessage({success: false, message: "Пароль должен быть не короче 8ми символов"});
            return false;
        }

        if (password != passwordConfirm) {
            setMessage({success: false, message: "Пароли не совпадают"});
            return false;
        }
        return true;
    }

    return (
        <div className="login-body">
            <div className="form-wrap" role="main">
                <div className="logo">
                    <img src="/image/logo.png"/>
                </div>

                {message?.message && <div className={'message' + message?.success ? "success" : "error"}>{message?.message}</div>}

                <div>
                    <input 
                        type="text"
                        placeholder="Имя пользователя" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input 
                        type="text"
                        placeholder="Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input 
                        type="password" 
                        placeholder="Пароль" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <input 
                        type="password" 
                        placeholder="Повторите пароль" 
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                    />
                    <button className="btn" onClick={register}>Зарегистрироваться</button>
                </div>

                <div className="links">
                    <Link to="/login">Вход</Link> &nbsp;|&nbsp;
                    <a href="#">Забыли пароль?</a>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;