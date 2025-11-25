import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSetup1700000000000 implements MigrationInterface {
  name = 'InitialSetup1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================
    // TENANTS TABLE
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "tenants" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(255) NOT NULL,
        "planTier" character varying(50) NOT NULL DEFAULT 'free',
        "billingStatus" character varying(50) NOT NULL DEFAULT 'active',
        "settings" jsonb NOT NULL DEFAULT '{}',
        "aiBudgetLimit" numeric(10,2) NOT NULL DEFAULT '0.00',
        "aiUsageCurrent" numeric(10,2) NOT NULL DEFAULT '0.00',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tenants" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_planTier" CHECK ("planTier" IN ('free', 'starter', 'professional', 'business', 'enterprise'))
      )
    `);

    // ============================================
    // USERS TABLE
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenantId" uuid NOT NULL,
        "email" character varying(255) NOT NULL,
        "password" character varying(255) NOT NULL,
        "firstName" character varying(255),
        "lastName" character varying(255),
        "role" character varying(50) NOT NULL DEFAULT 'editor',
        "preferences" jsonb NOT NULL DEFAULT '{}',
        "isActive" boolean NOT NULL DEFAULT true,
        "lastLoginAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "CHK_role" CHECK ("role" IN ('admin', 'manager', 'editor', 'viewer')),
        CONSTRAINT "FK_users_tenantId" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE
      )
    `);

    // ============================================
    // SOCIAL ACCOUNTS TABLE
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "social_accounts" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenantId" uuid NOT NULL,
        "platform" character varying(50) NOT NULL,
        "accountIdentifier" character varying(255) NOT NULL,
        "displayName" character varying(255),
        "oauthTokensEncrypted" text NOT NULL,
        "refreshTokenEncrypted" text,
        "tokenExpiresAt" TIMESTAMP,
        "accountMetadata" jsonb NOT NULL DEFAULT '{}',
        "status" character varying(50) NOT NULL DEFAULT 'active',
        "lastSyncAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_social_accounts" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_social_accounts_tenant_platform_identifier" UNIQUE ("tenantId", "platform", "accountIdentifier"),
        CONSTRAINT "CHK_platform" CHECK ("platform" IN ('instagram', 'twitter', 'linkedin', 'facebook', 'tiktok', 'youtube', 'pinterest', 'threads', 'reddit')),
        CONSTRAINT "FK_social_accounts_tenantId" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE
      )
    `);

    // ============================================
    // POSTS TABLE
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "posts" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenantId" uuid NOT NULL,
        "createdBy" uuid NOT NULL,
        "title" character varying(255) NOT NULL,
        "content" text NOT NULL,
        "type" character varying(50) DEFAULT 'text',
        "status" character varying(50) DEFAULT 'draft',
        "mediaUrls" jsonb DEFAULT '[]',
        "mediaMetadata" jsonb DEFAULT '{}',
        "scheduledAt" TIMESTAMP,
        "publishedAt" TIMESTAMP,
        "aiGeneratedData" jsonb DEFAULT '{}',
        "aiModel" character varying(100),
        "metadata" jsonb DEFAULT '{}',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_posts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_posts_tenantId" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_posts_createdBy" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // ============================================
    // POST PLATFORMS TABLE
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "post_platforms" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "postId" uuid NOT NULL,
        "socialAccountId" uuid NOT NULL,
        "status" character varying(50) DEFAULT 'pending',
        "platformPostId" character varying(255),
        "platformPostUrl" text,
        "customContent" text,
        "platformSettings" jsonb DEFAULT '{}',
        "errorMessage" text,
        "retryCount" int DEFAULT 0,
        "publishedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_post_platforms" PRIMARY KEY ("id"),
        CONSTRAINT "FK_post_platforms_postId" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_post_platforms_socialAccountId" FOREIGN KEY ("socialAccountId") REFERENCES "social_accounts"("id") ON DELETE CASCADE
      )
    `);

    // ============================================
    // AI REQUESTS TABLE
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "ai_requests" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenantId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "type" character varying(100) NOT NULL,
        "status" character varying(50) DEFAULT 'pending',
        "model" character varying(100) NOT NULL,
        "input" jsonb NOT NULL,
        "output" jsonb,
        "tokensUsed" int DEFAULT 0,
        "costUsd" numeric(10,6) DEFAULT 0,
        "processingTimeMs" int,
        "errorMessage" text,
        "metadata" jsonb DEFAULT '{}',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ai_requests" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ai_requests_tenantId" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ai_requests_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // ============================================
    // ANALYTICS EVENTS TABLE
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "analytics_events" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenantId" uuid NOT NULL,
        "postId" uuid,
        "socialAccountId" uuid,
        "eventType" character varying(100) NOT NULL,
        "platform" character varying(50) NOT NULL,
        "value" int DEFAULT 0,
        "metadata" jsonb DEFAULT '{}',
        "recordedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_analytics_events" PRIMARY KEY ("id")
      )
    `);

    // ============================================
    // AGENT CONFIGS TABLE
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "agent_configs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenantId" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "type" character varying(50) NOT NULL,
        "aiProvider" character varying(50) NOT NULL DEFAULT 'deepseek',
        "model" character varying(100) NOT NULL DEFAULT 'deepseek-chat',
        "personalityConfig" jsonb NOT NULL DEFAULT '{}',
        "active" boolean NOT NULL DEFAULT true,
        "costBudget" numeric(10,2) NOT NULL DEFAULT '10.00',
        "fallbackProvider" character varying(50),
        "usageStats" jsonb NOT NULL DEFAULT '{}',
        "metadata" jsonb NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_agent_configs" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_agent_type" CHECK ("type" IN ('content_creator', 'strategy', 'engagement', 'analytics', 'trend_detection', 'competitor_analysis')),
        CONSTRAINT "CHK_ai_provider" CHECK ("aiProvider" IN ('deepseek', 'gemini', 'claude', 'openai')),
        CONSTRAINT "FK_agent_configs_tenantId" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE
      )
    `);

    // ============================================
    // AGENT MEMORY TABLE
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "agent_memory" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "agentId" uuid NOT NULL,
        "key" character varying(255) NOT NULL,
        "value" jsonb NOT NULL,
        "ttl" integer,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "expiresAt" TIMESTAMP,
        CONSTRAINT "PK_agent_memory" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_agent_memory_agent_key" UNIQUE ("agentId", "key"),
        CONSTRAINT "FK_agent_memory_agentId" FOREIGN KEY ("agentId") REFERENCES "agent_configs"("id") ON DELETE CASCADE
      )
    `);

    // ============================================
    // ROW LEVEL SECURITY (Multi-tenant isolation)
    // ============================================
    await queryRunner.query(`ALTER TABLE "users" ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`ALTER TABLE "social_accounts" ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`ALTER TABLE "posts" ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`ALTER TABLE "agent_configs" ENABLE ROW LEVEL SECURITY`);

    // Create RLS policies
    await queryRunner.query(`
      CREATE POLICY tenant_isolation_users ON "users"
      USING ("tenantId" = current_setting('app.current_tenant_id', true)::uuid)
    `);

    await queryRunner.query(`
      CREATE POLICY tenant_isolation_social_accounts ON "social_accounts"
      USING ("tenantId" = current_setting('app.current_tenant_id', true)::uuid)
    `);

    await queryRunner.query(`
      CREATE POLICY tenant_isolation_posts ON "posts"
      USING ("tenantId" = current_setting('app.current_tenant_id', true)::uuid)
    `);

    await queryRunner.query(`
      CREATE POLICY tenant_isolation_agent_configs ON "agent_configs"
      USING ("tenantId" = current_setting('app.current_tenant_id', true)::uuid)
    `);

    // ============================================
    // INDEXES FOR PERFORMANCE
    // ============================================
    // Tenants
    await queryRunner.query(`CREATE INDEX "IDX_tenants_planTier" ON "tenants" ("planTier")`);

    // Users
    await queryRunner.query(`CREATE INDEX "IDX_users_tenantId" ON "users" ("tenantId")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);

    // Social Accounts
    await queryRunner.query(`CREATE INDEX "IDX_social_accounts_tenantId" ON "social_accounts" ("tenantId")`);
    await queryRunner.query(`CREATE INDEX "IDX_social_accounts_platform" ON "social_accounts" ("platform")`);

    // Posts
    await queryRunner.query(`CREATE INDEX "IDX_posts_tenant_status" ON "posts" ("tenantId", "status")`);
    await queryRunner.query(`CREATE INDEX "IDX_posts_scheduled_at" ON "posts" ("scheduledAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_posts_created_at" ON "posts" ("createdAt")`);

    // Post Platforms
    await queryRunner.query(`CREATE INDEX "IDX_post_platforms_post_id" ON "post_platforms" ("postId")`);
    await queryRunner.query(`CREATE INDEX "IDX_post_platforms_social_account" ON "post_platforms" ("socialAccountId")`);
    await queryRunner.query(`CREATE INDEX "IDX_post_platforms_status" ON "post_platforms" ("status")`);

    // AI Requests
    await queryRunner.query(`CREATE INDEX "IDX_ai_requests_tenant_type" ON "ai_requests" ("tenantId", "type")`);
    await queryRunner.query(`CREATE INDEX "IDX_ai_requests_status" ON "ai_requests" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_ai_requests_created_at" ON "ai_requests" ("createdAt")`);

    // Analytics
    await queryRunner.query(`CREATE INDEX "IDX_analytics_tenant_type_recorded" ON "analytics_events" ("tenantId", "eventType", "recordedAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_analytics_post_recorded" ON "analytics_events" ("postId", "recordedAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_analytics_social_account" ON "analytics_events" ("socialAccountId")`);
    await queryRunner.query(`CREATE INDEX "IDX_analytics_platform" ON "analytics_events" ("platform")`);

    // Agent Configs
    await queryRunner.query(`CREATE INDEX "IDX_agent_configs_tenantId" ON "agent_configs" ("tenantId")`);
    await queryRunner.query(`CREATE INDEX "IDX_agent_configs_type" ON "agent_configs" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_agent_configs_active" ON "agent_configs" ("active")`);

    // Agent Memory
    await queryRunner.query(`CREATE INDEX "IDX_agent_memory_agentId" ON "agent_memory" ("agentId")`);
    await queryRunner.query(`CREATE INDEX "IDX_agent_memory_expiresAt" ON "agent_memory" ("expiresAt")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all tables in reverse order (respecting foreign keys)
    await queryRunner.query(`DROP TABLE IF EXISTS "agent_memory" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "agent_configs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "analytics_events" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ai_requests" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "post_platforms" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "posts" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "social_accounts" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tenants" CASCADE`);
  }
}
