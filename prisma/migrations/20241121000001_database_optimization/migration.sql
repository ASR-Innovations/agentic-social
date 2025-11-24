-- Database Optimization Migration
-- This migration adds comprehensive indexes, materialized views, and partitioning for performance optimization
-- Requirements: 31.2, 31.3

-- ============================================
-- Additional Indexes for Query Optimization
-- ============================================

-- User indexes for authentication and authorization queries
CREATE INDEX IF NOT EXISTS idx_users_sso_provider_id ON users(sso_provider, sso_provider_id) WHERE sso_provider IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_role_workspace ON users(role, workspace_id);

-- Workspace indexes for multi-tenant queries
CREATE INDEX IF NOT EXISTS idx_workspaces_plan ON workspaces(plan);
CREATE INDEX IF NOT EXISTS idx_workspaces_created_at ON workspaces(created_at DESC);

-- Social Account indexes for platform operations
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform_active ON social_accounts(platform, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_social_accounts_token_expiry ON social_accounts(token_expiry) WHERE token_expiry IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_social_accounts_workspace_platform ON social_accounts(workspace_id, platform);

-- Post indexes for content management and analytics
CREATE INDEX IF NOT EXISTS idx_posts_workspace_status_scheduled ON posts(workspace_id, status, scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_campaign_status ON posts(campaign_id, status) WHERE campaign_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_ai_generated ON posts(ai_generated, workspace_id) WHERE ai_generated = true;
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);

-- Platform Post indexes for publishing operations
CREATE INDEX IF NOT EXISTS idx_platform_posts_status ON platform_posts(publish_status);
CREATE INDEX IF NOT EXISTS idx_platform_posts_platform_status ON platform_posts(platform, publish_status);
CREATE INDEX IF NOT EXISTS idx_platform_posts_published_at ON platform_posts(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_platform_posts_platform_post_id ON platform_posts(platform_post_id) WHERE platform_post_id IS NOT NULL;

-- Media Asset indexes for media library
CREATE INDEX IF NOT EXISTS idx_media_assets_workspace_type ON media_assets(workspace_id, type);
CREATE INDEX IF NOT EXISTS idx_media_assets_folder ON media_assets(workspace_id, folder) WHERE folder IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_media_assets_tags ON media_assets USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_assets_created_at ON media_assets(created_at DESC);

-- Campaign indexes for campaign management
CREATE INDEX IF NOT EXISTS idx_campaigns_workspace_status_dates ON campaigns(workspace_id, status, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_tags ON campaigns USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns(start_date, end_date);

-- Conversation indexes for inbox management
CREATE INDEX IF NOT EXISTS idx_conversations_workspace_status_priority ON conversations(workspace_id, status, priority);
CREATE INDEX IF NOT EXISTS idx_conversations_sentiment ON conversations(workspace_id, sentiment);
CREATE INDEX IF NOT EXISTS idx_conversations_sla_deadline ON conversations(sla_deadline) WHERE sla_deadline IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_platform_type ON conversations(platform, type);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_tags ON conversations USING GIN(tags);

-- Message indexes for conversation history
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_direction ON messages(direction);
CREATE INDEX IF NOT EXISTS idx_messages_ai_generated ON messages(ai_generated) WHERE ai_generated = true;
CREATE INDEX IF NOT EXISTS idx_messages_template_id ON messages(template_id) WHERE template_id IS NOT NULL;

-- Saved Reply indexes for template management
CREATE INDEX IF NOT EXISTS idx_saved_replies_workspace_category ON saved_replies(workspace_id, category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_saved_replies_usage ON saved_replies(usage_count DESC, last_used_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_replies_tags ON saved_replies USING GIN(tags);

-- SLA Config indexes for SLA management
CREATE INDEX IF NOT EXISTS idx_sla_configs_workspace_active ON sla_configs(workspace_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sla_configs_priority_platform ON sla_configs(priority, platform);

-- SLA Tracking indexes for performance monitoring
CREATE INDEX IF NOT EXISTS idx_sla_tracking_conversation ON sla_tracking(conversation_id);
CREATE INDEX IF NOT EXISTS idx_sla_tracking_status ON sla_tracking(first_response_status, resolution_status);
CREATE INDEX IF NOT EXISTS idx_sla_tracking_breached ON sla_tracking(first_response_breached, resolution_breached);
CREATE INDEX IF NOT EXISTS idx_sla_tracking_escalated ON sla_tracking(escalated, escalated_at) WHERE escalated = true;

-- Brand Voice indexes
CREATE INDEX IF NOT EXISTS idx_brand_voices_workspace_default ON brand_voices(workspace_id, is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_brand_voices_active ON brand_voices(workspace_id, is_active) WHERE is_active = true;

-- Report Template indexes
CREATE INDEX IF NOT EXISTS idx_report_templates_workspace_public ON report_templates(workspace_id, is_public);
CREATE INDEX IF NOT EXISTS idx_report_templates_tags ON report_templates USING GIN(tags);

-- Generated Report indexes for report history
CREATE INDEX IF NOT EXISTS idx_generated_reports_workspace_dates ON generated_reports(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_reports_template_dates ON generated_reports(template_id, created_at DESC);

-- Scheduled Report indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_active_next_run ON scheduled_reports(is_active, next_run_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_workspace_active ON scheduled_reports(workspace_id, is_active);

-- Competitor indexes
CREATE INDEX IF NOT EXISTS idx_competitors_workspace_active ON competitors(workspace_id, is_active) WHERE is_active = true;

-- Listening Query indexes
CREATE INDEX IF NOT EXISTS idx_listening_queries_workspace_active ON listening_queries(workspace_id, is_active) WHERE is_active = true;

-- Listening Mention indexes for social listening (time-series data)
CREATE INDEX IF NOT EXISTS idx_listening_mentions_query_published ON listening_mentions(query_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_listening_mentions_workspace_published ON listening_mentions(workspace_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_listening_mentions_platform_published ON listening_mentions(platform, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_listening_mentions_sentiment_published ON listening_mentions(sentiment, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_listening_mentions_tags ON listening_mentions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_listening_mentions_influencer ON listening_mentions(is_influencer, published_at DESC) WHERE is_influencer = true;

-- Listening Alert indexes
CREATE INDEX IF NOT EXISTS idx_listening_alerts_workspace_status ON listening_alerts(workspace_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listening_alerts_query_status ON listening_alerts(query_id, status);
CREATE INDEX IF NOT EXISTS idx_listening_alerts_severity ON listening_alerts(severity, created_at DESC);

-- Influencer indexes
CREATE INDEX IF NOT EXISTS idx_influencers_workspace_status ON influencers(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_influencers_score ON influencers(overall_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_influencers_tags ON influencers USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_influencers_niche ON influencers USING GIN(niche);

-- Influencer Account indexes
CREATE INDEX IF NOT EXISTS idx_influencer_accounts_platform ON influencer_accounts(platform, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_influencer_accounts_engagement ON influencer_accounts(engagement_rate DESC);
CREATE INDEX IF NOT EXISTS idx_influencer_accounts_followers ON influencer_accounts(followers DESC);

-- Influencer Collaboration indexes
CREATE INDEX IF NOT EXISTS idx_influencer_collaborations_influencer_status ON influencer_collaborations(influencer_id, status);
CREATE INDEX IF NOT EXISTS idx_influencer_collaborations_campaign_status ON influencer_collaborations(campaign_id, status) WHERE campaign_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_influencer_collaborations_dates ON influencer_collaborations(start_date, end_date);

-- Influencer Campaign indexes
CREATE INDEX IF NOT EXISTS idx_influencer_campaigns_workspace_status ON influencer_campaigns(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_influencer_campaigns_dates ON influencer_campaigns(start_date, end_date);

-- Workflow indexes
CREATE INDEX IF NOT EXISTS idx_workflows_workspace_active ON workflows(workspace_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_workflows_type ON workflows(type);

-- Workflow Instance indexes
CREATE INDEX IF NOT EXISTS idx_workflow_instances_workflow_status ON workflow_instances(workflow_id, status);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_entity ON workflow_instances(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_created_at ON workflow_instances(created_at DESC);

-- Workflow Approval indexes
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_instance_status ON workflow_approvals(instance_id, status);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_approver_status ON workflow_approvals(approver_id, status);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_due_date ON workflow_approvals(due_date) WHERE due_date IS NOT NULL;

-- Employee Advocacy indexes
CREATE INDEX IF NOT EXISTS idx_employee_profiles_workspace_active ON employee_profiles(workspace_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_employee_profiles_points ON employee_profiles(points DESC);

-- Advocacy Content indexes
CREATE INDEX IF NOT EXISTS idx_advocacy_content_workspace_status ON advocacy_content(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_advocacy_content_published_at ON advocacy_content(published_at DESC) WHERE published_at IS NOT NULL;

-- Advocacy Share indexes
CREATE INDEX IF NOT EXISTS idx_advocacy_shares_content_employee ON advocacy_shares(content_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_advocacy_shares_shared_at ON advocacy_shares(shared_at DESC);

-- Ad Campaign indexes
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_workspace_status ON ad_campaigns(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_platform ON ad_campaigns(platform);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_dates ON ad_campaigns(start_date, end_date);

-- Integration indexes
CREATE INDEX IF NOT EXISTS idx_integrations_workspace_provider ON integrations(workspace_id, provider);
CREATE INDEX IF NOT EXISTS idx_integrations_active ON integrations(is_active) WHERE is_active = true;

-- Webhook indexes
CREATE INDEX IF NOT EXISTS idx_webhooks_workspace_active ON webhooks(workspace_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_webhooks_events ON webhooks USING GIN(events);

-- API Key indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_workspace_active ON api_keys(workspace_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);

-- Security indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_active ON user_sessions(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_ip_whitelists_workspace_active ON ip_whitelists(workspace_id, is_active) WHERE is_active = true;

-- Audit log indexes (time-series data)
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_workspace_timestamp ON security_audit_logs(workspace_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_timestamp ON security_audit_logs(user_id, timestamp DESC) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_action ON security_audit_logs(action, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_severity ON security_audit_logs(severity, timestamp DESC);

-- Compliance indexes
CREATE INDEX IF NOT EXISTS idx_data_export_requests_workspace_status ON data_export_requests(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_workspace_status ON data_deletion_requests(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_consent_records_user_type ON consent_records(user_id, consent_type);

-- ============================================
-- Composite Indexes for Complex Queries
-- ============================================

-- Dashboard analytics queries
CREATE INDEX IF NOT EXISTS idx_posts_workspace_published_campaign ON posts(workspace_id, published_at DESC, campaign_id) WHERE published_at IS NOT NULL;

-- Inbox filtering and sorting
CREATE INDEX IF NOT EXISTS idx_conversations_workspace_filters ON conversations(workspace_id, status, priority, sentiment, updated_at DESC);

-- Scheduled post processing
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_processing ON posts(status, scheduled_at) WHERE status = 'SCHEDULED' AND scheduled_at <= NOW();

-- SLA breach monitoring
CREATE INDEX IF NOT EXISTS idx_conversations_sla_monitoring ON conversations(workspace_id, status, sla_deadline) WHERE status IN ('OPEN', 'PENDING') AND sla_deadline IS NOT NULL;

-- Listening mention analysis
CREATE INDEX IF NOT EXISTS idx_listening_mentions_analysis ON listening_mentions(workspace_id, sentiment, published_at DESC, is_influencer);

-- Campaign performance tracking
CREATE INDEX IF NOT EXISTS idx_posts_campaign_performance ON posts(campaign_id, published_at DESC, status) WHERE campaign_id IS NOT NULL AND status = 'PUBLISHED';

-- ============================================
-- Materialized Views for Analytics
-- ============================================

-- Daily post performance aggregation
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_post_metrics AS
SELECT 
    p.workspace_id,
    p.id as post_id,
    p.campaign_id,
    DATE(p.published_at) as date,
    p.platform_posts::jsonb as platforms,
    COUNT(DISTINCT pp.id) as platform_count,
    p.ai_generated,
    p.tags
FROM posts p
LEFT JOIN platform_posts pp ON p.id = pp.post_id
WHERE p.published_at IS NOT NULL
GROUP BY p.workspace_id, p.id, p.campaign_id, DATE(p.published_at), p.platform_posts, p.ai_generated, p.tags;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_daily_post_metrics_pk ON mv_daily_post_metrics(post_id, date);
CREATE INDEX IF NOT EXISTS idx_mv_daily_post_metrics_workspace_date ON mv_daily_post_metrics(workspace_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_mv_daily_post_metrics_campaign ON mv_daily_post_metrics(campaign_id, date DESC) WHERE campaign_id IS NOT NULL;

-- Daily workspace activity summary
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_workspace_activity AS
SELECT 
    workspace_id,
    DATE(created_at) as date,
    COUNT(*) FILTER (WHERE status = 'PUBLISHED') as posts_published,
    COUNT(*) FILTER (WHERE status = 'SCHEDULED') as posts_scheduled,
    COUNT(*) FILTER (WHERE status = 'DRAFT') as posts_draft,
    COUNT(*) FILTER (WHERE ai_generated = true) as ai_generated_posts
FROM posts
GROUP BY workspace_id, DATE(created_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_daily_workspace_activity_pk ON mv_daily_workspace_activity(workspace_id, date);
CREATE INDEX IF NOT EXISTS idx_mv_daily_workspace_activity_date ON mv_daily_workspace_activity(date DESC);

-- Conversation response time metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_conversation_metrics AS
SELECT 
    c.workspace_id,
    c.account_id,
    c.platform,
    DATE(c.created_at) as date,
    COUNT(*) as total_conversations,
    COUNT(*) FILTER (WHERE c.status = 'RESOLVED') as resolved_conversations,
    COUNT(*) FILTER (WHERE c.status = 'OPEN') as open_conversations,
    AVG(CASE 
        WHEN c.status = 'RESOLVED' 
        THEN EXTRACT(EPOCH FROM (c.updated_at - c.created_at))/60 
    END) as avg_resolution_time_minutes,
    COUNT(*) FILTER (WHERE c.sentiment = 'POSITIVE') as positive_sentiment,
    COUNT(*) FILTER (WHERE c.sentiment = 'NEGATIVE') as negative_sentiment,
    COUNT(*) FILTER (WHERE c.sentiment = 'NEUTRAL') as neutral_sentiment
FROM conversations c
GROUP BY c.workspace_id, c.account_id, c.platform, DATE(c.created_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_conversation_metrics_pk ON mv_conversation_metrics(workspace_id, account_id, platform, date);
CREATE INDEX IF NOT EXISTS idx_mv_conversation_metrics_workspace_date ON mv_conversation_metrics(workspace_id, date DESC);

-- Listening mention sentiment trends
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_listening_sentiment_trends AS
SELECT 
    lm.workspace_id,
    lm.query_id,
    lm.platform,
    DATE(lm.published_at) as date,
    COUNT(*) as total_mentions,
    COUNT(*) FILTER (WHERE lm.sentiment = 'POSITIVE') as positive_mentions,
    COUNT(*) FILTER (WHERE lm.sentiment = 'NEGATIVE') as negative_mentions,
    COUNT(*) FILTER (WHERE lm.sentiment = 'NEUTRAL') as neutral_mentions,
    AVG(lm.sentiment_score) as avg_sentiment_score,
    SUM(lm.reach) as total_reach,
    SUM(lm.likes + lm.comments + lm.shares) as total_engagement,
    COUNT(*) FILTER (WHERE lm.is_influencer = true) as influencer_mentions
FROM listening_mentions lm
GROUP BY lm.workspace_id, lm.query_id, lm.platform, DATE(lm.published_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_listening_sentiment_trends_pk ON mv_listening_sentiment_trends(workspace_id, query_id, platform, date);
CREATE INDEX IF NOT EXISTS idx_mv_listening_sentiment_trends_workspace_date ON mv_listening_sentiment_trends(workspace_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_mv_listening_sentiment_trends_query_date ON mv_listening_sentiment_trends(query_id, date DESC);

-- Influencer performance metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_influencer_metrics AS
SELECT 
    i.workspace_id,
    i.id as influencer_id,
    i.status,
    COUNT(DISTINCT ia.id) as account_count,
    SUM(ia.followers) as total_followers,
    AVG(ia.engagement_rate) as avg_engagement_rate,
    COUNT(DISTINCT ic.id) as collaboration_count,
    COUNT(DISTINCT ic.id) FILTER (WHERE ic.status = 'COMPLETED') as completed_collaborations,
    SUM(ic.compensation) as total_compensation
FROM influencers i
LEFT JOIN influencer_accounts ia ON i.id = ia.influencer_id AND ia.is_active = true
LEFT JOIN influencer_collaborations ic ON i.id = ic.influencer_id
GROUP BY i.workspace_id, i.id, i.status;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_influencer_metrics_pk ON mv_influencer_metrics(influencer_id);
CREATE INDEX IF NOT EXISTS idx_mv_influencer_metrics_workspace ON mv_influencer_metrics(workspace_id);

-- ============================================
-- Table Partitioning for Time-Series Data
-- ============================================

-- Partition listening_mentions by month for better query performance
-- Note: This requires the table to be recreated with partitioning
-- For existing data, this would need a migration strategy

-- Create partitioned table for new audit logs
CREATE TABLE IF NOT EXISTS security_audit_logs_partitioned (
    LIKE security_audit_logs INCLUDING ALL
) PARTITION BY RANGE (timestamp);

-- Create partitions for the current year and next year
DO $$
DECLARE
    start_date DATE;
    end_date DATE;
    partition_name TEXT;
BEGIN
    FOR i IN 0..23 LOOP
        start_date := DATE_TRUNC('month', CURRENT_DATE) + (i || ' months')::INTERVAL;
        end_date := start_date + INTERVAL '1 month';
        partition_name := 'security_audit_logs_y' || TO_CHAR(start_date, 'YYYY') || 'm' || TO_CHAR(start_date, 'MM');
        
        EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF security_audit_logs_partitioned FOR VALUES FROM (%L) TO (%L)',
            partition_name, start_date, end_date);
    END LOOP;
END $$;

-- Create indexes on partitioned table
CREATE INDEX IF NOT EXISTS idx_audit_logs_part_workspace ON security_audit_logs_partitioned(workspace_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_part_user ON security_audit_logs_partitioned(user_id, timestamp DESC) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_part_action ON security_audit_logs_partitioned(action);

-- Create partitioned table for listening mentions
CREATE TABLE IF NOT EXISTS listening_mentions_partitioned (
    LIKE listening_mentions INCLUDING ALL
) PARTITION BY RANGE (published_at);

-- Create partitions for listening mentions
DO $$
DECLARE
    start_date DATE;
    end_date DATE;
    partition_name TEXT;
BEGIN
    FOR i IN 0..23 LOOP
        start_date := DATE_TRUNC('month', CURRENT_DATE) + (i || ' months')::INTERVAL;
        end_date := start_date + INTERVAL '1 month';
        partition_name := 'listening_mentions_y' || TO_CHAR(start_date, 'YYYY') || 'm' || TO_CHAR(start_date, 'MM');
        
        EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF listening_mentions_partitioned FOR VALUES FROM (%L) TO (%L)',
            partition_name, start_date, end_date);
    END LOOP;
END $$;

-- Create indexes on partitioned listening mentions
CREATE INDEX IF NOT EXISTS idx_listening_mentions_part_query ON listening_mentions_partitioned(query_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_listening_mentions_part_workspace ON listening_mentions_partitioned(workspace_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_listening_mentions_part_sentiment ON listening_mentions_partitioned(sentiment, published_at DESC);

-- ============================================
-- Refresh Functions for Materialized Views
-- ============================================

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_post_metrics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_workspace_activity;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_conversation_metrics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_listening_sentiment_trends;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_influencer_metrics;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh specific materialized view
CREATE OR REPLACE FUNCTION refresh_materialized_view(view_name TEXT)
RETURNS void AS $$
BEGIN
    EXECUTE format('REFRESH MATERIALIZED VIEW CONCURRENTLY %I', view_name);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Automatic Partition Management
-- ============================================

-- Function to create new partitions automatically
CREATE OR REPLACE FUNCTION create_monthly_partitions()
RETURNS void AS $$
DECLARE
    start_date DATE;
    end_date DATE;
    partition_name TEXT;
BEGIN
    -- Create partitions for next 3 months if they don't exist
    FOR i IN 1..3 LOOP
        start_date := DATE_TRUNC('month', CURRENT_DATE + (i || ' months')::INTERVAL);
        end_date := start_date + INTERVAL '1 month';
        
        -- Security audit logs partition
        partition_name := 'security_audit_logs_y' || TO_CHAR(start_date, 'YYYY') || 'm' || TO_CHAR(start_date, 'MM');
        EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF security_audit_logs_partitioned FOR VALUES FROM (%L) TO (%L)',
            partition_name, start_date, end_date);
            
        -- Listening mentions partition
        partition_name := 'listening_mentions_y' || TO_CHAR(start_date, 'YYYY') || 'm' || TO_CHAR(start_date, 'MM');
        EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF listening_mentions_partitioned FOR VALUES FROM (%L) TO (%L)',
            partition_name, start_date, end_date);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Query Optimization Hints
-- ============================================

-- Analyze tables for query planner statistics
ANALYZE users;
ANALYZE workspaces;
ANALYZE social_accounts;
ANALYZE posts;
ANALYZE platform_posts;
ANALYZE media_assets;
ANALYZE campaigns;
ANALYZE conversations;
ANALYZE messages;
ANALYZE listening_mentions;
ANALYZE listening_queries;
ANALYZE influencers;
ANALYZE influencer_accounts;

-- Update statistics for better query planning
ALTER TABLE posts SET (autovacuum_analyze_scale_factor = 0.05);
ALTER TABLE platform_posts SET (autovacuum_analyze_scale_factor = 0.05);
ALTER TABLE conversations SET (autovacuum_analyze_scale_factor = 0.05);
ALTER TABLE messages SET (autovacuum_analyze_scale_factor = 0.05);
ALTER TABLE listening_mentions SET (autovacuum_analyze_scale_factor = 0.05);

-- Set fillfactor for tables with frequent updates
ALTER TABLE posts SET (fillfactor = 90);
ALTER TABLE conversations SET (fillfactor = 90);
ALTER TABLE workflow_instances SET (fillfactor = 90);

COMMENT ON MIGRATION IS 'Database optimization: indexes, materialized views, partitioning, and query optimization';
