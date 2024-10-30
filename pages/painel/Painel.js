import React, { useEffect, useState } from "react";
import { BASE_URL } from "pages/utils/config";
import CanvasDisplay from "pages/lista/CanvasDisplay";

const Painel = () => {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTracks();
    }, []);

    const fetchTracks = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/v1/tracks`);
            if (!response.ok) {
                throw new Error("Erro ao buscar as tracks");
            }
            const data = await response.json();
            const adjustedData = data.map((track) => ({
                ...track,
                created_at: adjustTimezone(track.created_at),
            }));
            setTracks(adjustedData);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const adjustTimezone = (createdAt) => {
        const date = new Date(createdAt);
        date.setHours(date.getHours() - 3);
        return date.toISOString();
    };

    if (loading) return <div className="text-center">Carregando...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4 text-center">Tracks</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {tracks.map((track) => (
                    <div
                        key={track.id}
                        className={`relative overflow-hidden rounded-xl shadow-lg transition-transform transform hover:scale-105 
                            bg-gradient-to-r ${track.created_at > new Date().toISOString() ? 'from-primary to-secondary' : 'from-dark-primary to-dark-secondary'} 
                            text-white p-6`}
                    >
                        <div className="absolute inset-0 bg-black opacity-25"></div>
                        <h2 className="text-xl font-semibold mb-2">{track.name}</h2>
                        <CanvasDisplay
                            track={track}
                            width="w-full"
                            height="h-[250px]" // Aumentar a altura do canvas
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-opacity-50 bg-black rounded-bl-xl rounded-br-xl">
                            <p className="text-sm">
                                Criado em: {new Date(track.created_at).toLocaleDateString()} {new Date(track.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Painel;
