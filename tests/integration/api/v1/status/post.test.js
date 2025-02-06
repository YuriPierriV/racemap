import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("POST /api/v1/status", () => {
  describe("Usuário Anônimo", () => {
    test("Verificando status", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status", {
        method: "POST",
      });
      expect(response.status).toBe(405);

      //updated_at
      const responseBody = await response.json(); //salva o body da requisição

      expect(responseBody).toEqual({
        name: "MethodNotAllowedError",
        message: "Método não permitido para este endpoint.",
        action:
          "Verifique se o método HTTP utilizado é válido para este endpoint.",
        statusCode: 405,
      });
    });
  });
});
