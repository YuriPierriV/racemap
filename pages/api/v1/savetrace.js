import database from "infra/database.js";

async function saveTrace(request, response) {
    const trace = request.body; // Supondo que o traçado seja um array de posições [{lat, long}, ...]
    console.log(request.body);

    if (!trace || !Array.isArray(trace) || trace.length === 0) {
        return response.status(400).send('Invalid trace data');
    }

    try {
        // Montando a query de inserção para adicionar o traçado como JSONB
        const insertQuery = `
            INSERT INTO tracks (trace)
            VALUES ($1)
        `;

        // O traçado será armazenado como JSONB
        const values = [JSON.stringify(trace)];

        // Executa a query
        await database.query({
            text: insertQuery,
            values: values
        });

        response.status(201).send('Trace saved successfully');
    } catch (err) {
        console.error(err);
        response.status(500).send('Error saving trace data');
    }
}

export default saveTrace;
