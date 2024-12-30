import database from "infra/database.js";
import { v4 as uuidv4 } from "uuid"; // Adiciona o pacote para gerar UUIDs (ou use outra lógica)

export default async function handler(req, res) {
  if (req.method === "GET") {
    // Lida com a requisição GET para listar todas as races
    try {
      const selectQuery = `SELECT * FROM races`;
      const result = await database.query({ text: selectQuery });
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error("Error fetching races:", err.message);
      return res.status(500).json({ error: "Error fetching races" });
    }
  } else if (req.method === "POST") {
    // Lida com a requisição POST para criar uma nova race
    const { track_id, status } = req.body;

    // Valida se os campos essenciais estão presentes
    if (!track_id || !status) {
      return res.status(400).json({ error: "Invalid race data" });
    }

    // Gera um link aleatório
    const generatedLink = uuidv4();

    try {
      const insertQuery = `
        INSERT INTO races (track_id, status, link, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING id;
`;

      const values = [track_id, status, generatedLink];

      const result = await database.query({ text: insertQuery, values });
      const raceId = result.rows[0].id;
      return res.status(201).json({
        message: "Race saved successfully",
        raceId,
        link: generatedLink,
      });
    } catch (err) {
      console.error("Error saving race data:", err.message);
      return res.status(500).json({ error: "Error saving race data" });
    }
  } else {
    // Método HTTP não suportado
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
