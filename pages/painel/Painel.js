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

    if (loading)
        return (
            <div className="flex justify-center items-center space-x-2">
                <div className="w-6 h-6 border-4 border-t-4 border-primary rounded-full animate-spin"></div>
                <span>Carregando...</span>
            </div>
        );
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6 text-center text-text dark:text-dark-text">Tracks</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {tracks.map((track) => (
                    <div
                        key={track.id}
                        className={`relative overflow-hidden rounded-lg shadow-xl transition-all transform hover:scale-105 hover:rotate-2 
                            ${
                                track.created_at > new Date().toISOString()
                                    ? 'bg-gradient-to-b from-primary to-secondary dark:from-dark-primary dark:to-dark-secondary'
                                    : 'bg-gradient-to-r from-background to-secondary dark:from-dark-secondary dark:to-dark-primary'
                            } 
                            text-white p-4`}
                    >
                        <div className="absolute inset-0 bg-black opacity-25"></div>
                        <div className="flex items-center space-x-2 mb-4">
                            <h2 className="text-lg font-semibold text-text dark:text-dark-text">{track.name}</h2>
                        </div>
                        <CanvasDisplay track={track} width="w-full" height="h-[200px]" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 backdrop-blur-lg rounded-bl-lg rounded-br-lg">
                            <p className="text-sm text-text dark:text-dark-text">
                                Criado em: {new Date(track.created_at).toLocaleDateString()}{" "}
                                {new Date(track.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Painel;
