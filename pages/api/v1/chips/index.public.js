import database from "infra/database.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    // Lida com a requisição GET para listar todos os chips
    try {
      const selectQuery = `SELECT * FROM chips`;
      const result = await database.query({ text: selectQuery });
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error("Error fetching chips:", err.message);
      return res.status(500).json({ error: "Error fetching chips" });
    }
  } else if (req.method === "POST") {
    // Lida com a requisição POST para criar um novo chip
    const { chipId } = req.body;

    // Valida se o campo chipId está presente
    if (!chipId) {
      return res.status(400).json({ error: "chipId is required" });
    }

    try {
      const insertQuery = `
        INSERT INTO chips (chip_id, created_at)
        VALUES ($1, NOW())
        RETURNING id;
      `;

      const values = [chipId];

      const result = await database.query({ text: insertQuery, values });
      const chipIdResponse = result.rows[0].id;
      return res
        .status(201)
        .json({ message: "Chip added successfully", chipId: chipIdResponse });
    } catch (err) {
      console.error("Error saving chip data:", err.message);
      return res.status(500).json({ error: "Error saving chip data" });
    }
  } else if (req.method === "DELETE") {
    // Lida com a requisição DELETE para remover um chip
    const { chipId } = req.body;

    // Valida se o campo chipId está presente
    if (!chipId) {
      return res.status(400).json({ error: "chipId is required" });
    }

    try {
      const deleteQuery = `
        DELETE FROM chips
        WHERE chip_id = $1
        RETURNING id;
      `;

      const values = [chipId];

      const result = await database.query({ text: deleteQuery, values });

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Chip not found" });
      }

      return res.status(200).json({ message: "Chip deleted successfully" });
    } catch (err) {
      console.error("Error deleting chip data:", err.message);
      return res.status(500).json({ error: "Error deleting chip data" });
    }
  } else {
    // Método HTTP não suportado
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
