import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { AgentType } from '../interfaces/agent.interface';
import { AIProviderType } from '../../ai/providers/ai-provider.interface';

@Entity('agent_configs')
@Index(['tenantId', 'type'])
@Index(['tenantId', 'active'])
export class AgentConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  tenantId: string;

  @Column('uuid', { nullable: true })
  @Index()
  socialAccountId: string | null;

  @Column({ length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: AgentType,
  })
  type: AgentType;

  @Column({
    type: 'enum',
    enum: AIProviderType,
    default: AIProviderType.DEEPSEEK,
  })
  aiProvider: AIProviderType;

  @Column({ length: 100 })
  model: string;

  @Column({
    type: 'jsonb',
    default: {},
  })
  personalityConfig: {
    tone?: string;
    style?: string;
    brandVoice?: string;
    creativity?: number;
    formality?: number;
    humor?: number;
  };

  @Column({ default: true })
  active: boolean;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 10.0,
  })
  costBudget: number;

  @Column({
    type: 'enum',
    enum: AIProviderType,
    nullable: true,
  })
  fallbackProvider: AIProviderType;

  @Column({
    type: 'jsonb',
    default: {},
  })
  usageStats: {
    totalTasks?: number;
    successfulTasks?: number;
    failedTasks?: number;
    totalCost?: number;
    averageDuration?: number;
    lastUsedAt?: Date;
  };

  @Column({
    type: 'jsonb',
    default: {},
  })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
