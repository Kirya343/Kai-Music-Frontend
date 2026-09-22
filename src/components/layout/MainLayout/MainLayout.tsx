import Audio from "@/components/ui/player/Audio/Audio";
import { Outlet } from "react-router-dom";
import styles from "./MainLayout.module.scss"
import Header from "../../ui/Header/Header";

const MainLayout = () => {

    return (
        <>
            <Header/>

            <main className={styles.main}>
                <Outlet />
            </main>

            <Audio />
        </>
    )
}

export default MainLayout;