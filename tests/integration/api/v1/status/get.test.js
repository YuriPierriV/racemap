test("GET to /api/v1/status retorna 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);


  //updated_at
  const responseBody = await response.json(); //salva o body da requisição


  const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString(); //verifica se é um tempo válido - cuidado com null e salva na variavel
  expect(responseBody.updated_at).toEqual(parsedUpdatedAt) //verifica se é o mesmo que foi passado na api - para fugir do null


  //database
  //version
  expect(responseBody.dependencies.database.version).toEqual("16.0")
  expect(responseBody.dependencies.database.max_connections).toEqual(100)
  expect(responseBody.dependencies.database.connections).toEqual(1)
})

