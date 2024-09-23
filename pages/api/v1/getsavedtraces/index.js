import database from "infra/database.js";

async function getSavedTraces(request, response) {
  try {
    const result = await database.query('SELECT * FROM tracks ORDER BY created_at DESC');
    if (result.rows.length > 0) {
      response.status(200).json(result.rows);
    } else {
      response.status(404).json({ message: 'No trace found' });
    }
  } catch (err) {
    console.error('Error fetching trace:', err);
    response.status(500).json({ error: 'Error fetching trace' });
  }
}

export default getSavedTraces;
