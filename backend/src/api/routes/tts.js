import { ttsController } from '../controllers/ttsController.js';

export async function ttsRoutes(fastify) {
  fastify.post('/synthesize', ttsController.synthesize);
}
