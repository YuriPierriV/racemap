// models/Track.js
import database from "infra/database.js";

const saveTrack = async (trace, mode) => {
    const query = {
        text: `INSERT INTO tracks (trace, created_at) VALUES ($1, NOW()) RETURNING *`,
        values: [JSON.stringify(trace)], // Salva o traçado como JSON
    };

    try {
        const result = await database.query(query);
        return result.rows[0]; // Retorna o traçado salvo
    } catch (error) {
        console.error('Error saving track:', error);
        throw error;
    }
};

export default {
    saveTrack,
};
