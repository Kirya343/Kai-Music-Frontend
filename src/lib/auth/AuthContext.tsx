import { createContext, useContext } from "react";
import { IShortUser, IUser } from "@/lib/user/userTypes";
import { userService } from "@/lib/user/services";

interface AuthContextType {
    isAuthenticated: boolean;
    user: IUser | null;
    shortUser: IShortUser | null;
    loading: boolean;
    isAdmin: boolean;
    loadUser: () => void
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return ctx;
}

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {

    const { user, isAuthenticated, loading, shortUser, isAdmin, loadUser } = userService.useCurrentUser();

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, shortUser, loading, isAdmin, loadUser }}>
            {children}
        </AuthContext.Provider>
    );
};