export function loggerHook(request, reply, done) {
  const startedAt = request.startTime || Date.now();
  const duration = Date.now() - startedAt;

  request.log.info(
    { method: request.method, url: request.url, status: reply.statusCode, duration },
    'request completed'
  );

  done();
}

