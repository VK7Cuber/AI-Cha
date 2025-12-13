export function errorHandler(error, request, reply) {
  request.log.error(error);
  const statusCode = error.statusCode || 500;
  reply.status(statusCode).send({
    statusCode,
    message: error.message || 'Internal Server Error'
  });
}

