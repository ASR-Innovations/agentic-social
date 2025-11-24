-- Add security-related tables for advanced security features

-- IP Whitelist table
CREATE TABLE "ip_whitelists" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ip_whitelists_pkey" PRIMARY KEY ("id")
);

-- Two-Factor Authentication table
CREATE TABLE "two_factor_auth" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backup_codes" TEXT[],
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "two_factor_auth_pkey" PRIMARY KEY ("id")
);

-- Session Management table
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT,
    "device_info" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_activity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- Security Audit Log table
CREATE TABLE "security_audit_logs" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT,
    "status" TEXT NOT NULL,
    "details" JSONB,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_audit_logs_pkey" PRIMARY KEY ("id")
);

-- Security Scan Results table
CREATE TABLE "security_scan_results" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "scan_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "findings" JSONB,
    "severity_counts" JSONB,
    "started_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_scan_results_pkey" PRIMARY KEY ("id")
);

-- Data Encryption Keys table (for encryption at rest)
CREATE TABLE "encryption_keys" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "key_type" TEXT NOT NULL,
    "encrypted_key" TEXT NOT NULL,
    "key_version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "rotated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "encryption_keys_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "ip_whitelists_workspace_id_idx" ON "ip_whitelists"("workspace_id");
CREATE INDEX "ip_whitelists_ip_address_idx" ON "ip_whitelists"("ip_address");
CREATE UNIQUE INDEX "two_factor_auth_user_id_key" ON "two_factor_auth"("user_id");
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions"("user_id");
CREATE UNIQUE INDEX "user_sessions_session_token_key" ON "user_sessions"("session_token");
CREATE INDEX "user_sessions_expires_at_idx" ON "user_sessions"("expires_at");
CREATE INDEX "security_audit_logs_workspace_id_idx" ON "security_audit_logs"("workspace_id");
CREATE INDEX "security_audit_logs_user_id_idx" ON "security_audit_logs"("user_id");
CREATE INDEX "security_audit_logs_timestamp_idx" ON "security_audit_logs"("timestamp");
CREATE INDEX "security_audit_logs_action_idx" ON "security_audit_logs"("action");
CREATE INDEX "security_scan_results_workspace_id_idx" ON "security_scan_results"("workspace_id");
CREATE INDEX "encryption_keys_workspace_id_idx" ON "encryption_keys"("workspace_id");

-- Add foreign key constraints
ALTER TABLE "ip_whitelists" ADD CONSTRAINT "ip_whitelists_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ip_whitelists" ADD CONSTRAINT "ip_whitelists_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "two_factor_auth" ADD CONSTRAINT "two_factor_auth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "security_audit_logs" ADD CONSTRAINT "security_audit_logs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "security_audit_logs" ADD CONSTRAINT "security_audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "security_scan_results" ADD CONSTRAINT "security_scan_results_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "encryption_keys" ADD CONSTRAINT "encryption_keys_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
