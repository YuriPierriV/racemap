import database from "infra/database";
import { NotFoundError, ValidationError } from "infra/errors/errors";

async function create(inputValues) {
    await validateUniqueChipUser(inputValues.chip_id);

    const newDevice = await runInsertQuery(inputValues);
    return newDevice;

    async function validateUniqueChipUser(chip_id) {
        const results = await database.query({
            text: `
                  SELECT chip_id FROM devices WHERE LOWER(chip_id) = LOWER($1)
                `,
            values: [chip_id],
        });
        if (results.rowCount > 0) {
            throw new ValidationError({
                message: "Esse chip já foi cadastrado.",
                action: "Verifique o chip id ou entre em contato com o suporte.",
            });
        }
    }

    async function runInsertQuery(inputValues) {
        const results = await database.query({
            text: `
          INSERT INTO devices (chip_id)
          VALUES ($1)
          RETURNING *
        `,
            values: [
                inputValues.chip_id
            ],
        });
        return results.rows[0];
    }
}


async function findAll() {
    
    const query = {
        text: `
        SELECT
          *
        FROM
          devices
        ORDER BY
          created_at ASC
        ;`
    };

    const results = await database.query(query);
    return results.rows;
}




async function findOneById(deviceId, options = {}) {
    const baseQuery = `
        WITH device_found AS (
          SELECT
            *
          FROM
            devices
          WHERE
            id = $1
          LIMIT
            1
        )`;

    const queryText = `${baseQuery} SELECT * FROM device_found;`;

    const query = {
        text: queryText,
        values: [deviceId],
    };

    const results = await database.query(query, options);

    if (results.rowCount === 0) {
        throw new NotFoundError({
            message: `O dispositivo com id "${deviceId}" não foi encontrado no sistema.`,
            action: 'Verifique se o "id" está digitado corretamente.',
        });
    }

    return results.rows[0];
}

const device = {
    create,
    findOneById,
    findAll,
};

export default device;
