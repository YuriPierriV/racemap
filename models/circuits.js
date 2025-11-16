import database from "infra/database";
import { NotFoundError, ValidationError } from "infra/errors/errors";

async function create(circuitInputValues) {
  await validateCircuitData(circuitInputValues);

  const newCircuit = await runInsertQuery(circuitInputValues);
  return newCircuit;

  async function validateCircuitData(inputValues) {
    // Valida se o nome está presente
    if (!inputValues.nome || inputValues.nome.trim() === "") {
      throw new ValidationError({
        message: "O nome do circuito é obrigatório.",
        action: "Informe um nome válido para o circuito.",
      });
    }

    // Valida se os pontos estão presentes e são um array válido
    if (!inputValues.pontos || !Array.isArray(inputValues.pontos) || inputValues.pontos.length === 0) {
      throw new ValidationError({
        message: "Os pontos do circuito são obrigatórios.",
        action: "Informe pelo menos um ponto para o circuito.",
      });
    }

    // Valida se a direção é válida
    if (inputValues.direcao && !['clockwise', 'counterclockwise'].includes(inputValues.direcao)) {
      throw new ValidationError({
        message: "A direção deve ser 'clockwise' ou 'counterclockwise'.",
        action: "Informe uma direção válida para o circuito.",
      });
    }

    // Valida se o tipo de circuito é válido
    if (inputValues.tipo_circuito && !['closed', 'point-to-point'].includes(inputValues.tipo_circuito)) {
      throw new ValidationError({
        message: "O tipo de circuito deve ser 'closed' ou 'point-to-point'.",
        action: "Informe um tipo válido para o circuito.",
      });
    }

    // Valida se o tamanho do percurso é um número positivo
    if (inputValues.tamanho_percurso && (isNaN(inputValues.tamanho_percurso) || inputValues.tamanho_percurso < 0)) {
      throw new ValidationError({
        message: "O tamanho do percurso deve ser um número positivo.",
        action: "Informe um tamanho válido para o circuito.",
      });
    }
  }

  async function runInsertQuery(inputValues) {
    const results = await database.query({
      text: `
          INSERT INTO circuits (nome, descricao, tamanho_percurso, pontos, direcao, tipo_circuito)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `,
      values: [
        inputValues.nome,
        inputValues.descricao || null,
        inputValues.tamanho_percurso || null,
        JSON.stringify(inputValues.pontos),
        inputValues.direcao || 'clockwise',
        inputValues.tipo_circuito || 'closed',
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
          circuits
        ORDER BY
          created_at DESC
        ;`,
  };

  const results = await database.query(query);
  return results.rows;
}

async function findOneById(circuitId, options = {}) {
  const baseQuery = `
        WITH circuit_found AS (
          SELECT
            *
          FROM
            circuits
          WHERE
            id = $1
          LIMIT
            1
        )`;

  const queryText = `${baseQuery} SELECT * FROM circuit_found;`;

  const query = {
    text: queryText,
    values: [circuitId],
  };

  const results = await database.query(query, options);

  if (results.rowCount === 0) {
    throw new NotFoundError({
      message: `O circuito com id "${circuitId}" não foi encontrado no sistema.`,
      action: 'Verifique se o "id" está digitado corretamente.',
    });
  }

  return results.rows[0];
}

async function update(circuitId, updateValues) {
  await validateUpdateData(updateValues);
  
  const updatedCircuit = await runUpdateQuery(circuitId, updateValues);
  return updatedCircuit;

  async function validateUpdateData(inputValues) {
    // Valida se a direção é válida (se fornecida)
    if (inputValues.direcao && !['clockwise', 'counterclockwise'].includes(inputValues.direcao)) {
      throw new ValidationError({
        message: "A direção deve ser 'clockwise' ou 'counterclockwise'.",
        action: "Informe uma direção válida para o circuito.",
      });
    }

    // Valida se o tipo de circuito é válido (se fornecido)
    if (inputValues.tipo_circuito && !['closed', 'point-to-point'].includes(inputValues.tipo_circuito)) {
      throw new ValidationError({
        message: "O tipo de circuito deve ser 'closed' ou 'point-to-point'.",
        action: "Informe um tipo válido para o circuito.",
      });
    }

    // Valida se o tamanho do percurso é um número positivo (se fornecido)
    if (inputValues.tamanho_percurso && (isNaN(inputValues.tamanho_percurso) || inputValues.tamanho_percurso < 0)) {
      throw new ValidationError({
        message: "O tamanho do percurso deve ser um número positivo.",
        action: "Informe um tamanho válido para o circuito.",
      });
    }
  }

  async function runUpdateQuery(circuitId, inputValues) {
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (inputValues.nome !== undefined) {
      updateFields.push(`nome = $${paramCount}`);
      values.push(inputValues.nome);
      paramCount++;
    }

    if (inputValues.descricao !== undefined) {
      updateFields.push(`descricao = $${paramCount}`);
      values.push(inputValues.descricao);
      paramCount++;
    }

    if (inputValues.tamanho_percurso !== undefined) {
      updateFields.push(`tamanho_percurso = $${paramCount}`);
      values.push(inputValues.tamanho_percurso);
      paramCount++;
    }

    if (inputValues.pontos !== undefined) {
      updateFields.push(`pontos = $${paramCount}`);
      values.push(JSON.stringify(inputValues.pontos));
      paramCount++;
    }

    if (inputValues.direcao !== undefined) {
      updateFields.push(`direcao = $${paramCount}`);
      values.push(inputValues.direcao);
      paramCount++;
    }

    if (inputValues.tipo_circuito !== undefined) {
      updateFields.push(`tipo_circuito = $${paramCount}`);
      values.push(inputValues.tipo_circuito);
      paramCount++;
    }

    if (updateFields.length === 0) {
      throw new ValidationError({
        message: "Nenhum campo para atualizar foi fornecido.",
        action: "Informe pelo menos um campo para atualizar.",
      });
    }

    updateFields.push(`updated_at = timezone('UTC', now())`);
    values.push(circuitId);

    const query = {
      text: `
          UPDATE circuits 
          SET ${updateFields.join(', ')}
          WHERE id = $${paramCount}
          RETURNING *
        `,
      values,
    };

    const results = await database.query(query);

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: `O circuito com id "${circuitId}" não foi encontrado no sistema.`,
        action: 'Verifique se o "id" está digitado corretamente.',
      });
    }

    return results.rows[0];
  }
}

async function deleteById(circuitId) {
  const query = {
    text: `
        DELETE FROM circuits 
        WHERE id = $1
        RETURNING *
      `,
    values: [circuitId],
  };

  const results = await database.query(query);

  if (results.rowCount === 0) {
    throw new NotFoundError({
      message: `O circuito com id "${circuitId}" não foi encontrado no sistema.`,
      action: 'Verifique se o "id" está digitado corretamente.',
    });
  }

  return results.rows[0];
}

const circuit = {
  create,
  findAll,
  findOneById,
  update,
  deleteById,
};

export default circuit;
