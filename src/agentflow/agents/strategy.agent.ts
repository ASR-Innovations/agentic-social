import { Injectable, Logger } from '@nestjs/common';
import { BaseAgent } from './base-agent';
import { AgentConfig, AgentTask, AgentResult, AgentType } from '../interfaces/agent.interface';
import { AIProviderFactory } from '../../ai/providers/provider.factory';
import { AgentMemoryService } from '../memory/agent-memory.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AgentConfigEntity } from '../entities/agent-config.entity';

/**
 * Strategy Agent
 * 
 * Analyzes social media performance data and provides strategic recommendations
 * for content optimization, posting schedules, and audience engagement.
 * 
 * Capabilities:
 * - Performance analysis across platforms
 * - Content theme recommendations
 * - Optimal posting time calculation
 * - Trend correlation and prediction
 * - Audience behavior analysis
 * - Competitive benchmarking
 */
@Injectable()
export class StrategyAgent extends BaseAgent {
  protected readonly logger = new Logger(StrategyAgent.name);

  constructor(
    id: string,
    config: AgentConfig,
    providerFactory: AIProviderFactory,
  ) {
    super(id, AgentType.STRATEGY, config, providerFactory);
    this.logger.log('Strategy Agent initialized');
  }

  get capabilities() {
    return [
      {
        name: 'analyze_performance',
        description: 'Analyze social media performance and provide insights',
        requiredInputs: ['metrics', 'timeRange'],
        outputs: ['insights', 'recommendations']
      },
      {
        name: 'recommend_themes',
        description: 'Recommend content themes based on performance data',
        requiredInputs: ['performanceData'],
        outputs: ['themes', 'priorities']
      },
    ];
  }

  /**
   * Execute strategy analysis task
   */
  async execute(task: AgentTask): Promise<AgentResult> {
    this.logger.log(`Executing strategy task: ${task.type}`);

    switch (task.type) {
      case 'analyze_performance':
        return this.analyzePerformance(task);
      
      case 'recommend_themes':
        return this.recommendContentThemes(task);
      
      case 'calculate_optimal_times':
        return this.calculateOptimalPostingTimes(task);
      
      case 'analyze_trends':
        return this.analyzeTrends(task);
      
      case 'analyze_audience':
        return this.analyzeAudience(task);
      
      case 'generate_strategy_report':
        return this.generateStrategyReport(task);
      
      case 'benchmark_competitors':
        return this.benchmarkCompetitors(task);
      
      default:
        throw new Error(`Unknown strategy task type: ${task.type}`);
    }
  }

  /**
   * Analyze performance data and provide insights
   */
  private async analyzePerformance(
    task: AgentTask
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { performanceData, platforms, timeRange } = task.input;

    // Build analysis prompt
    const prompt = this.buildPerformanceAnalysisPrompt(performanceData, platforms, timeRange);

    // Get AI provider
    const provider = await this.providerFactory.getProvider(this.config.aiProvider);

    // Generate analysis
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.3, // Lower temperature for analytical tasks
      maxTokens: 2000
      });

    // Parse insights from response
    const insights = this.parsePerformanceInsights(response.text);

    return {
      success: true,
      output: {
        analysis: response.text,
        insights,
        metrics: this.calculateKeyMetrics(performanceData),
        recommendations: insights.recommendations || [],
        trends: insights.trends || []
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        provider: this.config.aiProvider,
        model: this.config.model,

        duration: Date.now() - startTime}
      };
  }

  /**
   * Recommend content themes based on performance and trends
   */
  private async recommendContentThemes(
    task: AgentTask
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { performanceData, industry, targetAudience, currentThemes } = task.input;

    const prompt = `As a social media strategist, analyze the following data and recommend content themes:

Performance Data:
${JSON.stringify(performanceData, null, 2)}

Industry: ${industry}
Target Audience: ${targetAudience}
Current Themes: ${currentThemes?.join(', ') || 'None'}

Provide:
1. Top 5 recommended content themes with rationale
2. Content pillars to focus on
3. Topics to avoid or reduce
4. Seasonal opportunities
5. Engagement predictions for each theme

Format as JSON with structure:
{
  "themes": [
    {
      "name": "theme name",
      "rationale": "why this theme",
      "expectedEngagement": "high/medium/low",
      "platforms": ["platform1", "platform2"],
      "frequency": "how often to post"
    }
  ],
  "contentPillars": ["pillar1", "pillar2"],
  "avoid": ["topic1", "topic2"],
  "seasonalOpportunities": [...]
}`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.5,
      maxTokens: 1500
      });

    const recommendations = this.parseJSONResponse(response.text);

    return {
      success: true,
      output: {
        themes: recommendations.themes || [],
        contentPillars: recommendations.contentPillars || [],
        avoid: recommendations.avoid || [],
        seasonalOpportunities: recommendations.seasonalOpportunities || [],
        fullAnalysis: response.text
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        provider: this.config.aiProvider,

        duration: Date.now() - startTime,
        model: this.config.model}
      };
  }

  /**
   * Calculate optimal posting times based on historical data
   */
  private async calculateOptimalPostingTimes(
    task: AgentTask
  ): Promise<AgentResult> {
    const { engagementData, platforms, timezone } = task.input;

    // Analyze engagement patterns
    const timeAnalysis = this.analyzeEngagementByTime(engagementData);

    const prompt = `Analyze this engagement data and recommend optimal posting times:

Engagement by Hour: ${JSON.stringify(timeAnalysis.byHour, null, 2)}
Engagement by Day: ${JSON.stringify(timeAnalysis.byDay, null, 2)}
Platforms: ${platforms.join(', ')}
Timezone: ${timezone}

Provide:
1. Best posting times for each platform
2. Best days of the week
3. Times to avoid
4. Posting frequency recommendations
5. Rationale for each recommendation

Format as JSON.`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.3,
      maxTokens: 1200
      });

    const schedule = this.parseJSONResponse(response.text);

    return {
      success: true,
      output: {
        optimalTimes: schedule.optimalTimes || timeAnalysis.topTimes,
        bestDays: schedule.bestDays || timeAnalysis.topDays,
        avoidTimes: schedule.avoidTimes || [],
        frequency: schedule.frequency || {},
        schedule: this.generatePostingSchedule(schedule, platforms),
        analysis: response.text
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
   * Analyze trends and correlate with performance
   */
  private async analyzeTrends(
    task: AgentTask
  ): Promise<AgentResult> {
    const { trendData, performanceData, industry } = task.input;

    const prompt = `Analyze these trends and their correlation with performance:

Trending Topics: ${JSON.stringify(trendData, null, 2)}
Performance Data: ${JSON.stringify(performanceData, null, 2)}
Industry: ${industry}

Identify:
1. Which trends correlate with high engagement
2. Emerging trends to capitalize on
3. Declining trends to avoid
4. Trend lifecycle predictions
5. Actionable recommendations

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
        highPerformingTrends: analysis.highPerformingTrends || [],
        emergingTrends: analysis.emergingTrends || [],
        decliningTrends: analysis.decliningTrends || [],
        predictions: analysis.predictions || [],
        recommendations: analysis.recommendations || [],
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
   * Analyze audience behavior and preferences
   */
  private async analyzeAudience(
    task: AgentTask
  ): Promise<AgentResult> {
    const { audienceData, engagementData, demographics } = task.input;

    const prompt = `Analyze audience behavior and provide insights:

Audience Data: ${JSON.stringify(audienceData, null, 2)}
Engagement Patterns: ${JSON.stringify(engagementData, null, 2)}
Demographics: ${JSON.stringify(demographics, null, 2)}

Provide:
1. Audience segments and characteristics
2. Content preferences by segment
3. Engagement patterns
4. Growth opportunities
5. Retention strategies

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
        segments: analysis.segments || [],
        preferences: analysis.preferences || {},
        patterns: analysis.patterns || [],
        opportunities: analysis.opportunities || [],
        strategies: analysis.strategies || [],
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
   * Generate comprehensive strategy report
   */
  private async generateStrategyReport(
    task: AgentTask
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { 
      performanceData, 
      audienceData, 
      competitorData, 
      timeRange,
      platforms 
    } = task.input;

    const prompt = `Generate a comprehensive social media strategy report:

Performance Summary: ${JSON.stringify(performanceData, null, 2)}
Audience Insights: ${JSON.stringify(audienceData, null, 2)}
Competitor Analysis: ${JSON.stringify(competitorData, null, 2)}
Time Range: ${timeRange}
Platforms: ${platforms.join(', ')}

Include:
1. Executive Summary
2. Performance Analysis
3. Audience Insights
4. Competitive Position
5. Strategic Recommendations
6. Action Plan
7. KPIs to Track

Format as a structured report.`;

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
        summary: this.extractExecutiveSummary(response.text),
        recommendations: this.extractRecommendations(response.text),
        actionPlan: this.extractActionPlan(response.text),
        kpis: this.extractKPIs(response.text)
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        generatedAt: new Date().toISOString(),

        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider}
      };
  }

  /**
   * Benchmark against competitors
   */
  private async benchmarkCompetitors(
    task: AgentTask
  ): Promise<AgentResult> {
    const { yourData, competitorData, metrics } = task.input;

    const prompt = `Benchmark performance against competitors:

Your Performance: ${JSON.stringify(yourData, null, 2)}
Competitor Data: ${JSON.stringify(competitorData, null, 2)}
Metrics to Compare: ${metrics.join(', ')}

Provide:
1. Comparative analysis for each metric
2. Strengths and weaknesses
3. Gaps and opportunities
4. Best practices from competitors
5. Recommendations to improve position

Format as JSON.`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.3,
      maxTokens: 1800
      });

    const analysis = this.parseJSONResponse(response.text);

    return {
      success: true,
      output: {
        comparison: analysis.comparison || {},
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        opportunities: analysis.opportunities || [],
        bestPractices: analysis.bestPractices || [],
        recommendations: analysis.recommendations || [],
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

  // Helper methods

  private buildPerformanceAnalysisPrompt(
    performanceData: any,
    platforms: string[],
    timeRange: string,
  ): string {
    return `Analyze this social media performance data and provide strategic insights:

Performance Data:
${JSON.stringify(performanceData, null, 2)}

Platforms: ${platforms.join(', ')}
Time Range: ${timeRange}

Provide a comprehensive analysis including:
1. Overall performance summary
2. Platform-specific insights
3. Top performing content types
4. Engagement trends
5. Areas for improvement
6. Strategic recommendations

Format your response as JSON with the following structure:
{
  "summary": "overall summary",
  "insights": [
    {
      "category": "category name",
      "finding": "key finding",
      "impact": "high/medium/low",
      "recommendation": "what to do"
    }
  ],
  "recommendations": ["rec1", "rec2"],
  "trends": ["trend1", "trend2"]
}`;
  }

  private parsePerformanceInsights(text: string): any {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.warn('Failed to parse JSON insights, using text analysis');
    }

    // Fallback: extract insights from text
    return {
      summary: text.substring(0, 200),
      insights: [],
      recommendations: this.extractRecommendations(text),
      trends: []
      };
  }

  private calculateKeyMetrics(performanceData: any): any {
    if (!performanceData) return {};

    return {
      totalEngagement: performanceData.totalEngagement || 0,
      averageEngagementRate: performanceData.averageEngagementRate || 0,
      followerGrowth: performanceData.followerGrowth || 0,
      topPerformingPlatform: performanceData.topPerformingPlatform || 'N/A',
      contentPerformance: performanceData.contentPerformance || {}
      };
  }

  private analyzeEngagementByTime(engagementData: any): any {
    // Analyze engagement patterns by hour and day
    const byHour = {};
    const byDay = {};

    if (engagementData && Array.isArray(engagementData)) {
      engagementData.forEach((item) => {
        const hour = new Date(item.timestamp).getHours();
        const day = new Date(item.timestamp).getDay();

        byHour[hour] = (byHour[hour] || 0) + (item.engagement || 0);
        byDay[day] = (byDay[day] || 0) + (item.engagement || 0);
      });
    }

    // Find top times
    const topTimes = Object.entries(byHour)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([hour]) => `${hour}:00`);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const topDays = Object.entries(byDay)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([day]) => dayNames[parseInt(day)]);

    return { byHour, byDay, topTimes, topDays };
  }

  private generatePostingSchedule(schedule: any, platforms: string[]): any {
    const weeklySchedule = {};

    platforms.forEach((platform) => {
      weeklySchedule[platform] = {
        monday: schedule.optimalTimes?.slice(0, 2) || ['9:00', '15:00'],
        tuesday: schedule.optimalTimes?.slice(0, 2) || ['9:00', '15:00'],
        wednesday: schedule.optimalTimes?.slice(0, 2) || ['9:00', '15:00'],
        thursday: schedule.optimalTimes?.slice(0, 2) || ['9:00', '15:00'],
        friday: schedule.optimalTimes?.slice(0, 2) || ['9:00', '15:00'],
        saturday: schedule.optimalTimes?.slice(0, 1) || ['10:00'],
        sunday: schedule.optimalTimes?.slice(0, 1) || ['10:00']
      };
    });

    return weeklySchedule;
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

  private extractExecutiveSummary(text: string): string {
    const summaryMatch = text.match(/Executive Summary[:\s]+(.*?)(?=\n\n|\n#|$)/is);
    return summaryMatch ? summaryMatch[1].trim() : text.substring(0, 300);
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
    const actionMatch = text.match(/Action Plan[:\s]+(.*?)(?=\n\n|\n#|$)/is);
    if (actionMatch) {
      return actionMatch[1]
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .map((line) => line.replace(/^[-*]\s/, '').trim());
    }
    return [];
  }

  private extractKPIs(text: string): string[] {
    const kpiMatch = text.match(/KPIs?[:\s]+(.*?)(?=\n\n|\n#|$)/is);
    if (kpiMatch) {
      return kpiMatch[1]
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .map((line) => line.replace(/^[-*]\s/, '').trim());
    }
    return [];
  }
}
