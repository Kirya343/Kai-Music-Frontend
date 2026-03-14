import { AuthContext } from "../contexts";
import { userService } from "@/lib";

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {

    const { user, isAuthenticated, loading, shortUser, isAdmin, loadUser } = userService.useCurrentUser();

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, shortUser, loading, isAdmin, loadUser }}>
            {children}
        </AuthContext.Provider>
    );
};