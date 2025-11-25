import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { MemoryType } from '../interfaces/memory.interface';

@Entity('agent_memories')
@Index(['agentId', 'key'])
@Index(['agentId', 'type'])
@Index(['expiresAt'])
export class AgentMemoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  @Index()
  agentId: string;

  @Column({
    type: 'enum',
    enum: MemoryType,
  })
  type: MemoryType;

  @Column({ length: 255 })
  key: string;

  @Column({ type: 'jsonb' })
  value: any;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'float', nullable: true })
  relevanceScore: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ default: 0 })
  accessCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastAccessedAt: Date;
}
