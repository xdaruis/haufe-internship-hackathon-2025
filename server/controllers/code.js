import ollama from 'ollama';

export default class CodeController {
  /**
   * @param {MojoContext} ctx
   */
  async onReview(ctx) {
    const payload = await ctx.req.json();

    const code =
      /** @type {any} */ (payload)?.code ||
      '#include <stdio.h>\n\nint main(){\nprintf("Hello, World!\\n");\nreturn 0;\n}';

    const system = [
      'You are a code formatter.',
      'Reformat the provided code for readability and consistent style.',
      'Do not change behavior or meaning.',
      'Do not rename, reorder logic, introduce new code, or add comments.',
      'Output ONLY the fully formatted code as plain text. No markdown fences, no explanations.',
    ].join('\n');

    const res = await ollama.chat({
      model: 'qwen2.5-coder:0.5b',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: code },
      ],
      options: {
        temperature: 0,
      },
    });

    const formatted = res?.message?.content ?? 'Error formatting code';
    return ctx.render({ json: { formatted } });
  }
}
