const fs = require('fs');

// Agent files to fix
const agentFiles = [
  'src/agentflow/agents/analytics.agent.ts',
  'src/agentflow/agents/competitor-analysis.agent.ts',
  'src/agentflow/agents/trend-detection.agent.ts',
  'src/agentflow/agents/strategy.agent.ts',
];

console.log('🔧 Fixing agent errors properly...\n');

agentFiles.forEach(filePath => {
  console.log(`Fixing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix 1: Fix the broken import statement
  content = content.replace(
    /import \{ AgentConfigEntity \} from '\.\.\/entities\/agent-this\.config\.entity';/g,
    "import { AgentConfigEntity } from '../entities/agent-config.entity';"
  );
  
  // Fix 2: Remove trailing commas before closing braces in metadata
  content = content.replace(/,\s*\n\s*\}/g, '\n      }');
  
  // Fix 3: Add tokensUsed and cost to metadata objects that are missing them
  content = content.replace(
    /metadata: \{([^}]*?)\}/gs,
    (match, metadataContent) => {
      // Check if tokensUsed is missing
      if (!metadataContent.includes('tokensUsed:')) {
        metadataContent = '        tokensUsed: 0,\n        cost: 0,' + metadataContent;
      }
      return `metadata: {${metadataContent}}`;
    }
  );
  
  // Write the fixed content back
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed ${filePath}`);
});

console.log('\n✅ All agents fixed!');
