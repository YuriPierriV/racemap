import database from "infra/database.js";

async function saveTrace(request, response) {
  const { name, inner_trace, outer_trace, padding, curveintensity } = request.body;

  // Valida se os campos essenciais estão presentes
  if (!name || !inner_trace || !outer_trace || padding === undefined || curveintensity === undefined) {
    return response.status(400).json({ error: 'Invalid trace data' });
  }

  try {
    const insertQuery = `
      INSERT INTO tracks (name, inner_trace, outer_trace, padding, curveintensity, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id;
    `;

    const values = [
      name,
      JSON.stringify(inner_trace), // Convertendo os traçados para string JSON
      JSON.stringify(outer_trace),
      padding,
      curveintensity,
    ];

    const result = await database.query({
      text: insertQuery,
      values: values,
    });

    const trackId = result.rows[0].id; // Captura o ID do track recém-criado
    response.status(201).json({ message: 'Trace saved successfully', trackId });
  } catch (err) {
    console.error('Error saving trace data:', err.message);
    response.status(500).json({ error: 'Error saving trace data' });
  }
}

export default saveTrace;
