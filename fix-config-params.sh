#!/bin/bash

# Fix config parameter in all agent files
for file in src/agentflow/agents/analytics.agent.ts src/agentflow/agents/competitor-analysis.agent.ts src/agentflow/agents/trend-detection.agent.ts src/agentflow/agents/strategy.agent.ts; do
  echo "Fixing $file..."
  
  # Remove config parameter from private method signatures
  sed -i '' 's/task: AgentTask,\s*config: AgentConfig,/task: AgentTask,/g' "$file"
  
  # Remove trailing comma after task parameter
  sed -i '' 's/task: AgentTask,\s*)/task: AgentTask)/g' "$file"
done

echo "✅ Fixed all config parameters"
