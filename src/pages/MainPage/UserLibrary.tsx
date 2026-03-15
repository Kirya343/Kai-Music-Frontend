import Modal from "@/components/ui/Modal";
import { IAudio } from "@/lib";
import { audioService } from "@/lib/services/audio";
import { useCallback, useEffect, useState } from "react"

const UserLibrary = ({addToQueue}: {addToQueue: (audioId: number) => void}) => {

    const [isOpen, setOpen] = useState<boolean>(false);
    const [audios, setAudios] = useState<IAudio[] | null>(null)

    const loadLibrary = useCallback(async () => {
        const data = await audioService.loadLibrary();
        setAudios(data)
    }, [])
    useEffect(() => {
        loadLibrary()
    }, []);

    const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (!files) return;

        const fileArray: File[] = Array.from(files);

        for (const file of fileArray) {
            const formData = new FormData();
            formData.append("file", file);

            await audioService.upload(formData);
        }

        loadLibrary();
    };

    return (
        <>
            <button onClick={() => setOpen(true)}>
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" height="24" 
                    viewBox="0 0 24 24" fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"
                />
                    <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
            </button>

            <Modal title="Библиотека музыки" isOpen={isOpen} onClose={() => setOpen(false)} id="musicLibrary">
                <div className="library-header"></div>
                <input 
                    type="file"
                    accept="audio/*"
                    multiple
                    onChange={handleAudioUpload}
                />
                <div className="music-library">
                    {audios?.map(audio => (
                        <div key={audio.id} className="audio-item" onClick={() => addToQueue(audio?.id)}>
                            <span className="audio-id">#{audio.id}</span>
                            <span className="audio-name">{audio.name}</span>
                        </div>
                    ))}
                </div>
            </Modal>
        </>
    )
}

export default UserLibrary;