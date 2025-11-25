import { Test, TestingModule } from '@nestjs/testing';
import { ContentCreatorAgent } from './content-creator.agent';
import { AIProviderFactory } from '../../ai/providers/provider.factory';
import { AgentType, AgentTask, AgentConfig } from '../interfaces/agent.interface';
import { AIProviderType } from '../../ai/providers/ai-provider.interface';

describe('ContentCreatorAgent', () => {
  let agent: ContentCreatorAgent;
  let mockProviderFactory: jest.Mocked<AIProviderFactory>;

  const mockConfig: AgentConfig = {
    id: 'test-agent-1',
    tenantId: 'test-tenant',
    name: 'Test Content Creator',
    type: AgentType.CONTENT_CREATOR,
    aiProvider: AIProviderType.DEEPSEEK,
    model: 'deepseek-chat',
    personalityConfig: {
      tone: 'professional',
      style: 'engaging',
      creativity: 0.8,
    },
    active: true,
    costBudget: 10.0,
    fallbackProvider: AIProviderType.GEMINI,
  };

  beforeEach(async () => {
    // Create mock provider factory
    mockProviderFactory = {
      getProvider: jest.fn().mockReturnValue({
        name: AIProviderType.DEEPSEEK,
        generateText: jest.fn().mockResolvedValue({
          text: 'Generated content here',
          cost: 0.001,
          tokensUsed: 100,
        }),
        estimateCost: jest.fn().mockResolvedValue({
          estimatedCost: 0.001,
          estimatedTokens: 100,
          confidence: 0.9,
        }),
        checkHealth: jest.fn().mockResolvedValue({
          available: true,
          lastChecked: new Date(),
        }),
      }),
    } as any;

    agent = new ContentCreatorAgent('test-agent-1', mockConfig, mockProviderFactory);
  });

  describe('Capabilities', () => {
    it('should have all required capabilities', () => {
      const capabilities = agent.capabilities;

      expect(capabilities).toHaveLength(8);
      expect(capabilities.map(c => c.name)).toContain('generate_twitter_content');
      expect(capabilities.map(c => c.name)).toContain('generate_linkedin_content');
      expect(capabilities.map(c => c.name)).toContain('generate_instagram_content');
      expect(capabilities.map(c => c.name)).toContain('generate_facebook_content');
      expect(capabilities.map(c => c.name)).toContain('generate_tiktok_content');
      expect(capabilities.map(c => c.name)).toContain('generate_multi_platform');
      expect(capabilities.map(c => c.name)).toContain('generate_thread');
      expect(capabilities.map(c => c.name)).toContain('adapt_content');
    });
  });

  describe('Twitter Content Generation', () => {
    it('should generate Twitter content within character limit', async () => {
      const task: AgentTask = {
        id: 'task-1',
        type: 'generate_twitter_content',
        input: {
          topic: 'AI in social media',
          tone: 'engaging',
          variations: 3,
        },
      };

      const mockProvider = mockProviderFactory.getProvider(AIProviderType.DEEPSEEK);
      (mockProvider.generateText as jest.Mock).mockResolvedValue({
        text: `1. AI is transforming social media! 🚀 From content creation to analytics, the future is here. #AI #SocialMedia

---

2. Imagine creating engaging posts in seconds with AI. That's not the future - it's now! ✨ #AIMarketing

---

3. Social media + AI = Game changer for businesses. Are you ready? 💡 #DigitalMarketing`,
        cost: 0.002,
        tokensUsed: 150,
      });

      const result = await agent.execute(task);

      expect(result.success).toBe(true);
      expect(result.output.platform).toBe('twitter');
      expect(result.output.variations).toHaveLength(3);
      expect(result.output.variations[0].length).toBeLessThanOrEqual(280);
      expect(result.metadata.cost).toBeGreaterThan(0);
    });

    it('should include hashtags when requested', async () => {
      const task: AgentTask = {
        id: 'task-2',
        type: 'generate_twitter_content',
        input: {
          topic: 'productivity tips',
          includeHashtags: true,
          variations: 1,
        },
      };

      const mockProvider = mockProviderFactory.getProvider(AIProviderType.DEEPSEEK);
      (mockProvider.generateText as jest.Mock).mockResolvedValue({
        text: 'Start your day with the hardest task first. 💪 #Productivity #TimeManagement #Success',
        cost: 0.001,
        tokensUsed: 80,
      });

      const result = await agent.execute(task);

      expect(result.success).toBe(true);
      expect(result.output.hashtags).toBeDefined();
      expect(result.output.hashtags.length).toBeGreaterThan(0);
    });
  });

  describe('LinkedIn Content Generation', () => {
    it('should generate professional LinkedIn content', async () => {
      const task: AgentTask = {
        id: 'task-3',
        type: 'generate_linkedin_content',
        input: {
          topic: 'Leadership in tech',
          tone: 'professional',
          length: 'medium',
          variations: 2,
        },
      };

      const mockProvider = mockProviderFactory.getProvider(AIProviderType.DEEPSEEK);
      (mockProvider.generateText as jest.Mock).mockResolvedValue({
        text: `Leadership in tech isn't about having all the answers.

It's about asking the right questions and empowering your team to find solutions.

In my 10 years leading engineering teams, I've learned that the best leaders:
- Listen more than they speak
- Admit when they don't know something
- Create psychological safety for innovation

What's your take on modern tech leadership?

#Leadership #TechLeadership #Engineering

---

The tech industry moves fast. But great leadership principles remain constant.

Trust. Transparency. Empowerment.

These aren't buzzwords - they're the foundation of high-performing teams.

#TechLeadership #Management`,
        cost: 0.003,
        tokensUsed: 250,
      });

      const result = await agent.execute(task);

      expect(result.success).toBe(true);
      expect(result.output.platform).toBe('linkedin');
      expect(result.output.variations).toHaveLength(2);
      expect(result.output.content.length).toBeGreaterThan(100);
    });
  });

  describe('Instagram Content Generation', () => {
    it('should generate Instagram content with hashtags', async () => {
      const task: AgentTask = {
        id: 'task-4',
        type: 'generate_instagram_content',
        input: {
          topic: 'morning routine',
          tone: 'inspiring',
          hashtagCount: 15,
          variations: 1,
        },
      };

      const mockProvider = mockProviderFactory.getProvider(AIProviderType.DEEPSEEK);
      (mockProvider.generateText as jest.Mock).mockResolvedValue({
        text: `Your morning sets the tone for your entire day ☀️

I used to hit snooze 5 times. Now I wake up excited.

The difference? A simple routine:
✨ 5 min meditation
✨ Cold shower
✨ Healthy breakfast
✨ 30 min reading

Small changes. Big impact.

What's your morning ritual? Drop it below! 👇

#MorningRoutine #ProductivityTips #HealthyHabits #Wellness #SelfCare #Mindfulness #PersonalGrowth #SuccessHabits #MorningMotivation #HealthyLifestyle #DailyRoutine #WellnessJourney #MindsetMatters #GoodVibes #PositiveEnergy`,
        cost: 0.002,
        tokensUsed: 180,
      });

      const result = await agent.execute(task);

      expect(result.success).toBe(true);
      expect(result.output.platform).toBe('instagram');
      expect(result.output.hashtags).toBeDefined();
      expect(result.output.hashtags.length).toBeGreaterThan(0);
      expect(result.output.hashtagCount).toBeDefined();
    });
  });

  describe('Multi-Platform Content Generation', () => {
    it('should generate content for multiple platforms', async () => {
      const task: AgentTask = {
        id: 'task-5',
        type: 'generate_multi_platform',
        input: {
          topic: 'new product launch',
          platforms: ['twitter', 'linkedin', 'instagram'],
          tone: 'exciting',
        },
      };

      const result = await agent.execute(task);

      expect(result.success).toBe(true);
      expect(result.output.platformContent).toBeDefined();
      expect(result.output.platforms).toEqual(['twitter', 'linkedin', 'instagram']);
      expect(result.output.successCount).toBeGreaterThan(0);
    });
  });

  describe('Thread Generation', () => {
    it('should generate a Twitter thread', async () => {
      const task: AgentTask = {
        id: 'task-6',
        type: 'generate_thread',
        input: {
          topic: 'AI trends 2024',
          platform: 'twitter',
          threadLength: 5,
        },
      };

      const mockProvider = mockProviderFactory.getProvider(AIProviderType.DEEPSEEK);
      (mockProvider.generateText as jest.Mock).mockResolvedValue({
        text: `1/5 AI trends that will dominate 2024 🧵

2/5 Multimodal AI is becoming mainstream. Text, images, video - all in one model.

3/5 AI agents are getting smarter. They can now coordinate and work together autonomously.

4/5 Cost optimization is key. Companies are finding ways to use AI efficiently without breaking the bank.

5/5 The future is agentic. AI won't just assist - it will act. Are you ready?`,
        cost: 0.004,
        tokensUsed: 300,
      });

      const result = await agent.execute(task);

      expect(result.success).toBe(true);
      expect(result.output.thread).toBeDefined();
      expect(result.output.threadLength).toBeGreaterThan(0);
      expect(result.output.platform).toBe('twitter');
    });
  });

  describe('Content Adaptation', () => {
    it('should adapt content from one platform to another', async () => {
      const task: AgentTask = {
        id: 'task-7',
        type: 'adapt_content',
        input: {
          content: 'Check out our new AI-powered social media tool! It helps you create content 10x faster. Link in bio.',
          sourcePlatform: 'instagram',
          targetPlatform: 'linkedin',
        },
      };

      const mockProvider = mockProviderFactory.getProvider(AIProviderType.DEEPSEEK);
      (mockProvider.generateText as jest.Mock).mockResolvedValue({
        text: `Excited to announce our new AI-powered social media management platform!

After months of development, we've built a tool that helps marketing teams create high-quality content 10x faster.

Key features:
• Multi-agent AI system for content generation
• Platform-specific optimization
• Cost-effective AI routing
• Real-time analytics

We're currently in beta. Interested in early access? Drop a comment or DM me.

#AIMarketing #SocialMediaManagement #MarTech`,
        cost: 0.002,
        tokensUsed: 150,
      });

      const result = await agent.execute(task);

      expect(result.success).toBe(true);
      expect(result.output.sourcePlatform).toBe('instagram');
      expect(result.output.targetPlatform).toBe('linkedin');
      expect(result.output.adaptedContent).toBeDefined();
      expect(result.output.adaptedContent.length).toBeGreaterThan(result.output.originalContent.length);
    });
  });

  describe('Cost Management', () => {
    it('should track costs accurately', async () => {
      const task: AgentTask = {
        id: 'task-8',
        type: 'generate_twitter_content',
        input: {
          topic: 'test topic',
          variations: 1,
        },
      };

      const result = await agent.execute(task);

      expect(result.metadata.cost).toBeGreaterThan(0);
      expect(result.metadata.tokensUsed).toBeGreaterThan(0);
      expect(result.metadata.duration).toBeGreaterThan(0);
    });

    it('should respect cost budget', async () => {
      // Set very low budget
      agent.config.costBudget = 0.0001;
      agent.config.usageStats = {
        totalCost: 0.0001,
      };

      const task: AgentTask = {
        id: 'task-9',
        type: 'generate_twitter_content',
        input: {
          topic: 'test topic',
        },
      };

      const result = await agent.execute(task);

      expect(result.success).toBe(false);
      expect(result.error).toContain('budget');
    });
  });

  describe('Error Handling', () => {
    it('should handle provider failures gracefully', async () => {
      const mockProvider = mockProviderFactory.getProvider(AIProviderType.DEEPSEEK);
      (mockProvider.generateText as jest.Mock).mockRejectedValue(new Error('Provider unavailable'));

      const task: AgentTask = {
        id: 'task-10',
        type: 'generate_twitter_content',
        input: {
          topic: 'test topic',
        },
      };

      const result = await agent.execute(task);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Health Check', () => {
    it('should check agent health', async () => {
      const isHealthy = await agent.checkHealth();
      expect(isHealthy).toBe(true);
    });
  });
});
