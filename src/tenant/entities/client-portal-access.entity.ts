import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';

export enum ClientPortalAccessLevel {
  VIEW_ONLY = 'VIEW_ONLY',
  VIEW_AND_COMMENT = 'VIEW_AND_COMMENT',
  VIEW_AND_APPROVE = 'VIEW_AND_APPROVE',
}

@Entity('client_portal_access')
export class ClientPortalAccess {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column()
  workspaceId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Tenant;

  @Column({
    type: 'enum',
    enum: ClientPortalAccessLevel,
    default: ClientPortalAccessLevel.VIEW_ONLY,
  })
  accessLevel: ClientPortalAccessLevel;

  @Column({ type: 'simple-array', nullable: true })
  permissions: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  inviteToken: string;

  @Column({ type: 'timestamp', nullable: true })
  inviteExpiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastAccessAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
