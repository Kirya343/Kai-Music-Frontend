import { NavLink } from "react-router-dom";
import styles from "./MobileNav.module.scss"
import { useRoomPlayback } from "@playback";
import { useAuth } from "@auth";
import DoorIcon from "@/components/icons/navigation/DoorIcon";
import LibraryIcon from "@/components/icons/navigation/LibraryIcon";
import PlaylistIcon from "@/components/icons/navigation/PlaylistIcon";
import HomeIcon from "@/components/icons/navigation/HomeIcon";
import { ReactNode } from "react";

interface ILink {
    to: string,
    icon: ReactNode,
    title: string,
    condition: boolean
}

const MobileNav = () => {

    const isMobile = window.innerWidth < 768;

    const { isAuthenticated } = useAuth();
    const { room } = useRoomPlayback();

    if (!isMobile) return null;

    const links: ILink[] = [
        { to: "/", icon: <HomeIcon className={styles.linkIcon} />, title: "Home", condition: true },
        { to: "/room", icon: <DoorIcon className={styles.linkIcon} />, title: "Room", condition: !!room },
        { to: "/library", icon: <LibraryIcon className={styles.linkIcon} />, title: "Library", condition: isAuthenticated },
        { to: "/playlists", icon: <PlaylistIcon className={styles.linkIcon} />, title: "Playlists", condition: isAuthenticated },
    ]

    return (
        <nav className={styles.nav}>
            {links.map(l => <Link key={l.title} link={l} />)}
        </nav>
    );
}

const Link = ({ link }: { link: ILink }) => {
    return link.condition && (
        <NavLink to={link.to} className={styles.link}>
            {link.icon}
            <span className={styles.subtitle}>{link.title}</span>
        </NavLink>
    )
}

export default MobileNav;