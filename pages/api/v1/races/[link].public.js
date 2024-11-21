import database from "infra/database.js";

export default async function handler(req, res) {
  const { link } = req.query; // Obtém o link da URL

  if (req.method === "GET") {
    try {
      // Modifique a consulta para incluir os dados da track
      const selectQuery = `
        SELECT r.*, t.*
        FROM races r
        JOIN tracks t ON r.track_id = t.id
        WHERE r.link = $1
      `;
      const result = await database.query({
        text: selectQuery,
        values: [link],
      });

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Race not found" });
      }

      // Retorna os dados da corrida e da track
      return res.status(200).json(result.rows[0]); // Aqui você terá os dados da race e da track
    } catch (err) {
      console.error("Error fetching race:", err.message);
      return res.status(500).json({ error: "Error fetching race" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
