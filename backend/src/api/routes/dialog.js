import { dialogController } from '../controllers/dialogController.js';
import {
  validateDialogMessage,
  validateDialogSessionParam,
  validateDialogStart
} from '../middleware/validation.js';

export async function dialogRoutes(fastify) {
  fastify.post('/start', { preHandler: validateDialogStart }, dialogController.start);
  fastify.post(
    '/:sessionId/message',
    { preHandler: [validateDialogSessionParam, validateDialogMessage] },
    dialogController.message
  );
  fastify.get('/:sessionId/status', { preHandler: validateDialogSessionParam }, dialogController.status);
  fastify.post(
    '/:sessionId/complete',
    { preHandler: validateDialogSessionParam },
    dialogController.complete
  );
}
