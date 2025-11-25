import { Injectable, Logger } from '@nestjs/common';
import { BaseAgent } from './base-agent';
import { AgentConfig, AgentTask, AgentResult, AgentType } from '../interfaces/agent.interface';
import { AIProviderFactory } from '../../ai/providers/provider.factory';
import { AgentMemoryService } from '../memory/agent-memory.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AgentConfigEntity } from '../entities/agent-config.entity';

/**
 * Engagement Agent
 * 
 * Monitors social media interactions and generates contextually appropriate responses.
 * Handles mentions, comments, messages, and community management tasks.
 * 
 * Capabilities:
 * - Mention and comment monitoring
 * - Context-aware response generation
 * - Sentiment analysis
 * - Priority flagging
 * - Auto-response for FAQs
 * - Community moderation
 * - Engagement scoring
 */
@Injectable()
export class EngagementAgent extends BaseAgent {
  protected readonly logger = new Logger(EngagementAgent.name);

  constructor(
    id: string,
    config: AgentConfig,
    providerFactory: AIProviderFactory,
  ) {
    super(id, AgentType.ENGAGEMENT, config, providerFactory);
    this.logger.log('Engagement Agent initialized');
  }

  get capabilities() {
    return [
      {
        name: 'generate_response',
        description: 'Generate contextually appropriate responses to mentions and comments',
        requiredInputs: ['message', 'context'],
        outputs: ['response', 'sentiment'],
      },
      {
        name: 'analyze_sentiment',
        description: 'Analyze sentiment of social media interactions',
        requiredInputs: ['messages'],
        outputs: ['sentiment', 'priority'],
      },
    ];
  }

  /**
   * Execute engagement task
   */
  async execute(task: AgentTask): Promise<AgentResult> {
    this.logger.log(`Executing engagement task: ${task.type}`);

    switch (task.type) {
      case 'generate_response':
        return this.generateResponse(task);
      
      case 'analyze_sentiment':
        return this.analyzeSentiment(task);
      
      case 'prioritize_messages':
        return this.prioritizeMessages(task);
      
      case 'detect_intent':
        return this.detectIntent(task);
      
      case 'suggest_responses':
        return this.suggestMultipleResponses(task);
      
      case 'moderate_content':
        return this.moderateContent(task);
      
      case 'analyze_conversation':
        return this.analyzeConversation(task);
      
      case 'generate_faq_response':
        return this.generateFAQResponse(task);
      
      default:
        throw new Error(`Unknown engagement task type: ${task.type}`);
    }
  }

  /**
   * Generate contextual response to a message or comment
   */
  private async generateResponse(
    task: AgentTask,
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const {
      message,
      context,
      platform,
      tone,
      brandVoice,
      conversationHistory,
      userProfile,
    } = task.input;

    // Build context-aware prompt
    const prompt = this.buildResponsePrompt(
      message,
      context,
      platform,
      tone || this.config.personalityConfig?.tone || 'professional',
      brandVoice || this.config.personalityConfig?.brandVoice,
      conversationHistory,
      userProfile,
    );

    // Get AI provider
    const provider = await this.providerFactory.getProvider(this.config.aiProvider);

    // Generate response
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: this.config.personalityConfig?.creativity || 0.7,
      maxTokens: 300,
    });

    // Validate and optimize response
    const optimizedResponse = this.optimizeResponse(
      response.text,
      platform,
      message,
    );

    // Analyze sentiment of generated response
    const responseSentiment = this.quickSentimentAnalysis(optimizedResponse);

    return {
      success: true,
      output: {
        response: optimizedResponse,
        originalResponse: response.text,
        sentiment: responseSentiment,
        confidence: this.calculateConfidence(response.text, message),
        suggestions: this.generateAlternatives(optimizedResponse),
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider,
        platform,
      },
    };
  }

  /**
   * Analyze sentiment of messages
   */
  private async analyzeSentiment(
    task: AgentTask,
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { messages, detailed } = task.input;

    const messagesArray = Array.isArray(messages) ? messages : [messages];
    const results = [];

    for (const message of messagesArray) {
      const sentiment = await this.performSentimentAnalysis(
        message,
        detailed,
      );
      results.push({
        message: message.substring(0, 100),
        ...sentiment,
      });
    }

    // Calculate aggregate sentiment
    const aggregate = this.calculateAggregateSentiment(results);

    return {
      success: true,
      output: {
        results,
        aggregate,
        summary: this.generateSentimentSummary(results),
      },
      metadata: {
        tokensUsed: 0,
        cost: 0,
        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider,
        totalAnalyzed: results.length,
      },
    };
  }

  /**
   * Prioritize messages based on urgency and importance
   */
  private async prioritizeMessages(
    task: AgentTask,
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { messages, criteria } = task.input;

    const prioritized = [];

    for (const message of messages) {
      const priority = await this.calculateMessagePriority(
        message,
        criteria,
      );
      
      prioritized.push({
        ...message,
        priority: priority.score,
        priorityLevel: priority.level,
        reasons: priority.reasons,
        urgency: priority.urgency,
        requiresHumanReview: priority.requiresHumanReview,
      });
    }

    // Sort by priority
    prioritized.sort((a, b) => b.priority - a.priority);

    return {
      success: true,
      output: {
        prioritized,
        highPriority: prioritized.filter((m) => m.priorityLevel === 'high'),
        mediumPriority: prioritized.filter((m) => m.priorityLevel === 'medium'),
        lowPriority: prioritized.filter((m) => m.priorityLevel === 'low'),
        requiresReview: prioritized.filter((m) => m.requiresHumanReview),
      },
      metadata: {
        tokensUsed: 0,
        cost: 0,
        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider,
        totalMessages: messages.length,
        highPriorityCount: prioritized.filter((m) => m.priorityLevel === 'high').length,
      },
    };
  }

  /**
   * Detect user intent from message
   */
  private async detectIntent(
    task: AgentTask,
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { message, possibleIntents } = task.input;

    const prompt = `Analyze this message and detect the user's intent:

Message: "${message}"

${possibleIntents ? `Possible intents: ${possibleIntents.join(', ')}` : ''}

Identify:
1. Primary intent
2. Secondary intents (if any)
3. Confidence level
4. Required action
5. Urgency level

Format as JSON:
{
  "primaryIntent": "intent name",
  "secondaryIntents": ["intent1", "intent2"],
  "confidence": 0.95,
  "action": "what should be done",
  "urgency": "high/medium/low",
  "category": "question/complaint/praise/request/other"
}`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.3,
      maxTokens: 300,
    });

    const intent = this.parseJSONResponse(response.text);

    return {
      success: true,
      output: {
        primaryIntent: intent.primaryIntent || 'unknown',
        secondaryIntents: intent.secondaryIntents || [],
        confidence: intent.confidence || 0.5,
        action: intent.action || 'review',
        urgency: intent.urgency || 'medium',
        category: intent.category || 'other',
        rawAnalysis: response.text,
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider,
      },
    };
  }

  /**
   * Suggest multiple response options
   */
  private async suggestMultipleResponses(
    task: AgentTask,
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { message, context, variations } = task.input;
    const numVariations = variations || 3;

    const responses = [];

    // Generate multiple response variations
    for (let i = 0; i < numVariations; i++) {
      const tone = this.getVariationTone(i);
      const result = await this.generateResponse({
          ...task,
          input: { ...task.input, tone },
        });

      responses.push({
        response: result.output.response,
        tone,
        sentiment: result.output.sentiment,
        confidence: result.output.confidence,
      });
    }

    return {
      success: true,
      output: {
        responses,
        recommended: responses[0], // First one is usually best
        alternatives: responses.slice(1),
      },
      metadata: {
        tokensUsed: 0,
        cost: 0,
        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider,
        variationsGenerated: numVariations,
      },
    };
  }

  /**
   * Moderate content for appropriateness
   */
  private async moderateContent(
    task: AgentTask,
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { content, rules } = task.input;

    const prompt = `Moderate this content for appropriateness:

Content: "${content}"

${rules ? `Moderation Rules: ${JSON.stringify(rules)}` : ''}

Check for:
1. Offensive language
2. Spam
3. Harassment
4. Misinformation
5. Policy violations

Format as JSON:
{
  "approved": true/false,
  "violations": ["violation1", "violation2"],
  "severity": "high/medium/low",
  "action": "approve/flag/remove",
  "reason": "explanation"
}`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.2,
      maxTokens: 300,
    });

    const moderation = this.parseJSONResponse(response.text);

    return {
      success: true,
      output: {
        approved: moderation.approved !== false,
        violations: moderation.violations || [],
        severity: moderation.severity || 'low',
        action: moderation.action || 'approve',
        reason: moderation.reason || '',
        requiresReview: moderation.severity === 'high',
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider,
      },
    };
  }

  /**
   * Analyze entire conversation thread
   */
  private async analyzeConversation(
    task: AgentTask,
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { conversation, participants } = task.input;

    const prompt = `Analyze this conversation:

${conversation.map((msg, i) => `${i + 1}. ${msg.author}: ${msg.text}`).join('\n')}

Participants: ${participants?.join(', ') || 'Unknown'}

Provide:
1. Conversation summary
2. Overall sentiment
3. Key topics discussed
4. Resolution status
5. Recommended next action

Format as JSON.`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.4,
      maxTokens: 500,
    });

    const analysis = this.parseJSONResponse(response.text);

    return {
      success: true,
      output: {
        summary: analysis.summary || '',
        sentiment: analysis.sentiment || 'neutral',
        topics: analysis.topics || [],
        resolved: analysis.resolved || false,
        nextAction: analysis.nextAction || 'monitor',
        fullAnalysis: response.text,
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider,
        messageCount: conversation.length,
      },
    };
  }

  /**
   * Generate FAQ response
   */
  private async generateFAQResponse(
    task: AgentTask,
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { question, faqDatabase, context } = task.input;

    // Find matching FAQ
    const matchingFAQ = this.findMatchingFAQ(question, faqDatabase);

    if (matchingFAQ) {
      // Personalize the FAQ response
      const personalizedResponse = await this.personalizeFAQResponse(
        matchingFAQ,
        context,
      );

      return {
        success: true,
        output: {
          response: personalizedResponse,
          source: 'faq',
          faqId: matchingFAQ.id,
          confidence: matchingFAQ.confidence,
        },
        metadata: {
          tokensUsed: 0,
          cost: 0,
          duration: Date.now() - startTime,
          model: this.config.model,
          provider: this.config.aiProvider,
          matched: true,
        },
      };
    }

    // No FAQ match, generate custom response
    return this.generateResponse(task);
  }

  // Helper methods

  private buildResponsePrompt(
    message: string,
    context: any,
    platform: string,
    tone: string,
    brandVoice: string,
    conversationHistory?: any[],
    userProfile?: any,
  ): string {
    let prompt = `Generate a ${tone} response to this ${platform} message:\n\n`;
    prompt += `Message: "${message}"\n\n`;

    if (brandVoice) {
      prompt += `Brand Voice: ${brandVoice}\n\n`;
    }

    if (context) {
      prompt += `Context: ${JSON.stringify(context)}\n\n`;
    }

    if (conversationHistory && conversationHistory.length > 0) {
      prompt += `Previous conversation:\n`;
      conversationHistory.slice(-3).forEach((msg) => {
        prompt += `- ${msg.author}: ${msg.text}\n`;
      });
      prompt += '\n';
    }

    if (userProfile) {
      prompt += `User Profile: ${JSON.stringify(userProfile)}\n\n`;
    }

    prompt += `Requirements:\n`;
    prompt += `- Be ${tone} and helpful\n`;
    prompt += `- Keep it concise (under 280 characters for Twitter, under 500 for others)\n`;
    prompt += `- Address the user's concern directly\n`;
    prompt += `- Maintain brand voice\n`;
    prompt += `- Be empathetic and professional\n\n`;
    prompt += `Response:`;

    return prompt;
  }

  private optimizeResponse(
    response: string,
    platform: string,
    originalMessage: string,
  ): string {
    let optimized = response.trim();

    // Remove any "Response:" prefix
    optimized = optimized.replace(/^Response:\s*/i, '');

    // Platform-specific optimization
    if (platform === 'twitter') {
      // Ensure under 280 characters
      if (optimized.length > 280) {
        optimized = optimized.substring(0, 277) + '...';
      }
    }

    // Remove excessive punctuation
    optimized = optimized.replace(/[!]{2}/g, '!');
    optimized = optimized.replace(/[?]{2}/g, '?');

    return optimized;
  }

  private quickSentimentAnalysis(text: string): string {
    const positive = ['thank', 'great', 'excellent', 'happy', 'love', 'appreciate'];
    const negative = ['sorry', 'unfortunately', 'issue', 'problem', 'apologize'];

    const lowerText = text.toLowerCase();
    let score = 0;

    positive.forEach((word) => {
      if (lowerText.includes(word)) score += 1;
    });

    negative.forEach((word) => {
      if (lowerText.includes(word)) score -= 1;
    });

    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  }

  private calculateConfidence(response: string, originalMessage: string): number {
    // Simple confidence calculation based on response quality
    let confidence = 0.7;

    // Longer, more detailed responses get higher confidence
    if (response.length > 100) confidence += 0.1;
    if (response.length > 200) confidence += 0.1;

    // Responses that reference the original message get higher confidence
    const messageWords = originalMessage.toLowerCase().split(' ');
    const responseWords = response.toLowerCase().split(' ');
    const overlap = messageWords.filter((word) => responseWords.includes(word)).length;
    
    if (overlap > 3) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private generateAlternatives(response: string): string[] {
    // Generate simple variations
    const alternatives = [];

    // More formal version
    alternatives.push(response.replace(/!/g, '.'));

    // More casual version
    if (!response.includes('!')) {
      alternatives.push(response.replace(/\.$/, '!'));
    }

    return alternatives.slice(0, 2);
  }

  private async performSentimentAnalysis(
    message: string,
    detailed: boolean,
  ): Promise<any> {
    if (!detailed) {
      // Quick sentiment analysis
      return {
        sentiment: this.quickSentimentAnalysis(message),
        score: 0,
        confidence: 0.7,
      };
    }

    // Detailed AI-powered sentiment analysis
    const prompt = `Analyze the sentiment of this message:

"${message}"

Provide:
1. Overall sentiment (positive/negative/neutral)
2. Sentiment score (-1 to 1)
3. Confidence level (0 to 1)
4. Emotional tone
5. Key sentiment indicators

Format as JSON.`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.2,
      maxTokens: 200,
    });

    const analysis = this.parseJSONResponse(response.text);

    return {
      sentiment: analysis.sentiment || 'neutral',
      score: analysis.score || 0,
      confidence: analysis.confidence || 0.7,
      emotionalTone: analysis.emotionalTone || 'neutral',
      indicators: analysis.indicators || [],
    };
  }

  private calculateAggregateSentiment(results: any[]): any {
    const sentiments = results.map((r) => r.sentiment);
    const positive = sentiments.filter((s) => s === 'positive').length;
    const negative = sentiments.filter((s) => s === 'negative').length;
    const neutral = sentiments.filter((s) => s === 'neutral').length;

    return {
      positive,
      negative,
      neutral,
      total: results.length,
      overallSentiment:
        positive > negative ? 'positive' : negative > positive ? 'negative' : 'neutral',
    };
  }

  private generateSentimentSummary(results: any[]): string {
    const aggregate = this.calculateAggregateSentiment(results);
    return `Analyzed ${aggregate.total} messages: ${aggregate.positive} positive, ${aggregate.negative} negative, ${aggregate.neutral} neutral. Overall sentiment: ${aggregate.overallSentiment}.`;
  }

  private async calculateMessagePriority(
    message: any,
    criteria: any,
  ): Promise<any> {
    let score = 50; // Base score
    const reasons = [];

    // Check for urgent keywords
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'emergency', 'critical'];
    if (urgentKeywords.some((keyword) => message.text?.toLowerCase().includes(keyword))) {
      score += 30;
      reasons.push('Contains urgent keywords');
    }

    // Check sentiment
    const sentiment = this.quickSentimentAnalysis(message.text || '');
    if (sentiment === 'negative') {
      score += 20;
      reasons.push('Negative sentiment detected');
    }

    // Check for questions
    if (message.text?.includes('?')) {
      score += 10;
      reasons.push('Contains question');
    }

    // Check response time
    if (message.timestamp) {
      const age = Date.now() - new Date(message.timestamp).getTime();
      const hoursOld = age / (1000 * 60 * 60);
      if (hoursOld > 24) {
        score += 15;
        reasons.push('Message is over 24 hours old');
      }
    }

    // Determine priority level
    let level = 'low';
    if (score >= 80) level = 'high';
    else if (score >= 60) level = 'medium';

    return {
      score,
      level,
      reasons,
      urgency: level,
      requiresHumanReview: score >= 80,
    };
  }

  private getVariationTone(index: number): string {
    const tones = ['professional', 'friendly', 'empathetic'];
    return tones[index % tones.length];
  }

  private parseJSONResponse(text: string): any {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.warn('Failed to parse JSON response');
    }
    return {};
  }

  private findMatchingFAQ(question: string, faqDatabase: any[]): any {
    if (!faqDatabase || faqDatabase.length === 0) return null;

    // Simple keyword matching
    const questionLower = question.toLowerCase();
    
    for (const faq of faqDatabase) {
      const keywords = faq.keywords || [];
      const matches = keywords.filter((keyword: string) =>
        questionLower.includes(keyword.toLowerCase()),
      );

      if (matches.length > 0) {
        return {
          ...faq,
          confidence: matches.length / keywords.length,
        };
      }
    }

    return null;
  }

  private async personalizeFAQResponse(
    faq: any,
    context: any,
  ): Promise<string> {
    // If no context, return FAQ answer as-is
    if (!context) return faq.answer;

    // Personalize the FAQ response with context
    const prompt = `Personalize this FAQ answer with the given context:

FAQ Answer: "${faq.answer}"
Context: ${JSON.stringify(context)}

Make it more personal and relevant while keeping the core information.`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.6,
      maxTokens: 300,
    });

    return response.text.trim();
  }
}
