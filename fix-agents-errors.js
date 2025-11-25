const fs = require('fs');
const path = require('path');

// Agent files to fix
const agentFiles = [
  'src/agentflow/agents/analytics.agent.ts',
  'src/agentflow/agents/competitor-analysis.agent.ts',
  'src/agentflow/agents/trend-detection.agent.ts',
  'src/agentflow/agents/strategy.agent.ts',
];

console.log('🔧 Fixing agent TypeScript errors...\n');

agentFiles.forEach(filePath => {
  console.log(`Fixing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix 1: Add capabilities getter if missing
  if (!content.includes('get capabilities()')) {
    const insertPoint = content.indexOf('async executeTask');
    if (insertPoint > 0) {
      const capabilitiesCode = `
  get capabilities() {
    return [
      {
        name: 'execute_task',
        description: 'Execute agent-specific tasks',
        requiredInputs: ['type', 'input'],
        outputs: ['result'],
      },
    ];
  }

  `;
      content = content.slice(0, insertPoint) + capabilitiesCode + content.slice(insertPoint);
    }
  }
  
  // Fix 2: Add execute method if missing
  if (!content.includes('async execute(task: AgentTask)')) {
    const insertPoint = content.indexOf('async executeTask');
    if (insertPoint > 0) {
      const executeCode = `
  async execute(task: AgentTask): Promise<AgentResult> {
    return this.executeTask(task, this.config);
  }

  `;
      content = content.slice(0, insertPoint) + executeCode + content.slice(insertPoint);
    }
  }
  
  // Fix 3: Fix constructor - remove extra parameters and use proper signature
  content = content.replace(
    /constructor\(\s*@InjectRepository\(AgentConfigEntity\)\s*protected readonly configRepository: Repository<AgentConfigEntity>,\s*protected readonly providerFactory: AIProviderFactory,\s*protected readonly memoryService: AgentMemoryService,\s*\) \{\s*super\(configRepository, providerFactory, memoryService\);/g,
    `constructor(
    id: string,
    config: AgentConfig,
    providerFactory: AIProviderFactory,
  ) {
    super(id, AgentType.ANALYTICS, config, providerFactory);`
  );
  
  // Fix 4: Add startTime to all methods that return AgentResult
  const methodsNeedingStartTime = [
    'processMetrics',
    'identifyPatterns',
    'generateInsights',
    'predictPerformance',
    'detectAnomalies',
    'generateReport',
    'analyzeContent',
    'trackCompetitors',
    'analyzeStrategy',
    'identifyGaps',
    'benchmarkPerformance',
    'generateCompetitiveReport',
    'detectTrends',
    'analyzeHashtags',
    'identifyViralContent',
    'predictTrendLifecycle',
    'scoreOpportunities',
    'generateTrendReport',
    'generateStrategy',
    'optimizePostingSchedule',
    'generateContentCalendar',
  ];
  
  methodsNeedingStartTime.forEach(method => {
    // Add startTime at the beginning of the method
    const regex = new RegExp(`(private async ${method}\\([^)]*\\): Promise<AgentResult> \\{)`, 'g');
    content = content.replace(regex, `$1\n    const startTime = Date.now();`);
  });
  
  // Fix 5: Add missing metadata fields
  // Replace metadata objects that are missing duration, model, or provider
  content = content.replace(
    /metadata: \{([^}]*)\}/g,
    (match, metadataContent) => {
      if (!metadataContent.includes('duration:')) {
        metadataContent += ',\n        duration: Date.now() - startTime';
      }
      if (!metadataContent.includes('model:')) {
        metadataContent += ',\n        model: this.config.model';
      }
      if (!metadataContent.includes('provider:')) {
        metadataContent += ',\n        provider: this.config.aiProvider';
      }
      return `metadata: {${metadataContent}}`;
    }
  );
  
  // Fix 6: Replace 'config.' with 'this.config.'
  content = content.replace(/([^.])config\./g, '$1this.config.');
  
  // Write the fixed content back
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed ${filePath}`);
});

console.log('\n✅ All agents fixed!');
console.log('Run "npm run build" to verify the fixes.');
