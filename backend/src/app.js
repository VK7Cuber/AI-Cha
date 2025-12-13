import 'dotenv/config';
import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import compress from '@fastify/compress';
import { serverConfig } from './config/server.js';
import { registerRoutes } from './api/routes/index.js';
import { loggerHook } from './api/middleware/logger.js';
import { errorHandler } from './api/middleware/errorHandler.js';

const fastify = Fastify({
  logger: {
    level: serverConfig.logLevel,
    transport:
      process.env.NODE_ENV === 'development'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined
  }
});

await fastify.register(helmet);
await fastify.register(cors, { origin: true });
// В dev-режиме отключаем gzip-сжатие, т.к. Safari/Brave иногда
// игнорируют chunked ответы с Content-Length: 0
if (process.env.NODE_ENV !== 'development') {
  await fastify.register(compress);
}
fastify.addHook('onRequest', (request, _reply, done) => {
  request.startTime = Date.now();
  done();
});
fastify.addHook('onResponse', loggerHook);
fastify.addHook('onError', (request, reply, error, done) => {
  if (error && error.message === 'premature close') {
    request.log.warn({ err: error, url: request.url }, 'client closed connection');
    reply.raw.destroy(); // гарантируем закрытие без ответа
    done();
    return;
  }
  done();
});

registerRoutes(fastify);
fastify.setErrorHandler(errorHandler);

const start = async () => {
  try {
    await fastify.listen({ port: serverConfig.port, host: serverConfig.host });
    fastify.log.info(`Server running on port ${serverConfig.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

