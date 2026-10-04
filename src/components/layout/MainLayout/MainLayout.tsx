import Audio from "@/components/ui/player/Audio/Audio";
import { Outlet } from "react-router-dom";
import styles from "./MainLayout.module.scss"
import Header from "../navigation/Header/Header";
import MobileNav from "../navigation/MobileNav/MobileNav";
import RoomReturnModal from "@/components/ui/RoomReturnModal/RoomReturnModal";

const MainLayout = () => {

    return (
        <>
            <Header/>

            <main className={styles.main}>
                <Outlet />
            </main>

            <Audio />
            <MobileNav />

            <RoomReturnModal />
        </>
    )
}

export default MainLayout;