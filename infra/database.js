/* eslint-disable import/no-anonymous-default-export */
import Client from "pg/lib/client";
import { ServiceError } from "./errors/errors";

async function query(queryObject) {
  let client;

  try {
    client = await getNewClient();
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    const ServiceErrorObject = new ServiceError({
      message: "Erro na conexão com o Banco de dados ou na Query",
      cause: error
    })
    throw ServiceErrorObject;
  } finally {
    await client?.end(); //obriga a finalizar o client
  }
}

async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
  });

  await client.connect();
  return client;
}

export default {
  query,
  getNewClient,
};
