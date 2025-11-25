#!/bin/bash

# Fix StrategyAgent - remove config parameter from all methods
sed -i '' 's/async analyzePerformance(task: AgentTask, config: AgentConfig)/async analyzePerformance(task: AgentTask)/g' src/agentflow/agents/strategy.agent.ts
sed -i '' 's/async recommendContentThemes(task: AgentTask, config: AgentConfig)/async recommendContentThemes(task: AgentTask)/g' src/agentflow/agents/strategy.agent.ts
sed -i '' 's/async calculateOptimalPostingTimes(task: AgentTask, config: AgentConfig)/async calculateOptimalPostingTimes(task: AgentTask)/g' src/agentflow/agents/strategy.agent.ts
sed -i '' 's/async analyzeTrends(task: AgentTask, config: AgentConfig)/async analyzeTrends(task: AgentTask)/g' src/agentflow/agents/strategy.agent.ts
sed -i '' 's/async analyzeAudience(task: AgentTask, config: AgentConfig)/async analyzeAudience(task: AgentTask)/g' src/agentflow/agents/strategy.agent.ts
sed -i '' 's/async generateStrategyReport(task: AgentTask, config: AgentConfig)/async generateStrategyReport(task: AgentTask)/g' src/agentflow/agents/strategy.agent.ts
sed -i '' 's/async benchmarkCompetitors(task: AgentTask, config: AgentConfig)/async benchmarkCompetitors(task: AgentTask)/g' src/agentflow/agents/strategy.agent.ts

# Replace config.aiProvider with this.config.aiProvider
sed -i '' 's/config\.aiProvider/this.config.aiProvider/g' src/agentflow/agents/strategy.agent.ts
sed -i '' 's/config\.model/this.config.model/g' src/agentflow/agents/strategy.agent.ts

# Fix TrendDetectionAgent
sed -i '' 's/async detectTrends(task: AgentTask, config: AgentConfig)/async detectTrends(task: AgentTask)/g' src/agentflow/agents/trend-detection.agent.ts
sed -i '' 's/async analyzeHashtags(task: AgentTask, config: AgentConfig)/async analyzeHashtags(task: AgentTask)/g' src/agentflow/agents/trend-detection.agent.ts
sed -i '' 's/async identifyViralContent(task: AgentTask, config: AgentConfig)/async identifyViralContent(task: AgentTask)/g' src/agentflow/agents/trend-detection.agent.ts
sed -i '' 's/async predictTrends(task: AgentTask, config: AgentConfig)/async predictTrends(task: AgentTask)/g' src/agentflow/agents/trend-detection.agent.ts
sed -i '' 's/async scoreOpportunities(task: AgentTask, config: AgentConfig)/async scoreOpportunities(task: AgentTask)/g' src/agentflow/agents/trend-detection.agent.ts
sed -i '' 's/async monitorTrends(task: AgentTask, config: AgentConfig)/async monitorTrends(task: AgentTask)/g' src/agentflow/agents/trend-detection.agent.ts

sed -i '' 's/config\.aiProvider/this.config.aiProvider/g' src/agentflow/agents/trend-detection.agent.ts
sed -i '' 's/config\.model/this.config.model/g' src/agentflow/agents/trend-detection.agent.ts

echo "Agent fixes applied!"
