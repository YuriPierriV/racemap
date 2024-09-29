import database from "infra/database.js";

async function getSavedTraces(request, response) {
  try {
    const result = await database.query('SELECT * FROM tracks ORDER BY created_at DESC');
    response.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching trace:', err);
    response.status(500).json({ error: 'Error fetching trace' });
  }
}

export default getSavedTraces;
