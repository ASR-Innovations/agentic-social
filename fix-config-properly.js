const fs = require('fs');

const agentFiles = [
  'src/agentflow/agents/analytics.agent.ts',
  'src/agentflow/agents/competitor-analysis.agent.ts',
  'src/agentflow/agents/trend-detection.agent.ts',
  'src/agentflow/agents/strategy.agent.ts',
];

console.log('🔧 Fixing config parameters properly...\n');

agentFiles.forEach(filePath => {
  console.log(`Fixing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix: Remove config parameter from all private method signatures
  // Match: "task: AgentTask,\n    config: AgentConfig," and replace with just "task: AgentTask"
  content = content.replace(/task: AgentTask,\s*\n\s*config: AgentConfig,/g, 'task: AgentTask');
  
  // Also handle single-line version
  content = content.replace(/task: AgentTask,\s*config: AgentConfig,/g, 'task: AgentTask');
  
  // Write the fixed content back
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed ${filePath}`);
});

console.log('\n✅ All config parameters removed!');
