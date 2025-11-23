import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { User } from '../../user/entities/user.entity';

export enum AIRequestType {
  CAPTION_GENERATION = 'caption_generation',
  CONTENT_GENERATION = 'content_generation',
  IMAGE_GENERATION = 'image_generation',
  HASHTAG_GENERATION = 'hashtag_generation',
  CONTENT_IMPROVEMENT = 'content_improvement',
  CONTENT_TRANSLATION = 'content_translation',
  SENTIMENT_ANALYSIS = 'sentiment_analysis',
}

export enum AIRequestStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('ai_requests')
export class AIRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: AIRequestType,
  })
  type: AIRequestType;

  @Column({
    type: 'enum',
    enum: AIRequestStatus,
    default: AIRequestStatus.PENDING,
  })
  status: AIRequestStatus;

  @Column({ type: 'varchar', length: 100 })
  model: string;

  @Column({ type: 'jsonb' })
  input: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  output: Record<string, any>;

  @Column({ type: 'int', default: 0 })
  tokensUsed: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0 })
  costUsd: number;

  @Column({ type: 'int', nullable: true })
  processingTimeMs: number;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
