import { ingredientService } from '../../services/ingredientService.js';

export const ingredientController = {
  async getCategories(_req, reply) {
    const categories = await ingredientService.getCategories();
    reply.send(categories);
  },

  async getAll(request, reply) {
    const items = await ingredientService.getAll(request.query || {});
    reply.send(items);
  },

  async getById(request, reply) {
    const item = await ingredientService.getById(request.params.id);
    if (!item) {
      reply.code(404).send({ message: 'Ингредиент не найден' });
      return;
    }
    reply.send(item);
  },

  async getCompatibility(request, reply) {
    const rows = await ingredientService.getCompatibility(request.params.id);
    reply.send(rows);
  }
};
