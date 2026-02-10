import { dialogController } from '../controllers/dialogController.js';
import { validateDialogMessage, validateDialogStart } from '../middleware/validation.js';

export async function dialogRoutes(fastify) {
  fastify.post('/start', { preHandler: validateDialogStart }, dialogController.start);
  fastify.post('/:sessionId/message', { preHandler: validateDialogMessage }, dialogController.message);
  fastify.get('/:sessionId/status', dialogController.status);
  fastify.post('/:sessionId/complete', dialogController.complete);
}
