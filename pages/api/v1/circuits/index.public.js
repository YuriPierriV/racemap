import { createRouter } from "next-connect";
import controller from "infra/controller";
import circuit from "models/circuits";

const router = createRouter();

router.post(postHandler);
router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const circuitInputValues = request.body;
  const newCircuit = await circuit.create(circuitInputValues);

  return response.status(201).json(newCircuit);
}

async function getHandler(request, response) {
  const allCircuits = await circuit.findAll();
  return response.status(200).json(allCircuits);
}
