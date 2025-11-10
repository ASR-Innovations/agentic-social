import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('analytics_events')
@Index(['tenantId', 'eventType', 'recordedAt'])
@Index(['postId', 'recordedAt'])
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid', nullable: true })
  postId: string;

  @Column({ type: 'uuid', nullable: true })
  socialAccountId: string;

  @Column({ type: 'varchar', length: 100 })
  eventType: string; // impressions, likes, comments, shares, clicks, etc.

  @Column({ type: 'varchar', length: 50 })
  platform: string;

  @Column({ type: 'int', default: 0 })
  value: number;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  recordedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
