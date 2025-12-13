export async function healthRoutes(fastify) {
  fastify.get('/', async () => ({ status: 'ok' }));
}

