import { useState, useEffect, useCallback, useMemo } from "react";
import { AuthContext } from "../contexts";
import { IUser, userService } from "@/lib";

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {

    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const isAuthenticated = useMemo<boolean>(() => !!user, [user]);
    const isAdmin = useMemo<boolean>(
        () => user?.roles?.some(r => r.name === "ADMIN") ?? false, [user]);

    const loadUser = useCallback(async () => {
        try {
            const currentUser: IUser = await userService.getCurrent();
            setUser(currentUser);
            console.log("Пользователь аутентифицирован");
            return true;
        } catch (e) {
            console.error(e);
            setUser(null);
            setLoading(false);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, setUser, loading, loadUser, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};