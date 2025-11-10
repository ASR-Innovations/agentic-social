import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

interface GenerateTextOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

interface GenerateImageOptions {
  prompt: string;
  size?: '1024x1024' | '1024x1792' | '1792x1024';
  n?: number;
  quality?: 'standard' | 'hd';
}

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;

    if (!this.apiKey) {
      this.logger.warn('OpenAI API key not configured');
    }
  }

  /**
   * Generate text using OpenAI
   */
  async generateText(
    prompt: string,
    options?: GenerateTextOptions,
  ): Promise<{ text: string; tokensUsed: number; cost: number }> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: options?.model || 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: options?.maxTokens || 1000,
          temperature: options?.temperature || 0.7,
          top_p: options?.topP || 1,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const text = response.data.choices[0]?.message?.content || '';
      const tokensUsed = response.data.usage?.total_tokens || 0;

      // Calculate cost (approximate, based on model pricing)
      const cost = this.calculateTextCost(options?.model || 'gpt-4-turbo-preview', tokensUsed);

      return { text, tokensUsed, cost };
    } catch (error) {
      this.logger.error(`OpenAI text generation failed: ${error.message}`, error.stack);
      throw new Error(`OpenAI generation failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Generate image using DALL-E
   */
  async generateImage(
    options: GenerateImageOptions,
  ): Promise<{ images: { url: string; revisedPrompt?: string }[]; cost: number }> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/images/generations`,
        {
          model: 'dall-e-3',
          prompt: options.prompt,
          size: options.size || '1024x1024',
          n: options.n || 1,
          quality: options.quality || 'standard',
          response_format: 'url',
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const images = response.data.data.map((img: any) => ({
        url: img.url,
        revisedPrompt: img.revised_prompt,
      }));

      // Calculate cost
      const cost = this.calculateImageCost(options.size || '1024x1024', options.quality || 'standard', options.n || 1);

      return { images, cost };
    } catch (error) {
      this.logger.error(`OpenAI image generation failed: ${error.message}`, error.stack);
      throw new Error(`Image generation failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Generate embeddings
   */
  async generateEmbedding(text: string): Promise<{ embedding: number[]; tokensUsed: number }> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/embeddings`,
        {
          model: 'text-embedding-3-small',
          input: text,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const embedding = response.data.data[0].embedding;
      const tokensUsed = response.data.usage.total_tokens;

      return { embedding, tokensUsed };
    } catch (error) {
      this.logger.error(`OpenAI embedding generation failed: ${error.message}`, error.stack);
      throw new Error(`Embedding generation failed: ${error.message}`);
    }
  }

  /**
   * Calculate approximate cost for text generation
   */
  private calculateTextCost(model: string, tokens: number): number {
    // Approximate pricing as of 2024 (per 1M tokens)
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4-turbo-preview': { input: 10, output: 30 },
      'gpt-4': { input: 30, output: 60 },
      'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
      'gpt-4o': { input: 5, output: 15 },
    };

    const modelPricing = pricing[model] || pricing['gpt-4-turbo-preview'];

    // Assume 50/50 split for input/output tokens
    const cost = ((tokens / 2) * modelPricing.input + (tokens / 2) * modelPricing.output) / 1_000_000;

    return cost;
  }

  /**
   * Calculate cost for image generation
   */
  private calculateImageCost(size: string, quality: string, n: number): number {
    // DALL-E 3 pricing
    const pricing: Record<string, Record<string, number>> = {
      '1024x1024': { standard: 0.04, hd: 0.08 },
      '1024x1792': { standard: 0.08, hd: 0.12 },
      '1792x1024': { standard: 0.08, hd: 0.12 },
    };

    const sizePricing = pricing[size] || pricing['1024x1024'];
    const costPerImage = sizePricing[quality] || sizePricing.standard;

    return costPerImage * n;
  }

  /**
   * Check if API is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}
