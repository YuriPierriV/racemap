import database from "infra/database.js";

export default async function deleteTrace(req, res) {
    if (req.method === 'DELETE') {
        // Obtém o ID do traço a partir da URL ou do corpo da requisição
        const { id } = req.body;
        console.log(req.body)

        // Valida se o ID foi fornecido
        if (!id) {
            return res.status(400).json({ error: 'Invalid trace ID' });
        }

        try {
            const deleteQuery = `
        DELETE FROM tracks 
        WHERE id = $1
        RETURNING id;
    `;

            const values = [id];

            const result = await database.query({
                text: deleteQuery,
                values: values,
            });

            // Verifica se algum registro foi deletado
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Trace not found' });
            }

            res.status(200).json({ message: 'Trace deleted successfully', deletedId: id });
        } catch (err) {
            console.error('Error deleting trace data:', err.message);
            res.status(500).json({ error: 'Error deleting trace data' });
        }
    } else {
        // Método HTTP não suportado
        res.status(405).json({ error: 'Method Not Supported' });
    }
}
