import AudioPlayerOpener from "@/components/ui/player/AudioPlayerOpener/AudioPlayerOpener";
import styles from "./PageLayout.module.scss";
import { useRoomPlayback } from "@playback";

interface PageLayoutProps {
    title?: string;
    children: React.ReactNode;
}

/**
 * PageLayout if layout for simple pages with header to keep same style
 * 
 * @param title is string title for page
 * @param children is page content
 */
const PageLayout = ({ title, children }: PageLayoutProps) => {

    const { roomLoaded } = useRoomPlayback();

    return (
        <div className={styles.layout}>
            {title && <h2 className={styles.header}>{title}</h2>}

            <div className={styles.page}>
                {children}
            </div>

            {roomLoaded && <AudioPlayerOpener />}
        </div>
    );
};

export default PageLayout;