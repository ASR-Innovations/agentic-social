const fs = require('fs');

const agentFiles = [
  'src/agentflow/agents/analytics.agent.ts',
  'src/agentflow/agents/competitor-analysis.agent.ts',
  'src/agentflow/agents/trend-detection.agent.ts',
  'src/agentflow/agents/strategy.agent.ts',
];

console.log('🔧 Fixing remaining errors...\n');

agentFiles.forEach(filePath => {
  console.log(`Fixing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix 1: Replace all instances of ", config)" with ")"
  content = content.replace(/,\s*config\)/g, ')');
  
  // Fix 2: Add startTime to methods that use it but don't declare it
  // Find all methods that have "Date.now() - startTime" but no "const startTime"
  const methodRegex = /(private async \w+\([^)]*\): Promise<AgentResult> \{)([^]*?)(?=private async|\}$)/g;
  
  content = content.replace(methodRegex, (match, methodStart, methodBody) => {
    // Check if this method uses startTime but doesn't declare it
    if (methodBody.includes('startTime') && !methodBody.includes('const startTime')) {
      return methodStart + '\n    const startTime = Date.now();' + methodBody;
    }
    return match;
  });
  
  // Write the fixed content back
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed ${filePath}`);
});

console.log('\n✅ All remaining errors fixed!');
