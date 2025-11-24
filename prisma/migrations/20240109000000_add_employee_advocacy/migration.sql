-- CreateEnum
CREATE TYPE "EmployeeRole" AS ENUM ('EMPLOYEE', 'MANAGER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AdvocacyContentStatus" AS ENUM ('DRAFT', 'APPROVED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ShareStatus" AS ENUM ('PENDING', 'SHARED', 'FAILED');

-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('FIRST_SHARE', 'STREAK_7', 'STREAK_30', 'TOP_SHARER', 'ENGAGEMENT_MASTER', 'TEAM_PLAYER', 'CONTENT_CREATOR', 'INFLUENCER');

-- CreateTable
CREATE TABLE "employee_profiles" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "EmployeeRole" NOT NULL DEFAULT 'EMPLOYEE',
    "department" TEXT,
    "jobTitle" TEXT,
    "bio" TEXT,
    "socialAccounts" JSONB,
    "interests" TEXT[],
    "preferences" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastShareDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advocacy_content" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "media" TEXT[],
    "platforms" TEXT[],
    "category" TEXT,
    "tags" TEXT[],
    "status" "AdvocacyContentStatus" NOT NULL DEFAULT 'DRAFT',
    "isLocked" BOOLEAN NOT NULL DEFAULT true,
    "allowModification" BOOLEAN NOT NULL DEFAULT false,
    "suggestedHashtags" TEXT[],
    "suggestedMentions" TEXT[],
    "targetAudience" TEXT[],
    "expiresAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advocacy_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_shares" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "platformAccountId" TEXT,
    "platformPostId" TEXT,
    "status" "ShareStatus" NOT NULL DEFAULT 'PENDING',
    "customMessage" TEXT,
    "wasModified" BOOLEAN NOT NULL DEFAULT false,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "engagement" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "sharedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "error" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_badges" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "badgeType" "BadgeType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advocacy_leaderboard" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "rank" INTEGER NOT NULL,
    "totalShares" INTEGER NOT NULL DEFAULT 0,
    "totalReach" INTEGER NOT NULL DEFAULT 0,
    "totalEngagement" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "badgesEarned" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advocacy_leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advocacy_analytics" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "contentId" TEXT,
    "employeeId" TEXT,
    "department" TEXT,
    "totalShares" INTEGER NOT NULL DEFAULT 0,
    "totalReach" INTEGER NOT NULL DEFAULT 0,
    "totalImpressions" INTEGER NOT NULL DEFAULT 0,
    "totalEngagement" INTEGER NOT NULL DEFAULT 0,
    "totalLikes" INTEGER NOT NULL DEFAULT 0,
    "totalComments" INTEGER NOT NULL DEFAULT 0,
    "totalClicks" INTEGER NOT NULL DEFAULT 0,
    "participationRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgEngagementRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "topPerformers" JSONB,
    "topContent" JSONB,
    "platformBreakdown" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advocacy_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_suggestions" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "reasons" TEXT[],
    "suggestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewedAt" TIMESTAMP(3),
    "sharedAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "content_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advocacy_rewards" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "pointsRequired" INTEGER NOT NULL,
    "value" DOUBLE PRECISION,
    "quantity" INTEGER,
    "quantityRemaining" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advocacy_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_redemptions" (
    "id" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "pointsSpent" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "fulfilledAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reward_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employee_profiles_userId_key" ON "employee_profiles"("userId");

-- CreateIndex
CREATE INDEX "employee_profiles_workspaceId_idx" ON "employee_profiles"("workspaceId");

-- CreateIndex
CREATE INDEX "employee_profiles_userId_idx" ON "employee_profiles"("userId");

-- CreateIndex
CREATE INDEX "employee_profiles_isActive_idx" ON "employee_profiles"("isActive");

-- CreateIndex
CREATE INDEX "advocacy_content_workspaceId_idx" ON "advocacy_content"("workspaceId");

-- CreateIndex
CREATE INDEX "advocacy_content_status_idx" ON "advocacy_content"("status");

-- CreateIndex
CREATE INDEX "advocacy_content_category_idx" ON "advocacy_content"("category");

-- CreateIndex
CREATE INDEX "advocacy_content_createdBy_idx" ON "advocacy_content"("createdBy");

-- CreateIndex
CREATE INDEX "employee_shares_contentId_idx" ON "employee_shares"("contentId");

-- CreateIndex
CREATE INDEX "employee_shares_employeeId_idx" ON "employee_shares"("employeeId");

-- CreateIndex
CREATE INDEX "employee_shares_workspaceId_idx" ON "employee_shares"("workspaceId");

-- CreateIndex
CREATE INDEX "employee_shares_status_idx" ON "employee_shares"("status");

-- CreateIndex
CREATE INDEX "employee_shares_sharedAt_idx" ON "employee_shares"("sharedAt");

-- CreateIndex
CREATE INDEX "employee_badges_employeeId_idx" ON "employee_badges"("employeeId");

-- CreateIndex
CREATE INDEX "employee_badges_workspaceId_idx" ON "employee_badges"("workspaceId");

-- CreateIndex
CREATE INDEX "employee_badges_badgeType_idx" ON "employee_badges"("badgeType");

-- CreateIndex
CREATE UNIQUE INDEX "advocacy_leaderboard_workspaceId_employeeId_period_period_key" ON "advocacy_leaderboard"("workspaceId", "employeeId", "period", "periodStart");

-- CreateIndex
CREATE INDEX "advocacy_leaderboard_workspaceId_idx" ON "advocacy_leaderboard"("workspaceId");

-- CreateIndex
CREATE INDEX "advocacy_leaderboard_period_idx" ON "advocacy_leaderboard"("period");

-- CreateIndex
CREATE INDEX "advocacy_leaderboard_rank_idx" ON "advocacy_leaderboard"("rank");

-- CreateIndex
CREATE UNIQUE INDEX "advocacy_analytics_workspaceId_date_contentId_employeeId_d_key" ON "advocacy_analytics"("workspaceId", "date", "contentId", "employeeId", "department");

-- CreateIndex
CREATE INDEX "advocacy_analytics_workspaceId_idx" ON "advocacy_analytics"("workspaceId");

-- CreateIndex
CREATE INDEX "advocacy_analytics_date_idx" ON "advocacy_analytics"("date");

-- CreateIndex
CREATE INDEX "advocacy_analytics_contentId_idx" ON "advocacy_analytics"("contentId");

-- CreateIndex
CREATE INDEX "advocacy_analytics_employeeId_idx" ON "advocacy_analytics"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "content_suggestions_employeeId_contentId_key" ON "content_suggestions"("employeeId", "contentId");

-- CreateIndex
CREATE INDEX "content_suggestions_employeeId_idx" ON "content_suggestions"("employeeId");

-- CreateIndex
CREATE INDEX "content_suggestions_contentId_idx" ON "content_suggestions"("contentId");

-- CreateIndex
CREATE INDEX "content_suggestions_score_idx" ON "content_suggestions"("score");

-- CreateIndex
CREATE INDEX "advocacy_rewards_workspaceId_idx" ON "advocacy_rewards"("workspaceId");

-- CreateIndex
CREATE INDEX "advocacy_rewards_isActive_idx" ON "advocacy_rewards"("isActive");

-- CreateIndex
CREATE INDEX "reward_redemptions_rewardId_idx" ON "reward_redemptions"("rewardId");

-- CreateIndex
CREATE INDEX "reward_redemptions_employeeId_idx" ON "reward_redemptions"("employeeId");

-- CreateIndex
CREATE INDEX "reward_redemptions_workspaceId_idx" ON "reward_redemptions"("workspaceId");

-- AddForeignKey
ALTER TABLE "employee_profiles" ADD CONSTRAINT "employee_profiles_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_profiles" ADD CONSTRAINT "employee_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advocacy_content" ADD CONSTRAINT "advocacy_content_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_shares" ADD CONSTRAINT "employee_shares_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "advocacy_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_shares" ADD CONSTRAINT "employee_shares_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_badges" ADD CONSTRAINT "employee_badges_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advocacy_leaderboard" ADD CONSTRAINT "advocacy_leaderboard_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advocacy_analytics" ADD CONSTRAINT "advocacy_analytics_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "advocacy_content"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advocacy_analytics" ADD CONSTRAINT "advocacy_analytics_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_suggestions" ADD CONSTRAINT "content_suggestions_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_suggestions" ADD CONSTRAINT "content_suggestions_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "advocacy_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advocacy_rewards" ADD CONSTRAINT "advocacy_rewards_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "advocacy_rewards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
