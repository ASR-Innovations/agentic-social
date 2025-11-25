const fs = require('fs');
const path = require('path');

const agentsDir = path.join(__dirname, 'src/agentflow/agents');
const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.agent.ts'));

files.forEach(file => {
  const filePath = path.join(agentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace metadata: { tokensUsed: response.tokensUsed, cost: response.cost }
  // with proper metadata including duration, model, provider
  content = content.replace(
    /metadata:\s*\{\s*tokensUsed:\s*response\.tokensUsed,\s*cost:\s*response\.cost,?\s*\}/g,
    `metadata: {
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        duration: 0,
        model: response.model,
        provider: config.aiProvider,
      }`
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed metadata in ${file}`);
});

console.log('Done!');
