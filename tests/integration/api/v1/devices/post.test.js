import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/devices", () => {
  describe("Usuário Anônimo", () => {
    test("With unique and valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/devices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chip_id: "123456",
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        chip_id: responseBody.chip_id,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With duplicated 'chip_id'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/devices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chip_id: "111111",
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/devices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chip_id: "111111",
        }),
      });

      expect(response2.status).toBe(400);
      const responseBody2 = await response2.json();
      expect(responseBody2).toEqual({
        name: "ValidationError",
        message: "Esse chip já foi cadastrado.",
        action: "Verifique o chip id ou entre em contato com o suporte.",
        statusCode: 400,
      });
    });


  });
});

describe("GET /api/v1/devices", () => {
  describe("Usuário Anônimo", () => {
    test("GET all devices", async () => {
      const response = await fetch("http://localhost:3000/api/v1/devices", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(response.status).toBe(201);

      
    });




  });
});
