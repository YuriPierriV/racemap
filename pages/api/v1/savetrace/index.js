import database from "infra/database.js";

export default async function saveTrace(req, res) {
  if (req.method === 'POST') {
    const { name, inner_trace, outer_trace, padding, curveintensity, rotation } = req.body;

    // Valida se os campos essenciais estão presentes
    if (!name || !inner_trace || !outer_trace || padding === undefined || curveintensity === undefined || rotation === undefined) {
      return res.status(400).json({ error: 'Invalid trace data' });
    }

    try {
      const insertQuery = `
        INSERT INTO tracks (name, inner_trace, outer_trace, padding, curveintensity, created_at, updated_at, rotation)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), $6)
        RETURNING id;
      `;

      const values = [
        name,
        JSON.stringify(inner_trace), // Convertendo os traçados para string JSON
        JSON.stringify(outer_trace),
        padding,
        curveintensity,
        rotation,
      ];

      const result = await database.query({
        text: insertQuery,
        values: values,
      });

      const trackId = result.rows[0].id; // Captura o ID do track recém-criado
      res.status(201).json({ message: 'Trace saved successfully', trackId });
    } catch (err) {
      console.error('Error saving trace data:', err.message);
      res.status(500).json({ error: 'Error saving trace data' });
    }
  } else {
    // Método HTTP não suportado
    res.status(405).json({ error: 'Metodo Não Suportado' });
  }
}

