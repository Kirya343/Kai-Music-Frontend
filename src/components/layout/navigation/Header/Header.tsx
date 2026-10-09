import { Link, NavLink, useNavigate } from "react-router-dom";
import { useRoomPlayback } from "@room";
import styles from "./Header.module.scss"
import { useAuth } from "@/lib/auth";
import { PlaylistIcon, DoorIcon, LibraryIcon, UserIcon } from "@/assets/icons";
import { useGlobal } from "@common";
import { ReactNode } from "react";

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

/**
 * Header is the layout component that contains navigation
 */
const Header = () => {

    const { user, isAuthenticated } = useAuth();
    const { room } = useRoomPlayback();
    const { isMobile } = useGlobal();
    const navigate = useNavigate();

    /**
     * disabling on mobile displays
     */
    if (isMobile) return null;

    const links: INavigationLink[] = [
        { to: "/room", icon: <DoorIcon className={styles.linkIcon} />, title: "Room", condition: !!room },
        { to: "/library", icon: <LibraryIcon className={styles.linkIcon} />, title: "Library", condition: isAuthenticated },
        { to: "/playlists", icon: <PlaylistIcon className={styles.linkIcon} />, title: "Playlists", condition: isAuthenticated },
    ]
    
    return (
        <header className={styles.header}>
            <div className={styles.headerContainer}>
                <img className={styles.logo} src="/image/logo.png" onClick={() => navigate("/")}/>
                <div className={styles.navigation}>
                    {links.map(l => <NavigationLink key={l.title} link={l} />)}
                </div>
                {isAuthenticated ? (
                    <div className={styles.auth}>
                        <UserIcon className={styles.icon}/>
                        <span className={styles.userName}>{user?.name}</span>
                    </div>
                ) : (
                    <Link to="/login">Sign In</Link>
                )}
            </div>
        </header>
    )
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

export default Header;