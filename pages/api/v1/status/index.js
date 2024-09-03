

async function status(request, response) {
  response.status(200).json({ status: "Status ok!" })
}

export default status