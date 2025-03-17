import { createRouter } from "next-connect";
import controller from "infra/controller";
import device from "models/devices";

const router = createRouter();

router.post(postHandler);
router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const deviceInputValues = request.body;
  const newDevice = await device.create(deviceInputValues);

  return response.status(201).json(newDevice);
}


async function getHandler(request, response) {
  const { id } = request.query;

  if (id) {
    const foundDevice = await device.findOneById(id);
    return response.status(201).json(foundDevice);
  }

  const allDevices = await device.findAll();
  return response.status(201).json(allDevices);
}