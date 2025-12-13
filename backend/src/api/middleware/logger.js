export function loggerHook(request, reply, done) {
  const startedAt = Date.now();

  reply.raw.on('finish', () => {
    const duration = Date.now() - startedAt;
    request.log.info(
      { method: request.method, url: request.url, status: reply.raw.statusCode, duration },
      'request completed'
    );
  });

  done();
}

