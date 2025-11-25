import { Injectable, Logger } from '@nestjs/common';
import { BaseAgent } from './base-agent';
import {
  AgentType,
  AgentCapability,
  AgentTask,
  AgentResult,
  AgentConfig,
} from '../interfaces/agent.interface';
import { AIProviderFactory } from '../../ai/providers/provider.factory';

/**
 * Content Creator Agent
 * 
 * The most important agent in the system - generates platform-optimized social media content.
 * 
 * Features:
 * - Platform-specific content generation (Twitter, LinkedIn, Instagram, Facebook, TikTok)
 * - Multi-variation generation for A/B testing
 * - Brand voice consistency
 * - Hashtag research and optimization
 * - Emoji integration
 * - Character limit compliance
 * - Engagement optimization
 * 
 * Supports all AI providers: DeepSeek, Gemini, Claude, OpenAI
 */
@Injectable()
export class ContentCreatorAgent extends BaseAgent {
  private readonly platformLimits = {
    twitter: 280,
    linkedin: 3000,
    instagram: 2200,
    facebook: 63206,
    tiktok: 2200,
  };

  constructor(
    id: string,
    config: AgentConfig,
    providerFactory: AIProviderFactory,
  ) {
    super(id, AgentType.CONTENT_CREATOR, config, providerFactory);
    this.logger.log('Content Creator Agent initialized');
  }

  get capabilities(): AgentCapability[] {
    return [
      {
        name: 'generate_twitter_content',
        description: 'Generate Twitter posts (280 chars) and threads with optimal engagement hooks',
        requiredInputs: ['topic'],
        outputs: ['content', 'hashtags', 'variations'],
      },
      {
        name: 'generate_linkedin_content',
        description: 'Generate professional LinkedIn posts with thought leadership positioning',
        requiredInputs: ['topic'],
        outputs: ['content', 'hashtags', 'variations'],
      },
      {
        name: 'generate_instagram_content',
        description: 'Generate Instagram captions with visual storytelling and hashtag research',
        requiredInputs: ['topic'],
        outputs: ['content', 'hashtags', 'variations'],
      },
      {
        name: 'generate_facebook_content',
        description: 'Generate Facebook posts optimized for community engagement',
        requiredInputs: ['topic'],
        outputs: ['content', 'hashtags', 'variations'],
      },
      {
        name: 'generate_tiktok_content',
        description: 'Generate TikTok captions with trending hooks and sounds',
        requiredInputs: ['topic'],
        outputs: ['content', 'hashtags', 'variations'],
      },
      {
        name: 'generate_multi_platform',
        description: 'Generate content optimized for multiple platforms simultaneously',
        requiredInputs: ['topic', 'platforms'],
        outputs: ['platformContent'],
      },
      {
        name: 'generate_thread',
        description: 'Generate Twitter/LinkedIn thread with multiple connected posts',
        requiredInputs: ['topic', 'platform'],
        outputs: ['thread', 'threadLength'],
      },
      {
        name: 'adapt_content',
        description: 'Adapt existing content for a different platform',
        requiredInputs: ['content', 'sourcePlatform', 'targetPlatform'],
        outputs: ['adaptedContent'],
      },
    ];
  }

  /**
   * Execute content generation task
   */
  async execute(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      this.logger.log(`Executing task: ${task.type}`);

      // Check budget before execution
      const estimatedCost = await this.estimateCost(task);
      const withinBudget = await this.checkBudget(estimatedCost);

      if (!withinBudget) {
        throw new Error('Task exceeds cost budget');
      }

      // Route to appropriate generation method
      let output: any;

      switch (task.type) {
        case 'generate_twitter_content':
          output = await this.generateTwitterContent(task);
          break;
        case 'generate_linkedin_content':
          output = await this.generateLinkedInContent(task);
          break;
        case 'generate_instagram_content':
          output = await this.generateInstagramContent(task);
          break;
        case 'generate_facebook_content':
          output = await this.generateFacebookContent(task);
          break;
        case 'generate_tiktok_content':
          output = await this.generateTikTokContent(task);
          break;
        case 'generate_multi_platform':
          output = await this.generateMultiPlatformContent(task);
          break;
        case 'generate_thread':
          output = await this.generateThread(task);
          break;
        case 'adapt_content':
          output = await this.adaptContent(task);
          break;
        default:
          output = await this.generateGenericContent(task);
      }

      const duration = Date.now() - startTime;

      const result: AgentResult = {
        success: true,
        output: {
          ...output,
          taskType: task.type, // Include task type in output instead
        },
        metadata: {
          tokensUsed: output.tokensUsed || 0,
          cost: output.cost || 0,
          duration,
          model: this.config.model,
          provider: this.config.aiProvider,
        },
      };

      this.updateUsageStats(result);
      this.logger.log(`Task completed in ${duration}ms, cost: $${output.cost?.toFixed(4)}`);

      return result;
    } catch (error) {
      this.logger.error(`Content generation failed: ${error.message}`, error.stack);

      return {
        success: false,
        output: {
          taskType: task.type,
        },
        metadata: {
          tokensUsed: 0,
          cost: 0,
          duration: Date.now() - startTime,
          model: this.config.model,
          provider: this.config.aiProvider,
        },
        error: error.message,
      };
    }
  }

  /**
   * Generate Twitter content (280 chars max)
   * Optimized for engagement with hooks, questions, and CTAs
   */
  private async generateTwitterContent(task: AgentTask): Promise<any> {
    const { 
      topic, 
      tone = 'engaging', 
      keywords = [], 
      variations = 3,
      includeHashtags = true,
      includeEmojis = true,
    } = task.input;

    const prompt = this.buildTwitterPrompt(topic, tone, keywords, variations, includeHashtags, includeEmojis);

    const response = await this.generateText(prompt, {
      maxTokens: 600,
      temperature: 0.85, // Higher creativity for Twitter
    });

    // Parse response into individual tweets
    const tweets = this.parseTweets(response.text, variations);

    // Validate character limits
    const validTweets = tweets.map(tweet => this.enforceCharacterLimit(tweet, 'twitter'));

    return {
      platform: 'twitter',
      variations: validTweets,
      content: validTweets[0], // Primary variation
      hashtags: this.extractHashtags(response.text),
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      characterCount: validTweets[0].length,
    };
  }

  /**
   * Generate LinkedIn content (professional, long-form)
   * Optimized for thought leadership and professional engagement
   */
  private async generateLinkedInContent(task: AgentTask): Promise<any> {
    const { 
      topic, 
      tone = 'professional', 
      keywords = [], 
      includeHashtags = true,
      variations = 3,
      length = 'medium', // short, medium, long
    } = task.input;

    const maxTokens = length === 'long' ? 2000 : length === 'short' ? 500 : 1200;

    const prompt = this.buildLinkedInPrompt(topic, tone, keywords, includeHashtags, length, variations);

    const response = await this.generateText(prompt, {
      maxTokens,
      temperature: 0.7,
    });

    const posts = this.parseVariations(response.text, variations);
    const validPosts = posts.map(post => this.enforceCharacterLimit(post, 'linkedin'));

    return {
      platform: 'linkedin',
      variations: validPosts,
      content: validPosts[0],
      hashtags: includeHashtags ? this.extractHashtags(response.text) : [],
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      characterCount: validPosts[0].length,
    };
  }

  /**
   * Generate Instagram content (visual-first with hashtags)
   * Optimized for visual storytelling and discovery
   */
  private async generateInstagramContent(task: AgentTask): Promise<any> {
    const { 
      topic, 
      tone = 'engaging', 
      keywords = [], 
      hashtagCount = 20,
      variations = 3,
      includeEmojis = true,
    } = task.input;

    const prompt = this.buildInstagramPrompt(topic, tone, keywords, hashtagCount, variations, includeEmojis);

    const response = await this.generateText(prompt, {
      maxTokens: 1000,
      temperature: 0.85,
    });

    // Parse captions and hashtags
    const captions = this.parseVariations(response.text, variations);
    const validCaptions = captions.map(caption => this.enforceCharacterLimit(caption, 'instagram'));
    const hashtags = this.extractHashtags(response.text).slice(0, hashtagCount);

    return {
      platform: 'instagram',
      variations: validCaptions,
      content: validCaptions[0],
      hashtags,
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      characterCount: validCaptions[0].length,
      hashtagCount: hashtags.length,
    };
  }

  /**
   * Generate Facebook content
   * Optimized for community engagement and sharing
   */
  private async generateFacebookContent(task: AgentTask): Promise<any> {
    const { 
      topic, 
      tone = 'friendly', 
      keywords = [], 
      variations = 3,
      includeHashtags = false, // Facebook uses hashtags less
      includeEmojis = true,
    } = task.input;

    const prompt = `Generate ${variations} engaging Facebook posts about "${topic}".

Requirements:
- Tone: ${tone}
- Length: 150-300 words (Facebook favors longer, story-driven content)
${keywords.length > 0 ? `- Include keywords: ${keywords.join(', ')}` : ''}
- Community-focused and conversation-starting
${includeEmojis ? '- Use emojis naturally to add personality' : ''}
- Include a clear call-to-action (comment, share, tag a friend)
${includeHashtags ? '- Add 2-3 relevant hashtags at the end' : ''}
- Make it shareable and relatable

Format: Return each post separated by "---", numbered 1-${variations}.`;

    const response = await this.generateText(prompt, {
      maxTokens: 1200,
      temperature: 0.75,
    });

    const posts = this.parseVariations(response.text, variations);
    const validPosts = posts.map(post => this.enforceCharacterLimit(post, 'facebook'));

    return {
      platform: 'facebook',
      variations: validPosts,
      content: validPosts[0],
      hashtags: includeHashtags ? this.extractHashtags(response.text) : [],
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      characterCount: validPosts[0].length,
    };
  }

  /**
   * Generate TikTok content
   * Optimized for trending hooks and viral potential
   */
  private async generateTikTokContent(task: AgentTask): Promise<any> {
    const { 
      topic, 
      tone = 'energetic', 
      keywords = [], 
      variations = 3,
      includeHashtags = true,
    } = task.input;

    const prompt = `Generate ${variations} viral TikTok captions about "${topic}".

Requirements:
- Tone: ${tone} and authentic
- Length: 100-150 characters (short and punchy)
${keywords.length > 0 ? `- Include keywords: ${keywords.join(', ')}` : ''}
- Start with a hook that stops the scroll
- Use trending language and phrases
- Include relevant emojis
${includeHashtags ? '- Add 5-8 trending hashtags' : ''}
- Make it relatable to Gen Z and Millennials
- Encourage engagement (duet, stitch, comment)

Format: Return each caption separated by "---", numbered 1-${variations}.`;

    const response = await this.generateText(prompt, {
      maxTokens: 800,
      temperature: 0.9, // Highest creativity for TikTok
    });

    const captions = this.parseVariations(response.text, variations);
    const validCaptions = captions.map(caption => this.enforceCharacterLimit(caption, 'tiktok'));

    return {
      platform: 'tiktok',
      variations: validCaptions,
      content: validCaptions[0],
      hashtags: this.extractHashtags(response.text),
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      characterCount: validCaptions[0].length,
    };
  }

  /**
   * Generate content for multiple platforms simultaneously
   * Uses batch processing for efficiency
   */
  private async generateMultiPlatformContent(task: AgentTask): Promise<any> {
    const { topic, platforms, tone, keywords } = task.input;

    this.logger.log(`Generating content for ${platforms.length} platforms`);

    const platformContent: any = {};
    let totalTokens = 0;
    let totalCost = 0;

    // Generate for each platform
    for (const platform of platforms) {
      try {
        const platformTask: AgentTask = {
          ...task,
          type: `generate_${platform}_content`,
          input: { topic, tone, keywords, variations: 1 }, // Single variation for multi-platform
        };

        const result = await this.execute(platformTask);
        
        if (result.success) {
          platformContent[platform] = result.output;
          totalTokens += result.metadata.tokensUsed;
          totalCost += result.metadata.cost;
        } else {
          this.logger.warn(`Failed to generate content for ${platform}: ${result.error}`);
          platformContent[platform] = { error: result.error };
        }
      } catch (error) {
        this.logger.error(`Error generating ${platform} content: ${error.message}`);
        platformContent[platform] = { error: error.message };
      }
    }

    return {
      platformContent,
      platforms,
      tokensUsed: totalTokens,
      cost: totalCost,
      successCount: Object.values(platformContent).filter((p: any) => !p.error).length,
    };
  }

  /**
   * Generate a thread (Twitter or LinkedIn)
   * Creates connected posts that tell a story
   */
  private async generateThread(task: AgentTask): Promise<any> {
    const { 
      topic, 
      platform = 'twitter',
      tone = 'engaging',
      threadLength = 5,
      keywords = [],
    } = task.input;

    const charLimit = platform === 'twitter' ? 280 : 3000;

    const prompt = `Generate a ${threadLength}-post ${platform} thread about "${topic}".

Requirements:
- Tone: ${tone}
- Each post maximum ${charLimit} characters
${keywords.length > 0 ? `- Include keywords: ${keywords.join(', ')}` : ''}
- Start with a strong hook in post 1
- Each post should be self-contained but connected
- Use numbered format (1/${threadLength}, 2/${threadLength}, etc.)
- End with a clear call-to-action
- Make it engaging and valuable

Format: Return each post on a new line, clearly numbered.`;

    const response = await this.generateText(prompt, {
      maxTokens: threadLength * 200,
      temperature: 0.75,
    });

    const thread = this.parseThread(response.text, threadLength);
    const validThread = thread.map(post => this.enforceCharacterLimit(post, platform));

    return {
      platform,
      thread: validThread,
      threadLength: validThread.length,
      content: validThread.join('\n\n'), // Full thread as single string
      tokensUsed: response.tokensUsed,
      cost: response.cost,
    };
  }

  /**
   * Adapt existing content for a different platform
   * Maintains core message while optimizing for platform
   */
  private async adaptContent(task: AgentTask): Promise<any> {
    const { 
      content, 
      sourcePlatform, 
      targetPlatform,
      tone,
    } = task.input;

    const targetLimit = this.platformLimits[targetPlatform] || 2000;

    const prompt = `Adapt this ${sourcePlatform} content for ${targetPlatform}:

Original content:
"${content}"

Requirements:
- Maintain the core message and value
- Optimize for ${targetPlatform}'s audience and format
- Maximum ${targetLimit} characters
${tone ? `- Tone: ${tone}` : ''}
- Follow ${targetPlatform} best practices
- Adjust hashtags and emojis appropriately
- Make it native to ${targetPlatform}

Return only the adapted content.`;

    const response = await this.generateText(prompt, {
      maxTokens: Math.ceil(targetLimit / 2),
      temperature: 0.6,
    });

    const adaptedContent = this.enforceCharacterLimit(response.text.trim(), targetPlatform);

    return {
      sourcePlatform,
      targetPlatform,
      originalContent: content,
      adaptedContent,
      hashtags: this.extractHashtags(adaptedContent),
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      characterCount: adaptedContent.length,
    };
  }

  /**
   * Generate generic content
   */
  private async generateGenericContent(task: AgentTask): Promise<any> {
    const { topic, platform = 'generic', tone, maxLength = 500 } = task.input;

    const prompt = `Generate engaging social media content about "${topic}".
    
Platform: ${platform}
Tone: ${tone || 'professional'}
Maximum length: ${maxLength} characters

Make it engaging, actionable, and platform-appropriate.`;

    const response = await this.generateText(prompt, {
      maxTokens: Math.ceil(maxLength / 2),
      temperature: 0.7,
    });

    return {
      platform,
      content: response.text,
      tokensUsed: response.tokensUsed,
      cost: response.cost,
    };
  }

  // ==================== Prompt Builders ====================

  private buildTwitterPrompt(
    topic: string, 
    tone: string, 
    keywords: string[], 
    variations: number,
    includeHashtags: boolean,
    includeEmojis: boolean,
  ): string {
    return `Generate ${variations} engaging Twitter posts about "${topic}".

Requirements:
- Maximum 280 characters per tweet
- Tone: ${tone}
${keywords.length > 0 ? `- Include keywords: ${keywords.join(', ')}` : ''}
${includeHashtags ? '- Include 2-3 relevant hashtags' : ''}
${includeEmojis ? '- Use emojis strategically for emphasis' : ''}
- Start with a hook that stops the scroll
- Make them shareable and conversation-starting
- Include engagement elements (questions, CTAs, or bold statements)
- Each tweet should be unique and valuable

Format: Return each tweet separated by "---", numbered 1-${variations}.`;
  }

  private buildLinkedInPrompt(
    topic: string, 
    tone: string, 
    keywords: string[], 
    includeHashtags: boolean,
    length: string,
    variations: number,
  ): string {
    const wordCount = length === 'long' ? '400-600' : length === 'short' ? '100-150' : '200-300';

    return `Generate ${variations} professional LinkedIn posts about "${topic}".

Requirements:
- Tone: ${tone}
- Length: ${wordCount} words
${keywords.length > 0 ? `- Include keywords: ${keywords.join(', ')}` : ''}
- Professional and thought-provoking
- Start with a compelling hook
- Use line breaks for readability (every 2-3 sentences)
- Include personal insights or experiences
- End with a clear call-to-action (comment, share, connect)
${includeHashtags ? '- Add 3-5 relevant hashtags at the end' : ''}
- Position as thought leadership

Format: Return each post separated by "---", numbered 1-${variations}.`;
  }

  private buildInstagramPrompt(
    topic: string, 
    tone: string, 
    keywords: string[], 
    hashtagCount: number,
    variations: number,
    includeEmojis: boolean,
  ): string {
    return `Generate ${variations} Instagram captions about "${topic}".

Requirements:
- Tone: ${tone}
- Length: 125-175 words
${keywords.length > 0 ? `- Include keywords: ${keywords.join(', ')}` : ''}
- Visual and descriptive (paint a picture with words)
${includeEmojis ? '- Include emojis naturally throughout' : ''}
- Start with a hook that captures attention
- Tell a micro-story or share a valuable insight
- Include a call-to-action (save, share, tag a friend)
- End with ${hashtagCount} relevant hashtags (mix of popular and niche)
- Authentic and relatable

Format: Return each caption separated by "---", numbered 1-${variations}.
Include hashtags at the end of each caption.`;
  }

  // ==================== Parsers ====================

  private parseTweets(text: string, count: number): string[] {
    // Try to split by separator first
    let tweets = text.split(/---+/).filter(t => t.trim());
    
    // If no separator, try line-by-line
    if (tweets.length < count) {
      tweets = text.split('\n').filter(line => line.trim());
    }

    return tweets
      .map(tweet => tweet.replace(/^\d+[\.)]\s*/, '').trim())
      .filter(tweet => tweet.length > 0)
      .slice(0, count);
  }

  private parseVariations(text: string, count: number): string[] {
    // Split by separator
    let variations = text.split(/---+/).filter(v => v.trim());
    
    // If no separator, try double newline
    if (variations.length < count) {
      variations = text.split(/\n\n+/).filter(v => v.trim());
    }

    // Clean up numbering
    return variations
      .map(v => v.replace(/^\d+[\.)]\s*/, '').trim())
      .filter(v => v.length > 0)
      .slice(0, count);
  }

  private parseThread(text: string, expectedLength: number): string[] {
    const posts: string[] = [];
    
    // Try to split by thread numbering (1/5, 2/5, etc.)
    const threadPattern = /\d+\/\d+[:\s]*/g;
    const parts = text.split(threadPattern).filter(p => p.trim());
    
    if (parts.length >= expectedLength) {
      return parts.slice(0, expectedLength);
    }

    // Fallback: split by newlines
    return text
      .split('\n')
      .filter(line => line.trim())
      .slice(0, expectedLength);
  }

  private extractHashtags(text: string): string[] {
    const hashtagPattern = /#[\w]+/g;
    const matches = text.match(hashtagPattern) || [];
    
    // Remove duplicates and return
    return [...new Set(matches)];
  }

  // ==================== Utility Methods ====================

  /**
   * Enforce platform-specific character limits
   */
  private enforceCharacterLimit(content: string, platform: string): string {
    const limit = this.platformLimits[platform];
    
    if (!limit || content.length <= limit) {
      return content;
    }

    // Truncate and add ellipsis
    const truncated = content.substring(0, limit - 3);
    
    // Try to truncate at last complete sentence
    const lastPeriod = truncated.lastIndexOf('.');
    const lastQuestion = truncated.lastIndexOf('?');
    const lastExclamation = truncated.lastIndexOf('!');
    
    const lastSentence = Math.max(lastPeriod, lastQuestion, lastExclamation);
    
    if (lastSentence > limit * 0.8) {
      // If we can keep 80% of content with complete sentence, do it
      return truncated.substring(0, lastSentence + 1);
    }

    // Otherwise, truncate at last space and add ellipsis
    const lastSpace = truncated.lastIndexOf(' ');
    return truncated.substring(0, lastSpace) + '...';
  }

  /**
   * Validate content quality
   */
  private validateContent(content: string, platform: string): boolean {
    // Check minimum length
    if (content.length < 10) {
      return false;
    }

    // Check maximum length
    const limit = this.platformLimits[platform];
    if (limit && content.length > limit) {
      return false;
    }

    // Check for spam patterns
    const spamPatterns = [
      /(.)\1{10}/, // Repeated characters
      /^[A-Z\s!]+$/, // All caps
      /click here|buy now|limited time/i, // Spam phrases
    ];

    for (const pattern of spamPatterns) {
      if (pattern.test(content)) {
        this.logger.warn('Content failed spam check');
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate engagement score (for future optimization)
   */
  private calculateEngagementScore(content: string, platform: string): number {
    let score = 0;

    // Has question
    if (content.includes('?')) score += 10;

    // Has call-to-action
    const ctaPatterns = /comment|share|tag|follow|save|like/i;
    if (ctaPatterns.test(content)) score += 15;

    // Has emojis
    const emojiPattern = /[\u{1F300}-\u{1F9FF}]/u;
    if (emojiPattern.test(content)) score += 10;

    // Has hashtags (for platforms that use them)
    if (['instagram', 'twitter', 'tiktok'].includes(platform)) {
      const hashtagCount = (content.match(/#\w+/g) || []).length;
      score += Math.min(hashtagCount * 5, 20);
    }

    // Optimal length for platform
    const optimalLengths = {
      twitter: [200, 280],
      linkedin: [1200, 2000],
      instagram: [1000, 1500],
      facebook: [1000, 2000],
      tiktok: [100, 150],
    };

    const [min, max] = optimalLengths[platform] || [100, 2000];
    if (content.length >= min && content.length <= max) {
      score += 20;
    }

    // Has line breaks (for readability)
    const lineBreaks = (content.match(/\n/g) || []).length;
    if (lineBreaks > 0 && lineBreaks < 10) {
      score += 10;
    }

    return Math.min(score, 100);
  }
}
