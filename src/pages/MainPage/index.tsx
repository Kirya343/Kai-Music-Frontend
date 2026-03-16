import { useState } from "react";
import ListeningRoom from "./ListeningRoom";
import RoomsList from "./RoomsList";

const MainPage = () => {

    const [loaded, setLoaded] = useState<boolean>(false);
    
    return (
        <div className="main-page">
            <div className="box">
                {loaded ? 
                    <ListeningRoom /> : 
                    <div className="click-overlay" onClick={() => setLoaded(true)}>Нажмите чтобы подключиться к комнате</div>
                }
            </div>
            <RoomsList />
        </div>
    )
}

export default MainPage;