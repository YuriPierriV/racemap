import { createRouter } from "next-connect";
import controller from "infra/controller";
import circuit from "models/circuits";

const router = createRouter();

router.get(getHandler);
router.put(putHandler);
router.patch(patchHandler);
router.delete(deleteHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const { id } = request.query;
  const circuitFound = await circuit.findOneById(id);
  return response.status(200).json(circuitFound);
}

async function putHandler(request, response) {
  const { id } = request.query;
  const updateValues = request.body;
  const updatedCircuit = await circuit.update(id, updateValues);
  return response.status(200).json(updatedCircuit);
}

async function patchHandler(request, response) {
  try {
    const { id } = request.query;
    const updateValues = request.body;
    
    console.log('PATCH /api/v1/circuits/:id - ID:', id);
    console.log('PATCH /api/v1/circuits/:id - Campos recebidos:', Object.keys(updateValues));
    console.log('PATCH /api/v1/circuits/:id - Nome:', updateValues.nome);
    console.log('PATCH /api/v1/circuits/:id - Total de pontos:', updateValues.pontos?.length);
    
    const updatedCircuit = await circuit.update(id, updateValues);
    
    console.log('PATCH /api/v1/circuits/:id - Circuito atualizado com sucesso, ID:', updatedCircuit.id);
    
    return response.status(200).json(updatedCircuit);
  } catch (error) {
    console.error('PATCH /api/v1/circuits/:id - Erro:', error.message);
    throw error;
  }
}

async function deleteHandler(request, response) {
  const { id } = request.query;
  const deletedCircuit = await circuit.deleteById(id);
  return response.status(200).json({
    message: "Circuito deletado com sucesso",
    circuit: deletedCircuit,
  });
}
