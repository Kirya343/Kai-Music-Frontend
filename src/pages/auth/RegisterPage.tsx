import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@auth";
import { api } from "@common";
import AuthLayout from "@/components/layout/AuthLayout";

const RegisterPage = () => {

    const { loadUser } = useAuth();
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect") || `/`;
    const navigate = useNavigate();

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

        try {
            const res = await api.post("/auth/register", data);
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

    function validateEmail(email: string) {

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            setMessage({success: false, message: "Enter email"});
            return false;
        }

        if (!emailRegex.test(email)) {
            setMessage({success: false, message: "This doesn't look like an email"});
            return false;
        }
        return true;
    }

    function validateName(name: string) {
        if (!name) {
            setMessage({success: false, message: "Enter name"});
            return false;
        }
        const pattern = /^[A-Za-z0-9_]{3,16}$/;
        if(!pattern.test(name.trim())) {
            setMessage({success: false, message: "The name can only contain Latin letters and numbers"});
            return false;
        }
        return true;
    }

    function validatePassword(password: string) {

        if (!password) {
            setMessage({success: false, message: "Enter Password"});
            return false;
        }

        if (password.length < 8) {
            setMessage({success: false, message: "The password must be at least 8 characters long"});
            return false;
        }

        if (password != passwordConfirm) {
            setMessage({success: false, message: "The passwords do not match"});
            return false;
        }
        return true;
    }

    return (
        <AuthLayout
            title={"Register"}
            message={message}
            inputs={(
                <>
                    <input 
                        type="text"
                        placeholder="Your name" 
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
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <input 
                        type="password" 
                        placeholder="Repeat password" 
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                    />
                    <button className="btn" onClick={register}>Sign Up</button>
                </>
            )}
            links={(<Link to="/login">Sign In</Link>)}
        />
    );
};

export default RegisterPage;