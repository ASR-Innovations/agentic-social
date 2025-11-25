const fs = require('fs');

const agentFiles = [
  'src/agentflow/agents/analytics.agent.ts',
  'src/agentflow/agents/competitor-analysis.agent.ts',
  'src/agentflow/agents/trend-detection.agent.ts',
  'src/agentflow/agents/strategy.agent.ts',
];

console.log('🔧 Fixing metadata syntax errors...\n');

agentFiles.forEach(filePath => {
  console.log(`Fixing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix: Remove lines that are just a comma
  content = content.replace(/^\s*,\s*$/gm, '');
  
  // Fix: Remove comma before closing brace
  content = content.replace(/,(\s*\n\s*})/g, '$1');
  
  // Fix: Remove double commas
  content = content.replace(/,,/g, ',');
  
  // Write the fixed content back
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed ${filePath}`);
});

console.log('\n✅ All metadata syntax errors fixed!');
