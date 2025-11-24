import { Module } from '@nestjs/common';
import { WorkflowController } from './workflow.controller';
import { WorkflowService, DelegationService } from './services';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WorkflowController],
  providers: [WorkflowService, DelegationService],
  exports: [WorkflowService, DelegationService],
})
export class WorkflowModule {}
