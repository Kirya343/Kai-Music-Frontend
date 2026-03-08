import { API_BASE } from "@/config";

export default function Audio() {

    return (
        <audio controls autoPlay>
            <source src={`${API_BASE}/audio`} type="audio/mpeg" />
            Your browser does not support the audio element.
        </audio>
    );
}