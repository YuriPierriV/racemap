import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
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

      expect(response.status).toBe(200);
    });
  });
});
