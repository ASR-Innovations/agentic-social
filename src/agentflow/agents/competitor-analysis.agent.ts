import { Injectable, Logger } from '@nestjs/common';
import { BaseAgent } from './base-agent';
import { AgentConfig, AgentTask, AgentResult, AgentType } from '../interfaces/agent.interface';
import { AIProviderFactory } from '../../ai/providers/provider.factory';
import { AgentMemoryService } from '../memory/agent-memory.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AgentConfigEntity } from '../entities/agent-config.entity';

/**
 * Competitor Analysis Agent
 * 
 * Tracks and analyzes competitor social media activities, strategies, and performance.
 * Provides competitive intelligence and identifies gaps and opportunities.
 * 
 * Capabilities:
 * - Competitor activity monitoring
 * - Content strategy analysis
 * - Performance benchmarking
 * - Share of voice calculation
 * - Gap analysis
 * - Best practice identification
 * - Competitive positioning
 */
@Injectable()
export class CompetitorAnalysisAgent extends BaseAgent {
  protected readonly logger = new Logger(CompetitorAnalysisAgent.name);
  protected readonly agentType = AgentType.COMPETITOR_ANALYSIS;

  constructor(
    id: string,
    config: AgentConfig,
    providerFactory: AIProviderFactory,
  ) {
    super(id, AgentType.ANALYTICS, config, providerFactory);
  }

  /**
   * Execute competitor analysis task
   */
  
  get capabilities() {
    return [
      {
        name: 'execute_task',
        description: 'Execute agent-specific tasks',
        requiredInputs: ['type', 'input'],
        outputs: ['result']
      },
    ];
  }

  
  async execute(task: AgentTask): Promise<AgentResult> {
    return this.executeTask(task, this.config);
  }

  async executeTask(task: AgentTask, config: AgentConfig): Promise<AgentResult> {
    this.logger.log(`Executing competitor analysis task: ${task.type}`);

    switch (task.type) {
      case 'analyze_competitor':
        return this.analyzeCompetitor(task);
      
      case 'benchmark_performance':
        return this.benchmarkPerformance(task);
      
      case 'analyze_content_strategy':
        return this.analyzeContentStrategy(task);
      
      case 'calculate_share_of_voice':
        return this.calculateShareOfVoice(task);
      
      case 'identify_gaps':
        return this.identifyGaps(task);
      
      case 'extract_best_practices':
        return this.extractBestPractices(task);
      
      case 'analyze_positioning':
        return this.analyzePositioning(task);
      
      case 'generate_competitive_report':
        return this.generateCompetitiveReport(task);
      
      default:
        throw new Error(`Unknown competitor analysis task type: ${task.type}`);
    }
  }

  /**
   * Analyze a specific competitor
   */
  private async analyzeCompetitor(
    task: AgentTask
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { competitor, metrics, timeRange, platforms } = task.input;

    const prompt = `Analyze this competitor's social media presence:

Competitor: ${competitor.name || 'Unknown'}
Metrics: ${JSON.stringify(metrics, null, 2)}
Time Range: ${timeRange || 'last 30 days'}
Platforms: ${platforms?.join(', ') || 'all'}

Provide comprehensive analysis:
1. Overall social media presence
2. Strengths and weaknesses
3. Content strategy
4. Engagement patterns
5. Audience demographics
6. Posting frequency and timing
7. Key differentiators
8. Opportunities to outperform

Format as JSON with detailed insights.`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.4,
      maxTokens: 2000
      });

    const analysis = this.parseJSONResponse(response.text);

    // Calculate competitor score
    const competitorScore = this.calculateCompetitorScore(metrics);

    return {
      success: true,
      output: {
        competitor: competitor.name,
        overallScore: competitorScore,
        presence: analysis.presence || {},
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        contentStrategy: analysis.contentStrategy || {},
        engagementPatterns: analysis.engagementPatterns || {},
        demographics: analysis.demographics || {},
        postingBehavior: analysis.postingBehavior || {},
        differentiators: analysis.differentiators || [],
        opportunities: analysis.opportunities || [],
        fullAnalysis: response.text
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        timeRange,

        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider}
      };
  }

  /**
   * Benchmark performance against competitors
   */
  private async benchmarkPerformance(
    task: AgentTask
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { yourMetrics, competitorMetrics, benchmarkMetrics } = task.input;

    const prompt = `Benchmark performance against competitors:

Your Performance: ${JSON.stringify(yourMetrics, null, 2)}
Competitors: ${JSON.stringify(competitorMetrics, null, 2)}
Benchmark Metrics: ${benchmarkMetrics?.join(', ') || 'all metrics'}

Analyze:
1. Relative performance for each metric
2. Ranking among competitors
3. Performance gaps
4. Areas of leadership
5. Industry benchmarks
6. Improvement opportunities

Format as JSON with comparative analysis.`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.3,
      maxTokens: 1800
      });

    const benchmark = this.parseJSONResponse(response.text);

    // Calculate rankings
    const rankings = this.calculateRankings(yourMetrics, competitorMetrics, benchmarkMetrics);

    return {
      success: true,
      output: {
        rankings,
        comparison: benchmark.comparison || {},
        gaps: benchmark.gaps || [],
        leadership: benchmark.leadership || [],
        industryBenchmarks: benchmark.industryBenchmarks || {},
        opportunities: benchmark.opportunities || [],
        recommendations: benchmark.recommendations || [],
        fullAnalysis: response.text
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        competitorsAnalyzed: competitorMetrics?.length || 0,

        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider}
      };
  }

  /**
   * Analyze competitor content strategy
   */
  private async analyzeContentStrategy(
    task: AgentTask
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { competitorContent, timeRange } = task.input;

    const prompt = `Analyze competitor content strategy:

Content Sample: ${JSON.stringify(competitorContent, null, 2)}
Time Range: ${timeRange}

Identify:
1. Content themes and topics
2. Content types (text, image, video, etc.)
3. Posting frequency by platform
4. Engagement patterns by content type
5. Tone and brand voice
6. Call-to-action strategies
7. Hashtag usage
8. Visual style and branding

Format as JSON with strategic insights.`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.4,
      maxTokens: 1800
      });

    const strategy = this.parseJSONResponse(response.text);

    // Analyze content patterns
    const patterns = this.analyzeContentPatterns(competitorContent);

    return {
      success: true,
      output: {
        themes: strategy.themes || patterns.themes,
        contentTypes: strategy.contentTypes || patterns.contentTypes,
        frequency: strategy.frequency || patterns.frequency,
        engagementPatterns: strategy.engagementPatterns || {},
        toneAndVoice: strategy.toneAndVoice || {},
        ctaStrategies: strategy.ctaStrategies || [],
        hashtagUsage: strategy.hashtagUsage || {},
        visualStyle: strategy.visualStyle || {},
        keyTakeaways: strategy.keyTakeaways || [],
        fullAnalysis: response.text
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        contentAnalyzed: competitorContent?.length || 0,

        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider}
      };
  }

  /**
   * Calculate share of voice
   */
  private async calculateShareOfVoice(
    task: AgentTask
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { mentions, competitors, keywords, timeRange } = task.input;

    // Calculate raw share of voice
    const sov = this.calculateSOV(mentions, competitors);

    const prompt = `Analyze share of voice data:

Share of Voice: ${JSON.stringify(sov, null, 2)}
Keywords: ${keywords?.join(', ') || 'brand mentions'}
Time Range: ${timeRange}

Provide:
1. Share of voice interpretation
2. Trends over time
3. Sentiment breakdown
4. Platform distribution
5. Strategies to increase SOV

Format as JSON.`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.4,
      maxTokens: 1200
      });

    const analysis = this.parseJSONResponse(response.text);

    return {
      success: true,
      output: {
        shareOfVoice: sov,
        interpretation: analysis.interpretation || '',
        trends: analysis.trends || [],
        sentimentBreakdown: analysis.sentimentBreakdown || {},
        platformDistribution: analysis.platformDistribution || {},
        strategies: analysis.strategies || [],
        recommendations: analysis.recommendations || []
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        timeRange,

        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider}
      };
  }

  /**
   * Identify competitive gaps and opportunities
   */
  private async identifyGaps(
    task: AgentTask
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { yourStrategy, competitorStrategies, marketData } = task.input;

    const prompt = `Identify gaps and opportunities in competitive landscape:

Your Strategy: ${JSON.stringify(yourStrategy, null, 2)}
Competitor Strategies: ${JSON.stringify(competitorStrategies, null, 2)}
Market Data: ${JSON.stringify(marketData, null, 2)}

Identify:
1. Content gaps (topics competitors cover that you don't)
2. Platform gaps (platforms competitors dominate)
3. Audience gaps (segments competitors reach better)
4. Timing gaps (optimal posting times you're missing)
5. Format gaps (content types you're underutilizing)
6. Engagement gaps (tactics competitors use effectively)

For each gap, provide:
- Description
- Impact level (high/medium/low)
- Difficulty to address
- Recommended action

Format as JSON.`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.4,
      maxTokens: 2000
      });

    const gaps = this.parseJSONResponse(response.text);

    // Prioritize gaps
    const prioritized = this.prioritizeGaps(gaps.gaps || []);

    return {
      success: true,
      output: {
        gaps: prioritized,
        contentGaps: gaps.contentGaps || [],
        platformGaps: gaps.platformGaps || [],
        audienceGaps: gaps.audienceGaps || [],
        timingGaps: gaps.timingGaps || [],
        formatGaps: gaps.formatGaps || [],
        engagementGaps: gaps.engagementGaps || [],
        highPriorityGaps: prioritized.filter((g) => g.priority === 'high'),
        recommendations: gaps.recommendations || []
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        gapsIdentified: prioritized.length,

        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider}
      };
  }

  /**
   * Extract best practices from competitors
   */
  private async extractBestPractices(
    task: AgentTask
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { topPerformers, successMetrics } = task.input;

    const prompt = `Extract best practices from top-performing competitors:

Top Performers: ${JSON.stringify(topPerformers, null, 2)}
Success Metrics: ${successMetrics?.join(', ') || 'engagement, reach, growth'}

Identify:
1. Common success patterns
2. Unique tactics that work
3. Content best practices
4. Engagement best practices
5. Platform-specific best practices
6. Replicable strategies

For each best practice:
- Description
- Evidence of effectiveness
- Applicability to your brand
- Implementation difficulty
- Expected impact

Format as JSON.`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.4,
      maxTokens: 2000
      });

    const practices = this.parseJSONResponse(response.text);

    return {
      success: true,
      output: {
        bestPractices: practices.bestPractices || [],
        commonPatterns: practices.commonPatterns || [],
        uniqueTactics: practices.uniqueTactics || [],
        contentPractices: practices.contentPractices || [],
        engagementPractices: practices.engagementPractices || [],
        platformPractices: practices.platformPractices || {},
        replicableStrategies: practices.replicableStrategies || [],
        implementationPlan: practices.implementationPlan || []
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        competitorsAnalyzed: topPerformers?.length || 0,

        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider}
      };
  }

  /**
   * Analyze competitive positioning
   */
  private async analyzePositioning(
    task: AgentTask
  ): Promise<AgentResult> {
    const { yourBrand, competitors, marketSegment } = task.input;

    const prompt = `Analyze competitive positioning:

Your Brand: ${JSON.stringify(yourBrand, null, 2)}
Competitors: ${JSON.stringify(competitors, null, 2)}
Market Segment: ${marketSegment}

Analyze:
1. Current positioning in the market
2. Positioning of each competitor
3. Differentiation opportunities
4. Positioning gaps
5. Messaging strategy comparison
6. Target audience overlap
7. Unique value propositions

Provide strategic recommendations for positioning.

Format as JSON.`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.4,
      maxTokens: 1800
      });

    const positioning = this.parseJSONResponse(response.text);

    return {
      success: true,
      output: {
        currentPositioning: positioning.currentPositioning || {},
        competitorPositioning: positioning.competitorPositioning || [],
        differentiationOpportunities: positioning.differentiationOpportunities || [],
        positioningGaps: positioning.positioningGaps || [],
        messagingComparison: positioning.messagingComparison || {},
        audienceOverlap: positioning.audienceOverlap || {},
        uniqueValueProps: positioning.uniqueValueProps || [],
        recommendations: positioning.recommendations || [],
        fullAnalysis: response.text
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        duration: 0,
        model: response.model,
        provider: this.config.aiProvider
      }
      };
  }

  /**
   * Generate comprehensive competitive report
   */
  private async generateCompetitiveReport(
    task: AgentTask
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { competitors, timeRange, metrics } = task.input;

    // Analyze each competitor
    const competitorAnalyses = [];
    for (const competitor of competitors.slice(0, 5)) {
      const analysis = await this.analyzeCompetitor(
        { ...task, input: { competitor, metrics: competitor.metrics, timeRange } }
    );
      competitorAnalyses.push(analysis.output);
    }

    // Benchmark performance
    const benchmark = await this.benchmarkPerformance(
      {
        ...task,
        input: {
          yourMetrics: task.input.yourMetrics,
          competitorMetrics: competitors.map((c) => c.metrics),
          benchmarkMetrics: metrics
      }
      }
    );

    const prompt = `Generate a comprehensive competitive analysis report:

Competitor Analyses: ${JSON.stringify(competitorAnalyses, null, 2)}
Benchmark Results: ${JSON.stringify(benchmark.output, null, 2)}
Time Range: ${timeRange}

Create a professional report with:
1. Executive Summary
2. Competitive Landscape Overview
3. Individual Competitor Profiles
4. Performance Benchmarking
5. Strategic Recommendations
6. Action Plan

Format as a well-structured report.`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.4,
      maxTokens: 3000
      });

    return {
      success: true,
      output: {
        report: response.text,
        executiveSummary: this.extractExecutiveSummary(response.text),
        competitorProfiles: competitorAnalyses,
        benchmarking: benchmark.output,
        recommendations: this.extractRecommendations(response.text),
        actionPlan: this.extractActionPlan(response.text)
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        competitorsAnalyzed: competitors.length,
        timeRange,

        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider}
      };
  }

  // Helper methods

  private calculateCompetitorScore(metrics: any): number {
    if (!metrics) return 50;

    let score = 0;
    let count = 0;

    if (metrics.engagement) {
      score += Math.min((metrics.engagement / 1000) * 20, 20);
      count++;
    }

    if (metrics.reach) {
      score += Math.min((metrics.reach / 10000) * 20, 20);
      count++;
    }

    if (metrics.followers) {
      score += Math.min((metrics.followers / 10000) * 20, 20);
      count++;
    }

    if (metrics.engagementRate) {
      score += Math.min(metrics.engagementRate * 200, 20);
      count++;
    }

    if (metrics.postFrequency) {
      score += Math.min(metrics.postFrequency * 2, 20);
      count++;
    }

    return count > 0 ? Math.round(score) : 50;
  }

  private calculateRankings(yourMetrics: any, competitorMetrics: any[], benchmarkMetrics: string[]): any {
    const rankings = {};

    benchmarkMetrics?.forEach((metric) => {
      const allValues = [
        { name: 'You', value: yourMetrics[metric] || 0 },
        ...(competitorMetrics || []).map((c, i) => ({
          name: c.name || `Competitor ${i + 1}`,
          value: c[metric] || 0
      })),
      ];

      allValues.sort((a, b) => b.value - a.value);

      rankings[metric] = {
        yourRank: allValues.findIndex((v) => v.name === 'You') + 1,
        totalCompetitors: allValues.length,
        leaderValue: allValues[0].value,
        yourValue: yourMetrics[metric] || 0,
        gap: allValues[0].value - (yourMetrics[metric] || 0)
      };
    });

    return rankings;
  }

  private analyzeContentPatterns(content: any[]): any {
    if (!content || content.length === 0) {
      return {
        themes: [],
        contentTypes: {},
        frequency: {}
      };
    }

    const themes = {};
    const contentTypes = {};
    const frequency = {};

    content.forEach((item) => {
      // Count themes
      if (item.theme) {
        themes[item.theme] = (themes[item.theme] || 0) + 1;
      }

      // Count content types
      if (item.type) {
        contentTypes[item.type] = (contentTypes[item.type] || 0) + 1;
      }

      // Count by platform
      if (item.platform) {
        frequency[item.platform] = (frequency[item.platform] || 0) + 1;
      }
    });

    return {
      themes: Object.entries(themes)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([theme, count]) => ({ theme, count })),
      contentTypes,
      frequency
      };
  }

  private calculateSOV(mentions: any, competitors: any[]): any {
    const totalMentions = mentions.yours + competitors.reduce((sum, c) => sum + (c.mentions || 0), 0);

    const sov = {
      yours: {
        mentions: mentions.yours,
        percentage: (mentions.yours / totalMentions) * 100
      },
      competitors: competitors.map((c) => ({
        name: c.name,
        mentions: c.mentions || 0,
        percentage: ((c.mentions || 0) / totalMentions) * 100
      })),
      total: totalMentions
      };

    return sov;
  }

  private prioritizeGaps(gaps: any[]): any[] {
    return gaps
      .map((gap) => ({
        ...gap,
        priority: this.calculateGapPriority(gap)
      }))
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  }

  private calculateGapPriority(gap: any): string {
    const impact = gap.impact || 'medium';
    const difficulty = gap.difficulty || 'medium';

    if (impact === 'high' && (difficulty === 'low' || difficulty === 'medium')) {
      return 'high';
    }

    if (impact === 'medium' || (impact === 'high' && difficulty === 'high')) {
      return 'medium';
    }

    return 'low';
  }

  private extractExecutiveSummary(text: string): string {
    const match = text.match(/Executive Summary[:\s]+(.*?)(?=\n\n|\n#|$)/is);
    return match ? match[1].trim() : text.substring(0, 300);
  }

  private extractRecommendations(text: string): string[] {
    const recommendations = [];
    const lines = text.split('\n');

    for (const line of lines) {
      if (
        line.match(/^[-*]\s/) ||
        line.toLowerCase().includes('recommend') ||
        line.toLowerCase().includes('should')
      ) {
        const cleaned = line.replace(/^[-*]\s/, '').trim();
        if (cleaned.length > 10) {
          recommendations.push(cleaned);
        }
      }
    }

    return recommendations.slice(0, 10);
  }

  private extractActionPlan(text: string): string[] {
    const match = text.match(/Action Plan[:\s]+(.*?)(?=\n\n|\n#|$)/is);
    if (match) {
      return match[1]
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .map((line) => line.replace(/^[-*]\s/, '').trim());
    }
    return [];
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
}
