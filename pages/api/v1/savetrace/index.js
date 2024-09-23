import database from "infra/database.js";

async function saveTrace(request, response) {
  const trace = request.body; // Supondo que o traçado seja um array de posições [{lat, long}, ...]

  if (!trace || !Array.isArray(trace) || trace.length === 0) {
    return response.status(400).json({ error: 'Invalid trace data' });
  }

  try {
    const insertQuery = `
            INSERT INTO tracks (trace)
            VALUES ($1)
        `;

    const values = [JSON.stringify(trace)];
    await database.query({
      text: insertQuery,
      values: values,
    });

    response.status(201).json({ message: 'Trace saved successfully' });
  } catch (err) {
    console.error('Error saving trace data:', err.message);
    response.status(500).json({ error: 'Error saving trace data' });
  }
}

export default saveTrace;
