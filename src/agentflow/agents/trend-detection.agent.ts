import { Injectable, Logger } from '@nestjs/common';
import { BaseAgent } from './base-agent';
import { AgentConfig, AgentTask, AgentResult, AgentType } from '../interfaces/agent.interface';
import { AIProviderFactory } from '../../ai/providers/provider.factory';
import { AgentMemoryService } from '../memory/agent-memory.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AgentConfigEntity } from '../entities/agent-config.entity';

/**
 * Trend Detection Agent
 * 
 * Monitors and identifies trending topics, hashtags, and content opportunities
 * across social media platforms. Provides early detection of emerging trends
 * and recommendations for capitalizing on viral moments.
 * 
 * Capabilities:
 * - Trending topic identification
 * - Hashtag analysis and recommendations
 * - Viral content detection
 * - Trend lifecycle prediction
 * - Industry-specific trend monitoring
 * - Opportunity scoring
 * - Trend correlation analysis
 */
@Injectable()
export class TrendDetectionAgent extends BaseAgent {
  protected readonly logger = new Logger(TrendDetectionAgent.name);

  constructor(
    id: string,
    config: AgentConfig,
    providerFactory: AIProviderFactory,
  ) {
    super(id, AgentType.TREND_DETECTION, config, providerFactory);
    this.logger.log('Trend Detection Agent initialized');
  }

  get capabilities() {
    return [
      {
        name: 'detect_trends',
        description: 'Detect trending topics and hashtags',
        requiredInputs: ['platform', 'category'],
        outputs: ['trends', 'scores']
      },
      {
        name: 'analyze_hashtags',
        description: 'Analyze hashtag performance and recommendations',
        requiredInputs: ['hashtags'],
        outputs: ['analysis', 'recommendations']
      },
    ];
  }

  /**
   * Execute trend detection task
   */
  async execute(task: AgentTask): Promise<AgentResult> {
    this.logger.log(`Executing trend detection task: ${task.type}`);

    switch (task.type) {
      case 'detect_trends':
        return this.detectTrends(task);
      
      case 'analyze_hashtags':
        return this.analyzeHashtags(task);
      
      case 'identify_viral_content':
        return this.identifyViralContent(task);
      
      case 'predict_trend_lifecycle':
        return this.predictTrendLifecycle(task);
      
      case 'monitor_industry_trends':
        return this.monitorIndustryTrends(task);
      
      case 'score_opportunities':
        return this.scoreOpportunities(task);
      
      case 'correlate_trends':
        return this.correlateTrends(task);
      
      case 'generate_trend_report':
        return this.generateTrendReport(task);
      
      default:
        throw new Error(`Unknown trend detection task type: ${task.type}`);
    }
  }

  /**
   * Detect trending topics and content
   */
  private async detectTrends(
    task: AgentTask
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { data, platforms, industry, timeWindow } = task.input;

    const prompt = `Analyze this social media data and identify trending topics:

Data Summary:
${JSON.stringify(data, null, 2)}

Platforms: ${platforms?.join(', ') || 'all'}
Industry: ${industry || 'general'}
Time Window: ${timeWindow || 'last 24 hours'}

Identify:
1. Top 10 trending topics
2. Emerging trends (early stage)
3. Peak trends (maximum visibility)
4. Declining trends (losing momentum)
5. Relevance to the industry
6. Engagement potential

Format as JSON:
{
  "trending": [
    {
      "topic": "topic name",
      "stage": "emerging/peak/declining",
      "volume": "high/medium/low",
      "relevance": 0.95,
      "platforms": ["platform1"],
      "engagementPotential": "high/medium/low",
      "recommendedAction": "what to do"
    }
  ],
  "summary": "overall trend summary"
}`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.4,
      maxTokens: 2000
      });

    const trends = this.parseJSONResponse(response.text);

    // Calculate trend scores
    const scoredTrends = this.scoreTrends(trends.trending || []);

    return {
      success: true,
      output: {
        trending: scoredTrends,
        emerging: scoredTrends.filter((t) => t.stage === 'emerging'),
        peak: scoredTrends.filter((t) => t.stage === 'peak'),
        declining: scoredTrends.filter((t) => t.stage === 'declining'),
        summary: trends.summary || '',
        recommendations: this.generateTrendRecommendations(scoredTrends)
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        trendsDetected: scoredTrends.length,
        timeWindow,

        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider}
      };
  }

  /**
   * Analyze hashtag performance and trends
   */
  private async analyzeHashtags(
    task: AgentTask
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { hashtags, performanceData, industry } = task.input;

    const prompt = `Analyze these hashtags for trends and performance:

Hashtags: ${hashtags?.join(', ') || 'none provided'}
Performance Data: ${JSON.stringify(performanceData, null, 2)}
Industry: ${industry || 'general'}

Provide:
1. Top performing hashtags
2. Trending hashtags to use
3. Hashtag combinations that work well
4. Hashtags to avoid
5. Optimal number of hashtags per platform
6. Niche vs broad hashtag strategy

Format as JSON with detailed analysis.`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.4,
      maxTokens: 1500
      });

    const analysis = this.parseJSONResponse(response.text);

    // Calculate hashtag metrics
    const metrics = this.calculateHashtagMetrics(hashtags, performanceData);

    return {
      success: true,
      output: {
        topPerforming: analysis.topPerforming || metrics.topPerforming,
        trending: analysis.trending || [],
        combinations: analysis.combinations || [],
        avoid: analysis.avoid || [],
        optimalCount: analysis.optimalCount || { twitter: 2, instagram: 10, linkedin: 3 },
        strategy: analysis.strategy || 'balanced',
        recommendations: analysis.recommendations || [],
        metrics
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        hashtagsAnalyzed: hashtags?.length || 0,

        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider}
      };
  }

  /**
   * Identify viral or high-performing content
   */
  private async identifyViralContent(
    task: AgentTask
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { contentData, threshold, platforms } = task.input;

    // Calculate virality scores
    const scored = this.calculateViralityScores(contentData, threshold);

    const prompt = `Analyze this high-performing content to identify viral patterns:

Viral Content:
${JSON.stringify(scored.viral.slice(0, 10), null, 2)}

Identify:
1. Common characteristics of viral content
2. Content types that perform best
3. Timing patterns
4. Engagement patterns
5. Replication strategies

Format as JSON.`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.4,
      maxTokens: 1500
      });

    const analysis = this.parseJSONResponse(response.text);

    return {
      success: true,
      output: {
        viralContent: scored.viral,
        characteristics: analysis.characteristics || [],
        bestContentTypes: analysis.bestContentTypes || [],
        timingPatterns: analysis.timingPatterns || [],
        engagementPatterns: analysis.engagementPatterns || [],
        replicationStrategies: analysis.replicationStrategies || [],
        viralityThreshold: threshold
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        viralContentFound: scored.viral.length,

        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider}
      };
  }

  /**
   * Predict trend lifecycle and longevity
   */
  private async predictTrendLifecycle(
    task: AgentTask
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { trend, historicalData, similarTrends } = task.input;

    const prompt = `Predict the lifecycle of this trend:

Trend: ${trend}
Historical Data: ${JSON.stringify(historicalData, null, 2)}
Similar Past Trends: ${JSON.stringify(similarTrends, null, 2)}

Predict:
1. Current stage (emerging/growth/peak/decline/end)
2. Expected duration
3. Peak timing
4. Decline rate
5. Longevity factors
6. Optimal engagement window

Format as JSON with confidence levels.`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.3,
      maxTokens: 1200
      });

    const prediction = this.parseJSONResponse(response.text);

    return {
      success: true,
      output: {
        currentStage: prediction.currentStage || 'unknown',
        expectedDuration: prediction.expectedDuration || 'unknown',
        peakTiming: prediction.peakTiming || 'unknown',
        declineRate: prediction.declineRate || 'medium',
        longevityFactors: prediction.longevityFactors || [],
        optimalWindow: prediction.optimalWindow || 'now',
        confidence: prediction.confidence || 0.6,
        recommendation: this.generateLifecycleRecommendation(prediction)
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
   * Monitor industry-specific trends
   */
  private async monitorIndustryTrends(
    task: AgentTask
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { industry, keywords, competitors, timeRange } = task.input;

    const prompt = `Monitor trends specific to the ${industry} industry:

Keywords to Track: ${keywords?.join(', ') || 'industry-related'}
Competitors: ${competitors?.join(', ') || 'none specified'}
Time Range: ${timeRange || 'last 7 days'}

Identify:
1. Industry-specific trending topics
2. Competitor trend adoption
3. Emerging technologies or practices
4. Regulatory or policy trends
5. Consumer behavior shifts
6. Opportunities for thought leadership

Format as JSON with actionable insights.`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.4,
      maxTokens: 2000
      });

    const trends = this.parseJSONResponse(response.text);

    return {
      success: true,
      output: {
        industryTrends: trends.industryTrends || [],
        competitorActivity: trends.competitorActivity || [],
        emergingTopics: trends.emergingTopics || [],
        regulatoryTrends: trends.regulatoryTrends || [],
        consumerShifts: trends.consumerShifts || [],
        opportunities: trends.opportunities || [],
        recommendations: trends.recommendations || []
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        industry,
        timeRange,

        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider}
      };
  }

  /**
   * Score trend opportunities
   */
  private async scoreOpportunities(
    task: AgentTask
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { trends, brandProfile, resources } = task.input;

    const prompt = `Score these trend opportunities for the brand:

Trends: ${JSON.stringify(trends, null, 2)}
Brand Profile: ${JSON.stringify(brandProfile, null, 2)}
Available Resources: ${JSON.stringify(resources, null, 2)}

Score each trend on:
1. Relevance to brand (0-100)
2. Engagement potential (0-100)
3. Competition level (0-100, lower is better)
4. Resource requirements (0-100, lower is better)
5. Timing urgency (0-100)
6. Overall opportunity score

Format as JSON with ranked opportunities.`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.3,
      maxTokens: 1500
      });

    const scored = this.parseJSONResponse(response.text);

    // Calculate composite scores
    const opportunities = this.calculateOpportunityScores(scored.opportunities || trends);

    return {
      success: true,
      output: {
        opportunities: opportunities.sort((a, b) => b.overallScore - a.overallScore),
        topOpportunities: opportunities.slice(0, 5),
        quickWins: opportunities.filter((o) => o.resourceRequirements < 30 && o.overallScore > 70),
        longTerm: opportunities.filter((o) => o.resourceRequirements > 70)
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        opportunitiesScored: opportunities.length,

        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider}
      };
  }

  /**
   * Correlate trends with performance
   */
  private async correlateTrends(
    task: AgentTask
  ): Promise<AgentResult> {
    const { trends, performanceData, timeRange } = task.input;

    const prompt = `Correlate these trends with performance data:

Trends: ${JSON.stringify(trends, null, 2)}
Performance: ${JSON.stringify(performanceData, null, 2)}
Time Range: ${timeRange}

Analyze:
1. Which trends correlate with high engagement
2. Trend timing vs performance spikes
3. Platform-specific trend performance
4. Content type effectiveness per trend
5. Audience response patterns

Format as JSON with correlation coefficients and insights.`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.3,
      maxTokens: 1500
      });

    const analysis = this.parseJSONResponse(response.text);

    return {
      success: true,
      output: {
        correlations: analysis.correlations || [],
        highPerformingTrends: analysis.highPerformingTrends || [],
        timingInsights: analysis.timingInsights || [],
        platformInsights: analysis.platformInsights || [],
        recommendations: analysis.recommendations || []
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
   * Generate comprehensive trend report
   */
  private async generateTrendReport(
    task: AgentTask
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { timeRange, industry, platforms } = task.input;

    // Detect current trends
    const trends = await this.detectTrends(
      { ...task, input: { ...task.input, data: task.input.trendData } }
    );

    // Analyze hashtags
    const hashtags = await this.analyzeHashtags(
      { ...task, input: { ...task.input, hashtags: task.input.topHashtags } }
    );

    const prompt = `Generate a comprehensive trend report:

Current Trends: ${JSON.stringify(trends.output.trending?.slice(0, 10), null, 2)}
Hashtag Analysis: ${JSON.stringify(hashtags.output.topPerforming?.slice(0, 10), null, 2)}
Time Range: ${timeRange}
Industry: ${industry}
Platforms: ${platforms?.join(', ')}

Create a report with:
1. Executive Summary
2. Top Trends Overview
3. Emerging Opportunities
4. Hashtag Recommendations
5. Action Plan
6. Monitoring Strategy

Format as a professional report.`;

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
        trends: trends.output,
        hashtags: hashtags.output,
        actionPlan: this.extractActionPlan(response.text)
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        timeRange,
        industry,

        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider}
      };
  }

  // Helper methods

  private scoreTrends(trends: any[]): any[] {
    return trends.map((trend) => ({
      ...trend,
      score: this.calculateTrendScore(trend)
      }));
  }

  private calculateTrendScore(trend: any): number {
    let score = 50;

    // Volume impact
    if (trend.volume === 'high') score += 20;
    else if (trend.volume === 'medium') score += 10;

    // Relevance impact
    score += (trend.relevance || 0.5) * 20;

    // Stage impact
    if (trend.stage === 'emerging') score += 15; // Early opportunity
    else if (trend.stage === 'peak') score += 10;
    else if (trend.stage === 'declining') score -= 10;

    // Engagement potential
    if (trend.engagementPotential === 'high') score += 15;
    else if (trend.engagementPotential === 'medium') score += 7;

    return Math.min(Math.max(score, 0), 100);
  }

  private generateTrendRecommendations(trends: any[]): string[] {
    const recommendations = [];

    const highScoreTrends = trends.filter((t) => t.score > 75);
    if (highScoreTrends.length > 0) {
      recommendations.push(
        `Capitalize on ${highScoreTrends.length} high-opportunity trends immediately`,
      );
    }

    const emergingTrends = trends.filter((t) => t.stage === 'emerging');
    if (emergingTrends.length > 0) {
      recommendations.push(
        `Monitor ${emergingTrends.length} emerging trends for early adoption advantage`,
      );
    }

    const decliningTrends = trends.filter((t) => t.stage === 'declining');
    if (decliningTrends.length > 0) {
      recommendations.push(`Avoid ${decliningTrends.length} declining trends`);
    }

    return recommendations;
  }

  private calculateHashtagMetrics(hashtags: string[], performanceData: any): any {
    if (!hashtags || hashtags.length === 0) {
      return { topPerforming: [], averageEngagement: 0 };
    }

    // Simple metrics calculation
    return {
      topPerforming: hashtags.slice(0, 10),
      averageEngagement: 0,
      totalUses: hashtags.length
      };
  }

  private calculateViralityScores(contentData: any[], threshold?: number): any {
    if (!contentData || contentData.length === 0) {
      return { viral: [], nonViral: [] };
    }

    const scored = contentData.map((content) => ({
      ...content,
      viralityScore: this.calculateViralityScore(content)
      }));

    const viralThreshold = threshold || 75;
    const viral = scored.filter((c) => c.viralityScore >= viralThreshold);
    const nonViral = scored.filter((c) => c.viralityScore < viralThreshold);

    return { viral, nonViral };
  }

  private calculateViralityScore(content: any): number {
    let score = 0;

    // Engagement rate
    const engagementRate = content.engagement / Math.max(content.reach, 1);
    score += Math.min(engagementRate * 100, 40);

    // Share rate
    const shareRate = (content.shares || 0) / Math.max(content.reach, 1);
    score += Math.min(shareRate * 200, 30);

    // Growth rate
    if (content.growthRate) {
      score += Math.min(content.growthRate, 30);
    }

    return Math.min(score, 100);
  }

  private generateLifecycleRecommendation(prediction: any): string {
    const stage = prediction.currentStage;

    if (stage === 'emerging') {
      return 'Act now to capitalize on early adoption advantage';
    } else if (stage === 'growth') {
      return 'Increase investment and content production';
    } else if (stage === 'peak') {
      return 'Maximize visibility while trend is at peak';
    } else if (stage === 'decline') {
      return 'Reduce investment and prepare for next trend';
    }

    return 'Monitor closely and wait for optimal timing';
  }

  private calculateOpportunityScores(opportunities: any[]): any[] {
    return opportunities.map((opp) => {
      const relevance = opp.relevance || 50;
      const engagement = opp.engagementPotential || 50;
      const competition = 100 - (opp.competitionLevel || 50);
      const resources = 100 - (opp.resourceRequirements || 50);
      const timing = opp.timingUrgency || 50;

      const overallScore =
        (relevance * 0.3 + engagement * 0.25 + competition * 0.2 + resources * 0.15 + timing * 0.1);

      return {
        ...opp,
        relevance,
        engagementPotential: engagement,
        competitionLevel: opp.competitionLevel || 50,
        resourceRequirements: opp.resourceRequirements || 50,
        timingUrgency: timing,
        overallScore: Math.round(overallScore)
      };
    });
  }

  private extractExecutiveSummary(text: string): string {
    const match = text.match(/Executive Summary[:\s]+(.*?)(?=\n\n|\n#|$)/is);
    return match ? match[1].trim() : text.substring(0, 300);
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
