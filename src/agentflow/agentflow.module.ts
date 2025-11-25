import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentConfigEntity } from './entities/agent-config.entity';
import { AgentMemoryEntity } from './entities/agent-memory.entity';
import { AgentFlowService } from './agentflow.service';
import { AgentFlowController } from './agentflow.controller';
import { OrchestratorService } from './orchestrator/orchestrator.service';
import { WorkflowBuilder } from './orchestrator/workflow.builder';
import { ModelRouterService } from './router/model-router.service';
import { CostOptimizerService } from './router/cost-optimizer.service';
import { AgentMemoryService } from './memory/agent-memory.service';
import { ContextStreamService } from './memory/context-stream.service';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentConfigEntity, AgentMemoryEntity]),
    AIModule,
  ],
  controllers: [AgentFlowController],
  providers: [
    AgentFlowService,
    OrchestratorService,
    WorkflowBuilder,
    ModelRouterService,
    CostOptimizerService,
    AgentMemoryService,
    ContextStreamService,
  ],
  exports: [
    AgentFlowService,
    OrchestratorService,
    AgentMemoryService,
    ModelRouterService,
    CostOptimizerService,
  ],
})
export class AgentFlowModule {}
