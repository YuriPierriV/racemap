import {
  InternalServerError,
  MethodNotAllowedError,
  ValidationError,
  NotFoundError,
} from "infra/errors/errors";

function onNoMatchHandler(req, res) {
  const publicErrorObject = new MethodNotAllowedError();
  res.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(error, req, res) {
  if (error instanceof ValidationError || error instanceof NotFoundError) {
    return res.status(error.statusCode).json(error);
  }

  const publicErrorObject = new InternalServerError({
    cause: error,
    statusCode: error.statusCode,
  });

  res.status(publicErrorObject.statusCode).json(publicErrorObject);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

export default controller;
