const fs = require('fs');
const path = require('path');

const agentsDir = path.join(__dirname, 'src/agentflow/agents');
const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.agent.ts'));

files.forEach(file => {
  const filePath = path.join(agentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace generateText({ with generateText(prompt, {
  // and remove the prompt, line
  content = content.replace(
    /provider\.generateText\(\{\s*prompt,\s*model:/g,
    'provider.generateText(prompt, {\n      model:'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed ${file}`);
});

console.log('Done!');
