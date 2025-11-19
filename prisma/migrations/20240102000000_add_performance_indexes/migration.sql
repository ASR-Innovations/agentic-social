-- Add additional performance indexes for optimized queries

-- Posts table - composite indexes for common query patterns
CREATE INDEX "posts_workspaceId_status_scheduledAt_idx" ON "posts"("workspaceId", "status", "scheduledAt");
CREATE INDEX "posts_workspaceId_createdAt_idx" ON "posts"("workspaceId", "createdAt" DESC);
CREATE INDEX "posts_campaignId_idx" ON "posts"("campaignId");
CREATE INDEX "posts_publishedAt_idx" ON "posts"("publishedAt" DESC);

-- Platform posts - for publishing queue queries
CREATE INDEX "platform_posts_publishStatus_idx" ON "platform_posts"("publishStatus");
CREATE INDEX "platform_posts_platform_publishStatus_idx" ON "platform_posts"("platform", "publishStatus");

-- Social accounts - for account lookup and filtering
CREATE INDEX "social_accounts_platform_idx" ON "social_accounts"("platform");
CREATE INDEX "social_accounts_isActive_idx" ON "social_accounts"("isActive");

-- Media assets - for library browsing and search
CREATE INDEX "media_assets_workspaceId_createdAt_idx" ON "media_assets"("workspaceId", "createdAt" DESC);
CREATE INDEX "media_assets_folder_idx" ON "media_assets"("folder");

-- Conversations - for inbox filtering and sorting
CREATE INDEX "conversations_workspaceId_status_createdAt_idx" ON "conversations"("workspaceId", "status", "createdAt" DESC);
CREATE INDEX "conversations_workspaceId_priority_idx" ON "conversations"("workspaceId", "priority");
CREATE INDEX "conversations_platform_idx" ON "conversations"("platform");
CREATE INDEX "conversations_sentiment_idx" ON "conversations"("sentiment");

-- Messages - for conversation threading
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt" ASC);
CREATE INDEX "messages_direction_idx" ON "messages"("direction");

-- Campaigns - for campaign management
CREATE INDEX "campaigns_workspaceId_startDate_idx" ON "campaigns"("workspaceId", "startDate" DESC);
CREATE INDEX "campaigns_workspaceId_status_idx" ON "campaigns"("workspaceId", "status");

-- Approvals - for approval workflow queries
CREATE INDEX "approvals_postId_status_idx" ON "approvals"("postId", "status");
CREATE INDEX "approvals_approverId_status_idx" ON "approvals"("approverId", "status");

-- Users - for team management
CREATE INDEX "users_workspaceId_role_idx" ON "users"("workspaceId", "role");
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- Workflows - for active workflow lookup
CREATE INDEX "workflows_workspaceId_type_isActive_idx" ON "workflows"("workspaceId", "type", "isActive");
