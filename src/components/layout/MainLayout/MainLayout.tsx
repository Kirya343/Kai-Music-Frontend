import AudioPlayer from "@/components/ui/player/AudioPlayer/AudioPlayer";
import { Outlet } from "react-router-dom";
import styles from "./MainLayout.module.scss"
import Header from "../navigation/Header/Header";
import MobileNav from "../navigation/MobileNav/MobileNav";
import RoomReturnModal from "@/components/ui/modals/RoomReturnModal/RoomReturnModal";

/**
 * MainLayout if layout for the entire application to keep same style
 */
const MainLayout = () => {

    return (
        <>
            <Header/>

            <main className={styles.main}>
                <Outlet />
            </main>

            <AudioPlayer />

            <MobileNav />

            <RoomReturnModal />
        </>
    )
}

export default MainLayout;