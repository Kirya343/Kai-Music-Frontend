import { NavLink } from "react-router-dom";
import styles from "./MobileNav.module.scss"
import { useRoomPlayback } from "@playback";
import { useAuth } from "@auth";
import { PlaylistIcon, DoorIcon, LibraryIcon, HomeIcon } from "@/assets/icons";

import { ReactNode } from "react";
import { useGlobal } from "@common";


/**
 * interface for NavigationLink conponents
 * 
 * @param to link url
 * @param icon react-svg icon from local pack
 * @param title link title
 * @param condition condition to display link
 */
interface INavigationLink {
    to: string,
    icon: ReactNode,
    title: string,
    condition: boolean
}

const MobileNav = () => {

    const { isMobile } = useGlobal();
    const { isAuthenticated } = useAuth();
    const { room } = useRoomPlayback();

    /**
     * disabling on not mobile displays
     */
    if (!isMobile) return null;

    const links: INavigationLink[] = [
        { to: "/", icon: <HomeIcon className={styles.linkIcon} />, title: "Home", condition: true },
        { to: "/room", icon: <DoorIcon className={styles.linkIcon} />, title: "Room", condition: !!room },
        { to: "/library", icon: <LibraryIcon className={styles.linkIcon} />, title: "Library", condition: isAuthenticated },
        { to: "/playlists", icon: <PlaylistIcon className={styles.linkIcon} />, title: "Playlists", condition: isAuthenticated },
    ]

    return (
        <nav className={styles.nav}>
            {links.map(l => <NavigationLink key={l.title} link={l} />)}
        </nav>
    );
}


/**
 *  NavigationLink is conponent to display navigation links
 */
const NavigationLink = ({ link }: { link: INavigationLink }) => {
    return link.condition && (
        <NavLink to={link.to} className={styles.link}>
            {link.icon}
            <span className={styles.subtitle}>{link.title}</span>
        </NavLink>
    )
}

export default MobileNav;