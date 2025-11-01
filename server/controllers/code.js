import ollama from 'ollama';

export default class CodeController {
  /**
   * @param {MojoContext} ctx
   */
  async onNewReview(ctx) {
    const { code, model, prompt } = await ctx.req.json();

    if (!(await ctx.app.prisma.llm_models.findUnique({ where: { model } }))) {
      return ctx.render({
        json: { error: 'Model not found' },
        status: 400,
      });
    }

    const res = await ollama.chat({
      model: model,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: code },
      ],
      options: {
        temperature: 0,
      },
    });

    const { username } = await ctx.session();

    const user = await ctx.app.prisma.users.findUnique({
      where: {
        username: username,
      },
    });

    const review = await ctx.app.prisma.reviews.create({
      data: {
        userId: user?.id,
        code: code,
        title: 'New Review',
      },
    });


    await ctx.app.prisma.review_messages.create({
      data: {
        reviewId: review?.id,
        role: 'CLIENT',
        body: prompt,
      },
    });

    await ctx.app.prisma.review_messages.create({
      data: {
        reviewId: review?.id,
        role: 'ASSISTANT',
        body: res?.message?.content ?? 'Error formatting code',
      },
    });

    return ctx.render({ json: { reviewId: review?.id } });
  }

  /**
   * @param {MojoContext} ctx
   */
  async onFollowUpReview(ctx) {
    const { reviewId, model, prompt } = await ctx.req.json();

    console.log(reviewId, model, prompt);

    const review = await ctx.app.prisma.reviews.findUnique({
      where: { id: Number(reviewId) },
    });

    if (!review) {
      return ctx.render({ json: { error: 'Review not found' }, status: 400 });
    }

    const conversationHistory = await ctx.app.prisma.review_messages.findMany({
      where: { reviewId: Number(reviewId) },
    });

    const conversationHistoryString = conversationHistory
      .filter((message) => message.role !== 'SYSTEM')
      .map((message) => `<${message.role}> ${message.body} </${message.role}>`)
      .join('\n');

    if (!(await ctx.app.prisma.llm_models.findUnique({ where: { model } }))) {
      return ctx.render({
        json: { error: 'Model not found' },
        status: 400,
      });
    }

    const systemPrompt = [
      'Here is what was discussed before:',
      '<conversation_history>',
      conversationHistoryString,
      '</conversation_history>',

      'Here is your new task:',
      '<CRITICAL_TASK>',
      prompt,
      '</CRITICAL_TASK>',
    ].join('\n');

    const res = await ollama.chat({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: review.code },
      ],
      options: {
        temperature: 0,
      },
    });

    await ctx.app.prisma.review_messages.create({
      data: {
        reviewId: Number(reviewId),
        role: 'CLIENT',
        body: prompt,
      },
    });

    await ctx.app.prisma.review_messages.create({
      data: {
        reviewId: Number(reviewId),
        role: 'ASSISTANT',
        body: res?.message?.content ?? 'Error formatting code',
      },
    });

    return ctx.render({ json: { success: true } });
  }

  /**
   * @param {MojoContext} ctx
   */
  async updateOrCreatePrompt(ctx) {
    const { name, prompt, id } = await ctx.req.json();

    if (!name || !prompt) {
      return ctx.render({
        json: { error: 'Name and prompt are required' },
        status: 400,
      });
    }

    await ctx.app.prisma.prompts.upsert({
      where: { id: id ?? -1 },
      update: { prompt },
      create: { name, prompt },
    });

    return ctx.render({ json: { success: true } });
  }

  /**
   * @param {MojoContext} ctx
   */
  async updateOrCreateModel(ctx) {
    const { name, model, id } = await ctx.req.json();

    if (!name || !model) {
      return ctx.render({
        json: { error: 'Name and model are required' },
        status: 400,
      });
    }

    await ctx.app.prisma.llm_models.upsert({
      where: { id: id ?? -1 },
      update: { name, model },
      create: { name, model },
    });

    return ctx.render({ json: { success: true } });
  }

  /**
   * @param {MojoContext} ctx
   */
  async getPrompts(ctx) {
    const prompts = await ctx.app.prisma.prompts.findMany();
    return ctx.render({ json: { prompts } });
  }

  /**
   * @param {MojoContext} ctx
   */
  async getLLMModels(ctx) {
    const models = await ctx.app.prisma.llm_models.findMany();
    return ctx.render({ json: { models } });
  }

  /**
   * @param {MojoContext} ctx
   */
  async getReviewMessages(ctx) {
    const { reviewId } = ctx.stash;
    if (!reviewId) {
      return ctx.render({
        json: { error: 'Review ID is required' },
        status: 400,
      });
    }
    const review = await ctx.app.prisma.reviews.findUnique({
      where: { id: Number(reviewId) },
    });
    const reviewMessages = await ctx.app.prisma.review_messages.findMany({
      where: { reviewId: Number(reviewId) },
    });
    return ctx.render({ json: { reviewMessages, review } });
  }
}
