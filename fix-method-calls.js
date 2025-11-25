const fs = require('fs');

const agentFiles = [
  'src/agentflow/agents/analytics.agent.ts',
  'src/agentflow/agents/competitor-analysis.agent.ts',
  'src/agentflow/agents/trend-detection.agent.ts',
  'src/agentflow/agents/strategy.agent.ts',
];

console.log('🔧 Fixing method calls...\n');

agentFiles.forEach(filePath => {
  console.log(`Fixing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix: Remove config argument from method calls
  // Pattern: method(task, config) or method({...}, config)
  content = content.replace(/,\s*\n\s*config,?\s*\n\s*\)/g, '\n    )');
  content = content.replace(/,\s*config\s*\)/g, ')');
  
  // Write the fixed content back
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed ${filePath}`);
});

console.log('\n✅ All method calls fixed!');
