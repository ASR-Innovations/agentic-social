import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

interface GenerateTextOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

@Injectable()
export class AnthropicService {
  private readonly logger = new Logger(AnthropicService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.anthropic.com/v1';
  private readonly apiVersion = '2023-06-01';

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY;

    if (!this.apiKey) {
      this.logger.warn('Anthropic API key not configured');
    }
  }

  /**
   * Generate text using Claude
   */
  async generateText(
    prompt: string,
    options?: GenerateTextOptions,
  ): Promise<{ text: string; tokensUsed: number; cost: number }> {
    if (!this.apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          model: options?.model || 'claude-3-5-sonnet-20241022',
          max_tokens: options?.maxTokens || 1024,
          temperature: options?.temperature || 0.7,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': this.apiVersion,
            'Content-Type': 'application/json',
          },
        },
      );

      const text = response.data.content[0]?.text || '';
      const inputTokens = response.data.usage?.input_tokens || 0;
      const outputTokens = response.data.usage?.output_tokens || 0;
      const tokensUsed = inputTokens + outputTokens;

      // Calculate cost
      const cost = this.calculateCost(options?.model || 'claude-3-5-sonnet-20241022', inputTokens, outputTokens);

      return { text, tokensUsed, cost };
    } catch (error) {
      this.logger.error(`Anthropic text generation failed: ${error.message}`, error.stack);
      throw new Error(
        `Anthropic generation failed: ${error.response?.data?.error?.message || error.message}`,
      );
    }
  }

  /**
   * Generate text with streaming (for real-time responses)
   */
  async generateTextStream(
    prompt: string,
    options?: GenerateTextOptions,
    onChunk?: (chunk: string) => void,
  ): Promise<{ text: string; tokensUsed: number; cost: number }> {
    if (!this.apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          model: options?.model || 'claude-3-5-sonnet-20241022',
          max_tokens: options?.maxTokens || 1024,
          temperature: options?.temperature || 0.7,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          stream: true,
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': this.apiVersion,
            'Content-Type': 'application/json',
          },
          responseType: 'stream',
        },
      );

      let fullText = '';
      let inputTokens = 0;
      let outputTokens = 0;

      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk: Buffer) => {
          const lines = chunk.toString().split('\n').filter((line) => line.trim());

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);

                if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                  const text = parsed.delta.text;
                  fullText += text;
                  if (onChunk) onChunk(text);
                }

                if (parsed.type === 'message_delta' && parsed.usage) {
                  outputTokens = parsed.usage.output_tokens || 0;
                }

                if (parsed.type === 'message_start' && parsed.message?.usage) {
                  inputTokens = parsed.message.usage.input_tokens || 0;
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        });

        response.data.on('end', () => {
          const tokensUsed = inputTokens + outputTokens;
          const cost = this.calculateCost(
            options?.model || 'claude-3-5-sonnet-20241022',
            inputTokens,
            outputTokens,
          );

          resolve({ text: fullText, tokensUsed, cost });
        });

        response.data.on('error', (error: Error) => {
          reject(error);
        });
      });
    } catch (error) {
      this.logger.error(`Anthropic streaming failed: ${error.message}`, error.stack);
      throw new Error(`Anthropic streaming failed: ${error.message}`);
    }
  }

  /**
   * Calculate cost based on model and token usage
   */
  private calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    // Approximate pricing as of 2024 (per 1M tokens)
    const pricing: Record<string, { input: number; output: number }> = {
      'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
      'claude-3-opus-20240229': { input: 15, output: 75 },
      'claude-3-sonnet-20240229': { input: 3, output: 15 },
      'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
    };

    const modelPricing = pricing[model] || pricing['claude-3-5-sonnet-20241022'];

    const inputCost = (inputTokens * modelPricing.input) / 1_000_000;
    const outputCost = (outputTokens * modelPricing.output) / 1_000_000;

    return inputCost + outputCost;
  }

  /**
   * Check if API is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}
