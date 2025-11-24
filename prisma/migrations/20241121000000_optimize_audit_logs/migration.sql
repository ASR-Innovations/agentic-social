-- Optimize audit log queries with additional indexes
-- This migration adds indexes to improve audit log query performance

-- Add composite index for common query patterns
CREATE INDEX IF NOT EXISTS "security_audit_logs_workspace_action_timestamp_idx" 
ON "security_audit_logs"("workspace_id", "action", "timestamp" DESC);

-- Add composite index for user activity queries
CREATE INDEX IF NOT EXISTS "security_audit_logs_workspace_user_timestamp_idx" 
ON "security_audit_logs"("workspace_id", "user_id", "timestamp" DESC);

-- Add composite index for resource queries
CREATE INDEX IF NOT EXISTS "security_audit_logs_workspace_resource_idx" 
ON "security_audit_logs"("workspace_id", "resource_type", "resource_id");

-- Add index for severity-based queries
CREATE INDEX IF NOT EXISTS "security_audit_logs_workspace_severity_timestamp_idx" 
ON "security_audit_logs"("workspace_id", "severity", "timestamp" DESC);

-- Add index for status-based queries
CREATE INDEX IF NOT EXISTS "security_audit_logs_workspace_status_timestamp_idx" 
ON "security_audit_logs"("workspace_id", "status", "timestamp" DESC);

-- Add index for IP address tracking (security monitoring)
CREATE INDEX IF NOT EXISTS "security_audit_logs_ip_address_timestamp_idx" 
ON "security_audit_logs"("ip_address", "timestamp" DESC);

-- Add partial index for failed operations (most critical for security)
CREATE INDEX IF NOT EXISTS "security_audit_logs_failed_operations_idx" 
ON "security_audit_logs"("workspace_id", "timestamp" DESC) 
WHERE "status" = 'failure';

-- Add partial index for critical severity events
CREATE INDEX IF NOT EXISTS "security_audit_logs_critical_events_idx" 
ON "security_audit_logs"("workspace_id", "timestamp" DESC) 
WHERE "severity" = 'critical';

-- Comment on table
COMMENT ON TABLE "security_audit_logs" IS 'Tamper-proof audit trail with SHA-256 hash verification. Supports 7-year retention for compliance (SOC 2, GDPR, HIPAA).';

-- Comment on columns
COMMENT ON COLUMN "security_audit_logs"."details" IS 'JSON field containing audit details and tamper-proof hash (_hash field)';
COMMENT ON COLUMN "security_audit_logs"."severity" IS 'Severity level: info, warning, error, critical';
COMMENT ON COLUMN "security_audit_logs"."status" IS 'Operation status: success, failure, blocked, pending';
