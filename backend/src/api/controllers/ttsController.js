import { ttsService } from '../../services/ttsService.js';
import { ttsConfig } from '../../config/ttsConfig.js';

export const ttsController = {
  async synthesize(request, reply) {
    const { text, ssml } = request.body || {};
    const useSsml = Boolean(ssml);
    const input = useSsml ? ssml : text;

    if (typeof input !== 'string' || !input.trim()) {
      reply.code(400).send({ message: 'Текст для синтеза обязателен' });
      return;
    }

    try {
      const result = await ttsService.synthesizeText(input, {
        useSsml,
        language: ttsConfig.synthesis.language,
        voice: ttsConfig.synthesis.voice,
        speed: ttsConfig.synthesis.speed,
        emotion: ttsConfig.synthesis.emotion,
        format: ttsConfig.synthesis.format
      });

      if (!result?.audioBuffer) {
        reply.code(502).send({ message: 'TTS не вернул аудио' });
        return;
      }

      reply.header('Content-Type', result.contentType);
      reply.send(result.audioBuffer);
    } catch (error) {
      reply.code(500).send({ message: error?.message || 'Ошибка TTS' });
    }
  }
};
