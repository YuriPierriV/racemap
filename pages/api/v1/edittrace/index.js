import database from "infra/database.js";

export default async function editTrace(req, res) {
  if (req.method === 'PUT') {
    const { id, name, inner_trace, outer_trace, padding, curveintensity, rotation } = req.body;

    // Valida se os campos essenciais estão presentes
    if (!id || !name || !inner_trace || !outer_trace || padding === undefined || curveintensity === undefined || rotation === undefined) {
      return res.status(400).json({ error: 'Invalid trace data' });
    }

    try {
      const updateQuery = `
        UPDATE tracks
        SET 
          name = $1,
          inner_trace = $2,
          outer_trace = $3,
          padding = $4,
          curveintensity = $5,
          rotation = $6,
          updated_at = NOW()
        WHERE id = $7
        RETURNING id;
      `;

      const values = [
        name,
        JSON.stringify(inner_trace), // Convertendo os traçados para string JSON
        JSON.stringify(outer_trace),
        padding,
        curveintensity,
        rotation,
        id, // ID do traçado a ser atualizado
      ];

      const result = await database.query({
        text: updateQuery,
        values: values,
      });

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Trace not found' });
      }

      res.status(200).json({ message: 'Trace updated successfully', id });
    } catch (err) {
      console.error('Error updating trace data:', err.message);
      res.status(500).json({ error: 'Error updating trace data' });
    }
  } else {
    // Método HTTP não suportado
    res.status(405).json({ error: 'Metodo Não Suportado' });
  }
}
