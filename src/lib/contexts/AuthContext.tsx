import { createContext, useContext } from "react";
import { IUser } from "../types";

interface AuthContextType {
    isAuthenticated: boolean;
    user: IUser | null;
    setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
    loading: boolean;
    loadUser: () => Promise<boolean>;
    isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return ctx;
}