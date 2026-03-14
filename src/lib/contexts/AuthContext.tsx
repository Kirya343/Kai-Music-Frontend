import { createContext, useContext } from "react";
import { IShortUser, IUser } from "../types";

interface AuthContextType {
    isAuthenticated: boolean;
    user: IUser | null;
    shortUser: IShortUser | null;
    loading: boolean;
    isAdmin: boolean;
    loadUser: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return ctx;
}