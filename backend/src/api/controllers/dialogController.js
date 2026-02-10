import { dialogService } from '../../ai/services/dialogService.js';

function resolveTerminalId(request) {
  return (
    request.body?.terminal_id ||
    request.body?.terminalId ||
    request.headers['x-terminal-id'] ||
    'terminal'
  );
}

export const dialogController = {
  async start(request, reply) {
    try {
      const terminalId = resolveTerminalId(request);
      const language = request.body?.language || 'ru';
      const result = await dialogService.startSession({ terminalId, language });
      reply.send({
        sessionId: result.session.id,
        message: result.message,
        status: result.status
      });
    } catch (error) {
      reply.code(500).send({ message: error?.message || 'Ошибка запуска диалога' });
    }
  },

  async message(request, reply) {
    try {
      const { sessionId } = request.params;
      const text = request.body?.text || '';
      const audioDurationMs = request.body?.audio_duration_ms ?? null;
      const sttConfidence = request.body?.stt_confidence ?? null;

      const result = await dialogService.handleUserMessage({
        sessionId,
        text,
        audioDurationMs,
        sttConfidence
      });

      reply.send({
        sessionId: result.session.id,
        message: result.message,
        status: result.status
      });
    } catch (error) {
      reply.code(500).send({ message: error?.message || 'Ошибка обработки сообщения' });
    }
  },

  async status(request, reply) {
    try {
      const { sessionId } = request.params;
      const status = await dialogService.getStatus(sessionId);
      reply.send(status);
    } catch (error) {
      reply.code(404).send({ message: error?.message || 'Сессия не найдена' });
    }
  },

  async complete(request, reply) {
    try {
      const { sessionId } = request.params;
      const session = await dialogService.completeSession(sessionId);
      reply.send({ sessionId: session.id, status: session.status });
    } catch (error) {
      reply.code(404).send({ message: error?.message || 'Сессия не найдена' });
    }
  }
};
