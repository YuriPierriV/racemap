import database from 'infra/database.js';

export default async function handler(req, res) {
    const { id } = req.query; // Captura o id da URL

    if (req.method === 'GET') {
        // Lida com a requisição GET para obter os detalhes de um track específico
        try {
            const selectQuery = `SELECT * FROM tracks WHERE id = $1`;
            const result = await database.query({ text: selectQuery, values: [id] });

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Track not found' });
            }

            return res.status(200).json(result.rows[0]);
        } catch (err) {
            console.error('Error fetching track:', err.message);
            return res.status(500).json({ error: 'Error fetching track' });
        }
    } else if (req.method === 'PUT') {
        // Lida com a requisição PUT para atualizar um track específico
        const { name, inner_track, outer_track, padding, curveintensity, rotation } = req.body;

        // Valida se os campos essenciais estão presentes
        if (!name || !inner_track || !outer_track || padding === undefined || curveintensity === undefined || rotation === undefined) {
            return res.status(400).json({ error: 'Invalid track data' });
        }

        try {
            const updateQuery = `
        UPDATE tracks
        SET name = $1, inner_track = $2, outer_track = $3, padding = $4, curveintensity = $5, rotation = $6, updated_at = NOW()
        WHERE id = $7
        RETURNING *;
`;

            const values = [
                name,
                JSON.stringify(inner_track),
                JSON.stringify(outer_track),
                padding,
                curveintensity,
                rotation,
                id
            ];

            const result = await database.query({ text: updateQuery, values });

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Track not found' });
            }

            return res.status(200).json(result.rows[0]);
        } catch (err) {
            console.error('Error updating track:', err.message);
            return res.status(500).json({ error: 'Error updating track' });
        }
    } else if (req.method === 'DELETE') {
        // Lida com a requisição DELETE para remover um track específico
        try {
            const deleteQuery = `DELETE FROM tracks WHERE id = $1 RETURNING id`;
            const result = await database.query({ text: deleteQuery, values: [id] });

            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Track not found' });
            }

            return res.status(204).end(); // Retorna sem conteúdo ao deletar com sucesso
        } catch (err) {
            console.error('Error deleting track:', err.message);
            return res.status(500).json({ error: 'Error deleting track' });
        }
    } else {
        // Método HTTP não suportado
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}
