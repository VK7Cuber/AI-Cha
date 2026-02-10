import { models } from '../../database/models/init.js';
import { systemPrompt } from '../prompts/systemPrompt.js';
import { questionTemplates } from '../prompts/questionTemplates.js';
import { aiModelService } from './aiModelService.js';

const { DialogSession, DialogMessage } = models;

const QUESTION_ORDER = [
  'greeting',
  'taste',
  'temperature',
  'milk',
  'caffeine',
  'restrictions',
  'context'
];

const MAX_QUESTIONS = 7;
const MAX_DURATION_SECONDS = 60;

function pickTemplate(category) {
  const options = questionTemplates[category] || [];
  if (!options.length) return '';
  const index = Math.floor(Math.random() * options.length);
  return options[index];
}

function buildPromptWithHint(nextQuestion) {
  if (!nextQuestion) return systemPrompt;
  return `${systemPrompt}\n\nСледующий вопрос, который нужно задать (можно перефразировать, но смысл сохранить): ${nextQuestion}`;
}

function mapMessages(messages) {
  return messages.map((message) => ({
    role: message.role,
    content: message.content
  }));
}

function shouldCompleteByTime(session) {
  const now = Date.now();
  const startedAt = new Date(session.started_at).getTime();
  return (now - startedAt) / 1000 >= MAX_DURATION_SECONDS;
}

function userRequestedComplete(text) {
  const normalized = String(text || '').toLowerCase();
  return /хватит|достаточно|закончи|стоп|переходим|давай уже/.test(normalized);
}

export const dialogService = {
  async startSession({ terminalId, language = 'ru' }) {
    const session = await DialogSession.create({
      terminal_id: terminalId,
      language
    });

    const firstQuestion = pickTemplate('greeting');
    if (firstQuestion) {
      await DialogMessage.createAssistantMessage(session.id, firstQuestion);
      await session.incrementQuestions();
    }

    return {
      session,
      message: firstQuestion,
      status: session.status
    };
  },

  async handleUserMessage({ sessionId, text, audioDurationMs = null, sttConfidence = null }) {
    const session = await DialogSession.findByPk(sessionId);
    if (!session) {
      throw new Error('Сессия диалога не найдена');
    }
    if (session.status !== 'in_progress') {
      return {
        session,
        message: '',
        status: session.status
      };
    }

    await DialogMessage.createUserMessage(session.id, text, audioDurationMs, sttConfidence);
    await session.incrementUserResponses();

    const questionsAsked = session.questions_asked;
    const shouldComplete =
      questionsAsked >= MAX_QUESTIONS ||
      shouldCompleteByTime(session) ||
      userRequestedComplete(text);

    if (shouldComplete) {
      const closing = pickTemplate('closing') || 'Спасибо! Я подберу для вас напиток.';
      await DialogMessage.createAssistantMessage(session.id, closing);
      await session.complete();
      return {
        session,
        message: closing,
        status: 'completed'
      };
    }

    const categoryIndex = Math.min(questionsAsked, QUESTION_ORDER.length - 1);
    const nextCategory = QUESTION_ORDER[categoryIndex];
    const nextTemplate = pickTemplate(nextCategory);

    const history = await DialogMessage.getForSession(session.id);
    let assistantMessage = '';

    try {
      const aiResponse = await aiModelService.chatCompletion({
        systemPrompt: buildPromptWithHint(nextTemplate),
        messages: mapMessages(history)
      });
      assistantMessage = aiResponse.content?.trim();
    } catch (error) {
      assistantMessage = '';
    }

    if (!assistantMessage) {
      assistantMessage = nextTemplate || 'Расскажите чуть подробнее, пожалуйста.';
    }

    await DialogMessage.createAssistantMessage(session.id, assistantMessage);
    await session.incrementQuestions();

    return {
      session,
      message: assistantMessage,
      status: session.status
    };
  },

  async getStatus(sessionId) {
    const session = await DialogSession.findByPk(sessionId);
    if (!session) {
      throw new Error('Сессия диалога не найдена');
    }

    return {
      sessionId: session.id,
      status: session.status,
      questionsAsked: session.questions_asked,
      userResponses: session.user_responses_count,
      startedAt: session.started_at,
      completedAt: session.completed_at
    };
  },

  async completeSession(sessionId) {
    const session = await DialogSession.findByPk(sessionId);
    if (!session) {
      throw new Error('Сессия диалога не найдена');
    }
    if (session.status === 'in_progress') {
      await session.complete();
    }
    return session;
  }
};
