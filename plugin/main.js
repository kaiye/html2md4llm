import { main } from '../src/main.js';

export default class Html2Md4LlmTool {
  async invoke(parameters) {
    const { html, outputFormat = 'markdown', strategy } = parameters;

    if (!html) {
      throw new Error('html parameter is required');
    }

    const options = { outputFormat };
    if (strategy) {
      options.strategy = strategy;
    }

    const result = main(html, options);

    return {
      result,
      format: outputFormat
    };
  }

  async validate(parameters) {
    if (!parameters.html || typeof parameters.html !== 'string') {
      return { valid: false, error: 'html must be a non-empty string' };
    }

    const { outputFormat, strategy } = parameters;

    if (outputFormat && !['markdown', 'json'].includes(outputFormat)) {
      return { valid: false, error: 'outputFormat must be "markdown" or "json"' };
    }

    if (strategy && !['list', 'article'].includes(strategy)) {
      return { valid: false, error: 'strategy must be "list" or "article"' };
    }

    return { valid: true };
  }
}
