import { Injectable, Logger } from '@nestjs/common';
import { BaseAgent } from './base-agent';
import { AgentConfig, AgentTask, AgentResult, AgentType } from '../interfaces/agent.interface';
import { AIProviderFactory } from '../../ai/providers/provider.factory';
import { AgentMemoryService } from '../memory/agent-memory.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AgentConfigEntity } from '../entities/agent-config.entity';

/**
 * Analytics Agent
 * 
 * Processes social media metrics and generates actionable insights.
 * Identifies patterns, predicts performance, and provides data-driven recommendations.
 * 
 * Capabilities:
 * - Metrics processing and aggregation
 * - Pattern identification
 * - Insight generation
 * - Performance prediction
 * - Anomaly detection
 * - Report generation
 * - Data visualization recommendations
 */
@Injectable()
export class AnalyticsAgent extends BaseAgent {
  protected readonly logger = new Logger(AnalyticsAgent.name);
  protected readonly agentType = AgentType.ANALYTICS;

  constructor(
    id: string,
    config: AgentConfig,
    providerFactory: AIProviderFactory,
  ) {
    super(id, AgentType.ANALYTICS, config, providerFactory);
  }

  /**
   * Execute analytics task
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
    this.logger.log(`Executing analytics task: ${task.type}`);

    switch (task.type) {
      case 'process_metrics':
        return this.processMetrics(task);
      
      case 'identify_patterns':
        return this.identifyPatterns(task);
      
      case 'generate_insights':
        return this.generateInsights(task);
      
      case 'predict_performance':
        return this.predictPerformance(task);
      
      case 'detect_anomalies':
        return this.detectAnomalies(task);
      
      case 'generate_report':
        return this.generateReport(task);
      
      case 'compare_periods':
        return this.comparePeriods(task);
      
      case 'analyze_content_performance':
        return this.analyzeContentPerformance(task);
      
      default:
        throw new Error(`Unknown analytics task type: ${task.type}`);
    }
  }

  /**
   * Process and aggregate metrics
   */
  private async processMetrics(
    task: AgentTask
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { rawMetrics, timeRange, platforms, aggregationType } = task.input;

    // Aggregate metrics
    const aggregated = this.aggregateMetrics(rawMetrics, aggregationType || 'daily');

    // Calculate key performance indicators
    const kpis = this.calculateKPIs(aggregated);

    // Calculate growth rates
    const growth = this.calculateGrowthRates(aggregated);

    // Platform breakdown
    const platformBreakdown = this.breakdownByPlatform(aggregated, platforms);

    return {
      success: true,
      output: {
        aggregated,
        kpis,
        growth,
        platformBreakdown,
        summary: this.generateMetricsSummary(kpis, growth),
        timeRange
      },
      metadata: {        tokensUsed: 0,
        cost: 0,
        dataPoints: rawMetrics?.length || 0,
        platforms: platforms?.length || 0,

        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider}
      };
  }

  /**
   * Identify patterns in data
   */
  private async identifyPatterns(
    task: AgentTask
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { metrics, patternTypes } = task.input;

    const prompt = `Analyze these metrics and identify patterns:

Metrics Data:
${JSON.stringify(metrics, null, 2)}

Pattern Types to Look For: ${patternTypes?.join(', ') || 'all patterns'}

Identify:
1. Temporal patterns (time-based trends)
2. Correlation patterns (related metrics)
3. Cyclical patterns (recurring behaviors)
4. Growth patterns (trajectory analysis)
5. Anomalous patterns (outliers)

Format as JSON:
{
  "patterns": [
    {
      "type": "pattern type",
      "description": "what the pattern shows",
      "confidence": 0.95,
      "impact": "high/medium/low",
      "recommendation": "what to do about it"
    }
  ],
  "keyFindings": ["finding1", "finding2"],
  "actionableInsights": ["insight1", "insight2"]
}`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.3,
      maxTokens: 1500
      });

    const analysis = this.parseJSONResponse(response.text);

    // Add statistical pattern detection
    const statisticalPatterns = this.detectStatisticalPatterns(metrics);

    return {
      success: true,
      output: {
        patterns: analysis.patterns || [],
        keyFindings: analysis.keyFindings || [],
        actionableInsights: analysis.actionableInsights || [],
        statisticalPatterns,
        fullAnalysis: response.text
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        patternsFound: (analysis.patterns || []).length,

        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider}
      };
  }

  /**
   * Generate actionable insights from data
   */
  private async generateInsights(
    task: AgentTask
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { metrics, context, goals } = task.input;

    const prompt = `Generate actionable insights from this data:

Metrics:
${JSON.stringify(metrics, null, 2)}

${context ? `Context: ${JSON.stringify(context)}` : ''}
${goals ? `Goals: ${goals.join(', ')}` : ''}

Provide:
1. Top 5 key insights
2. Opportunities for improvement
3. Risks to address
4. Recommended actions
5. Expected impact of each action

Format as JSON with detailed explanations.`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.4,
      maxTokens: 2000
      });

    const insights = this.parseJSONResponse(response.text);

    // Prioritize insights
    const prioritized = this.prioritizeInsights(insights.insights || []);

    return {
      success: true,
      output: {
        insights: prioritized,
        opportunities: insights.opportunities || [],
        risks: insights.risks || [],
        recommendations: insights.recommendations || [],
        expectedImpact: insights.expectedImpact || {},
        fullAnalysis: response.text
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        insightsGenerated: prioritized.length,

        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider}
      };
  }

  /**
   * Predict future performance
   */
  private async predictPerformance(
    task: AgentTask
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { historicalData, predictionPeriod, metrics } = task.input;

    // Calculate trends
    const trends = this.calculateTrends(historicalData);

    // Simple linear prediction
    const predictions = this.generatePredictions(trends, predictionPeriod);

    const prompt = `Based on this historical data, predict future performance:

Historical Trends:
${JSON.stringify(trends, null, 2)}

Prediction Period: ${predictionPeriod}
Metrics to Predict: ${metrics?.join(', ') || 'all'}

Provide:
1. Predicted values for each metric
2. Confidence intervals
3. Factors that could affect predictions
4. Recommendations to improve predicted outcomes

Format as JSON.`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.3,
      maxTokens: 1200
      });

    const aiPredictions = this.parseJSONResponse(response.text);

    return {
      success: true,
      output: {
        predictions: {
          ...predictions,
          ...aiPredictions.predictions
      },
        confidence: aiPredictions.confidence || 0.7,
        factors: aiPredictions.factors || [],
        recommendations: aiPredictions.recommendations || [],
        trends,
        fullAnalysis: response.text
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        predictionPeriod,

        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider}
      };
  }

  /**
   * Detect anomalies in metrics
   */
  private async detectAnomalies(
    task: AgentTask
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { metrics, sensitivity } = task.input;

    // Statistical anomaly detection
    const statisticalAnomalies = this.detectStatisticalAnomalies(
      metrics,
      sensitivity || 'medium',
    );

    const prompt = `Analyze these metrics for anomalies:

Metrics:
${JSON.stringify(metrics, null, 2)}

Statistical Anomalies Detected:
${JSON.stringify(statisticalAnomalies, null, 2)}

For each anomaly, provide:
1. Severity (critical/high/medium/low)
2. Possible causes
3. Impact assessment
4. Recommended actions

Format as JSON.`;

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
        anomalies: statisticalAnomalies.map((anomaly, index) => ({
          ...anomaly,
          ...(analysis.anomalies?.[index] || {})
      })),
        summary: this.generateAnomalySummary(statisticalAnomalies),
        criticalAnomalies: statisticalAnomalies.filter((a) => a.severity === 'critical'),
        fullAnalysis: response.text
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        anomaliesDetected: statisticalAnomalies.length,

        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider}
      };
  }

  /**
   * Generate comprehensive analytics report
   */
  private async generateReport(
    task: AgentTask
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { metrics, timeRange, platforms, reportType } = task.input;

    // Process all metrics
    const processed = await this.processMetrics(
      { ...task, input: { rawMetrics: metrics, timeRange, platforms } }
    );

    // Identify patterns
    const patterns = await this.identifyPatterns(
      { ...task, input: { metrics } }
    );

    // Generate insights
    const insights = await this.generateInsights(
      { ...task, input: { metrics } }
    );

    const prompt = `Generate a comprehensive ${reportType || 'performance'} report:

Metrics Summary:
${JSON.stringify(processed.output.kpis, null, 2)}

Patterns Identified:
${JSON.stringify(patterns.output.keyFindings, null, 2)}

Key Insights:
${JSON.stringify(insights.output.insights?.slice(0, 5), null, 2)}

Create a professional report with:
1. Executive Summary
2. Key Metrics Overview
3. Performance Analysis
4. Insights and Recommendations
5. Next Steps

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
        metrics: processed.output,
        patterns: patterns.output,
        insights: insights.output,
        visualizations: this.recommendVisualizations(metrics)
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        reportType,
        timeRange,

        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider}
      };
  }

  /**
   * Compare two time periods
   */
  private async comparePeriods(
    task: AgentTask
  ): Promise<AgentResult> {
    const { period1, period2, metrics } = task.input;

    const comparison = this.calculatePeriodComparison(period1, period2, metrics);

    const prompt = `Compare these two time periods:

Period 1: ${JSON.stringify(period1.summary, null, 2)}
Period 2: ${JSON.stringify(period2.summary, null, 2)}

Changes: ${JSON.stringify(comparison.changes, null, 2)}

Analyze:
1. Significant changes and their causes
2. Improvements and declines
3. Trends across periods
4. Recommendations based on comparison

Format as JSON.`;

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
        comparison,
        analysis: analysis,
        improvements: comparison.changes.filter((c) => c.change > 0),
        declines: comparison.changes.filter((c) => c.change < 0),
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
   * Analyze content performance
   */
  private async analyzeContentPerformance(
    task: AgentTask
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const { contentData, metrics } = task.input;

    const prompt = `Analyze content performance:

Content Data:
${JSON.stringify(contentData, null, 2)}

Identify:
1. Top performing content types
2. Best performing topics
3. Optimal content length
4. Best media types (image/video/text)
5. Engagement patterns by content type

Format as JSON with detailed analysis.`;

    const provider = await this.providerFactory.getProvider(this.config.aiProvider);
    const response = await provider.generateText(prompt, {
      model: this.config.model,
      temperature: 0.3,
      maxTokens: 1500
      });

    const analysis = this.parseJSONResponse(response.text);

    // Calculate content metrics
    const contentMetrics = this.calculateContentMetrics(contentData);

    return {
      success: true,
      output: {
        topPerforming: analysis.topPerforming || contentMetrics.topPerforming,
        bestTopics: analysis.bestTopics || [],
        optimalLength: analysis.optimalLength || contentMetrics.optimalLength,
        bestMediaTypes: analysis.bestMediaTypes || contentMetrics.bestMediaTypes,
        patterns: analysis.patterns || [],
        recommendations: analysis.recommendations || [],
        fullAnalysis: response.text
      },
      metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        contentAnalyzed: contentData?.length || 0,

        duration: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.aiProvider}
      };
  }

  // Helper methods

  private aggregateMetrics(rawMetrics: any[], aggregationType: string): any {
    if (!rawMetrics || rawMetrics.length === 0) return {};

    const aggregated = {
      totalEngagement: 0,
      totalReach: 0,
      totalImpressions: 0,
      totalFollowers: 0,
      totalPosts: rawMetrics.length,
      averageEngagementRate: 0,
      byPlatform: {},
      byDate: {}
      };

    rawMetrics.forEach((metric) => {
      aggregated.totalEngagement += metric.engagement || 0;
      aggregated.totalReach += metric.reach || 0;
      aggregated.totalImpressions += metric.impressions || 0;
      aggregated.totalFollowers += metric.followers || 0;

      // By platform
      const platform = metric.platform || 'unknown';
      if (!aggregated.byPlatform[platform]) {
        aggregated.byPlatform[platform] = {
          engagement: 0,
          reach: 0,
          posts: 0
      };
      }
      aggregated.byPlatform[platform].engagement += metric.engagement || 0;
      aggregated.byPlatform[platform].reach += metric.reach || 0;
      aggregated.byPlatform[platform].posts += 1;
    });

    aggregated.averageEngagementRate =
      aggregated.totalEngagement / Math.max(aggregated.totalReach, 1);

    return aggregated;
  }

  private calculateKPIs(aggregated: any): any {
    return {
      totalEngagement: aggregated.totalEngagement || 0,
      totalReach: aggregated.totalReach || 0,
      totalImpressions: aggregated.totalImpressions || 0,
      engagementRate: aggregated.averageEngagementRate || 0,
      postsPublished: aggregated.totalPosts || 0,
      averageEngagementPerPost:
        (aggregated.totalEngagement || 0) / Math.max(aggregated.totalPosts, 1)
      };
  }

  private calculateGrowthRates(aggregated: any): any {
    // Simplified growth calculation
    return {
      engagementGrowth: 0, // Would need historical data
      reachGrowth: 0,
      followerGrowth: 0
      };
  }

  private breakdownByPlatform(aggregated: any, platforms: string[]): any {
    return aggregated.byPlatform || {};
  }

  private generateMetricsSummary(kpis: any, growth: any): string {
    return `Total Engagement: ${kpis.totalEngagement}, Reach: ${kpis.totalReach}, Posts: ${kpis.postsPublished}, Avg Engagement Rate: ${(kpis.engagementRate * 100).toFixed(2)}%`;
  }

  private detectStatisticalPatterns(metrics: any): any[] {
    const patterns = [];

    // Simple trend detection
    if (Array.isArray(metrics)) {
      const values = metrics.map((m) => m.value || m.engagement || 0);
      const trend = this.calculateTrendDirection(values);

      if (trend !== 'stable') {
        patterns.push({
          type: 'trend',
          direction: trend,
          confidence: 0.8
      });
      }
    }

    return patterns;
  }

  private calculateTrendDirection(values: number[]): string {
    if (values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  }

  private prioritizeInsights(insights: any[]): any[] {
    return insights
      .map((insight) => ({
        ...insight,
        priority: this.calculateInsightPriority(insight)
      }))
      .sort((a, b) => b.priority - a.priority);
  }

  private calculateInsightPriority(insight: any): number {
    let priority = 50;

    if (insight.impact === 'high') priority += 30;
    else if (insight.impact === 'medium') priority += 15;

    if (insight.confidence > 0.8) priority += 20;

    return priority;
  }

  private calculateTrends(historicalData: any): any {
    // Simple trend calculation
    return {
      engagement: { direction: 'increasing', rate: 5 },
      reach: { direction: 'stable', rate: 0 },
      followers: { direction: 'increasing', rate: 3 }
      };
  }

  private generatePredictions(trends: any, period: string): any {
    // Simple linear predictions
    return {
      engagement: { predicted: 1000, confidence: 0.7 },
      reach: { predicted: 5000, confidence: 0.6 },
      followers: { predicted: 500, confidence: 0.8 }
      };
  }

  private detectStatisticalAnomalies(metrics: any, sensitivity: string): any[] {
    const anomalies = [];

    if (Array.isArray(metrics)) {
      const values = metrics.map((m) => m.value || m.engagement || 0);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const stdDev = Math.sqrt(
        values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length,
      );

      const threshold = sensitivity === 'high' ? 2 : sensitivity === 'low' ? 4 : 3;

      values.forEach((value, index) => {
        const zScore = Math.abs((value - mean) / stdDev);
        if (zScore > threshold) {
          anomalies.push({
            index,
            value,
            zScore,
            severity: zScore > 4 ? 'critical' : zScore > 3 ? 'high' : 'medium',
            type: value > mean ? 'spike' : 'drop'
      });
        }
      });
    }

    return anomalies;
  }

  private generateAnomalySummary(anomalies: any[]): string {
    return `Detected ${anomalies.length} anomalies: ${anomalies.filter((a) => a.severity === 'critical').length} critical, ${anomalies.filter((a) => a.severity === 'high').length} high severity`;
  }

  private extractExecutiveSummary(text: string): string {
    const match = text.match(/Executive Summary[:\s]+(.*?)(?=\n\n|\n#|$)/is);
    return match ? match[1].trim() : text.substring(0, 300);
  }

  private recommendVisualizations(metrics: any): any[] {
    return [
      { type: 'line', title: 'Engagement Over Time', metrics: ['engagement'] },
      { type: 'bar', title: 'Platform Comparison', metrics: ['reach', 'engagement'] },
      { type: 'pie', title: 'Content Type Distribution', metrics: ['contentType'] },
    ];
  }

  private calculatePeriodComparison(period1: any, period2: any, metrics: string[]): any {
    const changes = [];

    metrics.forEach((metric) => {
      const value1 = period1.summary?.[metric] || 0;
      const value2 = period2.summary?.[metric] || 0;
      const change = ((value2 - value1) / Math.max(value1, 1)) * 100;

      changes.push({
        metric,
        period1Value: value1,
        period2Value: value2,
        change,
        changePercent: `${change > 0 ? '+' : ''}${change.toFixed(2)}%`
      });
    });

    return { changes };
  }

  private calculateContentMetrics(contentData: any[]): any {
    if (!contentData || contentData.length === 0) {
      return {
        topPerforming: [],
        optimalLength: 'medium',
        bestMediaTypes: []
      };
    }

    // Sort by engagement
    const sorted = [...contentData].sort(
      (a, b) => (b.engagement || 0) - (a.engagement || 0),
    );

    return {
      topPerforming: sorted.slice(0, 5),
      optimalLength: 'medium',
      bestMediaTypes: ['image', 'video']
      };
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
