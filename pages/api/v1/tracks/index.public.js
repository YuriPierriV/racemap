import database from "infra/database.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    // Lida com a requisição GET para listar todos os tracks
    try {
      const selectQuery = `SELECT * FROM tracks`;
      const result = await database.query({ text: selectQuery });
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error("Error fetching tracks:", err.message);
      return res.status(500).json({ error: "Error fetching tracks" });
    }
  } else if (req.method === "POST") {
    // Lida com a requisição POST para criar um novo track
    const {
      name,
      inner_track,
      outer_track,
      padding,
      curveintensity,
      rotation,
    } = req.body;

    // Valida se os campos essenciais estão presentes
    if (
      !name ||
      !inner_track ||
      !outer_track ||
      padding === undefined ||
      curveintensity === undefined ||
      rotation === undefined
    ) {
      return res.status(400).json({ error: "Invalid track data" });
    }

    try {
      const insertQuery = `
        INSERT INTO tracks (name, inner_track, outer_track, padding, curveintensity, created_at, updated_at, rotation)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), $6)
        RETURNING id;
`;

      const values = [
        name,
        JSON.stringify(inner_track),
        JSON.stringify(outer_track),
        padding,
        curveintensity,
        rotation,
      ];

      const result = await database.query({ text: insertQuery, values });
      const trackId = result.rows[0].id;
      return res
        .status(201)
        .json({ message: "Track saved successfully", trackId });
    } catch (err) {
      console.error("Error saving track data:", err.message);
      return res.status(500).json({ error: "Error saving track data" });
    }
  } else {
    // Método HTTP não suportado
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
