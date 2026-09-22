import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@auth"

const PrivateRoute = () => {
    const { loading, isAuthenticated } = useAuth();

    // console.log("PrivateRoute: ", loading, isAuthenticated)
    
    if (!loading && !isAuthenticated) {
        return <Navigate to={"/login"} />
    }

    return <Outlet />
}

export default PrivateRoute;