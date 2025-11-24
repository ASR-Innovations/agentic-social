-- CreateEnum
CREATE TYPE "ShareStatus" AS ENUM ('PENDING', 'PUBLISHED', 'FAILED', 'DELETED');

-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('FIRST_SHARE', 'SHARES_10', 'SHARES_50', 'SHARES_100', 'REACH_1K', 'REACH_10K', 'REACH_100K', 'ENGAGEMENT_MASTER', 'CONSISTENT_SHARER', 'TOP_PERFORMER', 'INFLUENCER', 'BRAND_AMBASSADOR');

-- CreateEnum
CREATE TYPE "LeaderboardPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'ALL_TIME');

-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('PENDING', 'VIEWED', 'SHARED', 'DISMISSED');

-- CreateTable
CREATE TABLE "employee_profiles" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "bio" TEXT,
    "personalAccounts" JSONB,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "totalShares" INTEGER NOT NULL DEFAULT 0,
    "totalReach" INTEGER NOT NULL DEFAULT 0,
    "totalEngagement" INTEGER NOT NULL DEFAULT 0,
    "interests" TEXT[],
    "preferredPlatforms" TEXT[],
    "notificationSettings" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastActiveAt" TIMESTAMP(3),
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
    "mediaUrls" TEXT[],
    "hashtags" TEXT[],
    "targetPlatforms" TEXT[],
    "category" TEXT,
    "tags" TEXT[],
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "allowModification" BOOLEAN NOT NULL DEFAULT false,
    "requiredDisclaimer" TEXT,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "totalReach" INTEGER NOT NULL DEFAULT 0,
    "totalEngagement" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advocacy_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_shares" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "platformPostId" TEXT,
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "status" "ShareStatus" NOT NULL DEFAULT 'PENDING',
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
    "badgeType" "BadgeType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criteria" JSONB,

    CONSTRAINT "employee_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advocacy_leaderboards" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "period" "LeaderboardPeriod" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "rankings" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "advocacy_leaderboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_suggestions" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "relevanceScore" DOUBLE PRECISION NOT NULL,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "viewedAt" TIMESTAMP(3),
    "sharedAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advocacy_settings" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "pointsPerShare" INTEGER NOT NULL DEFAULT 10,
    "pointsPerReach" DOUBLE PRECISION NOT NULL DEFAULT 0.01,
    "pointsPerEngagement" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "enableLeaderboard" BOOLEAN NOT NULL DEFAULT true,
    "leaderboardPeriods" TEXT[] DEFAULT ARRAY['WEEKLY', 'MONTHLY', 'ALL_TIME']::TEXT[],
    "notifyOnNewContent" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnBadgeEarned" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnLeaderboard" BOOLEAN NOT NULL DEFAULT true,
    "requireApproval" BOOLEAN NOT NULL DEFAULT true,
    "allowContentModification" BOOLEAN NOT NULL DEFAULT false,
    "mandatoryDisclaimer" TEXT,
    "enableAISuggestions" BOOLEAN NOT NULL DEFAULT true,
    "suggestionFrequency" TEXT NOT NULL DEFAULT 'DAILY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advocacy_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employee_profiles_userId_key" ON "employee_profiles"("userId");

-- CreateIndex
CREATE INDEX "employee_profiles_workspaceId_idx" ON "employee_profiles"("workspaceId");

-- CreateIndex
CREATE INDEX "employee_profiles_userId_idx" ON "employee_profiles"("userId");

-- CreateIndex
CREATE INDEX "advocacy_content_workspaceId_idx" ON "advocacy_content"("workspaceId");

-- CreateIndex
CREATE INDEX "advocacy_content_isApproved_idx" ON "advocacy_content"("isApproved");

-- CreateIndex
CREATE INDEX "advocacy_content_category_idx" ON "advocacy_content"("category");

-- CreateIndex
CREATE INDEX "employee_shares_employeeId_idx" ON "employee_shares"("employeeId");

-- CreateIndex
CREATE INDEX "employee_shares_contentId_idx" ON "employee_shares"("contentId");

-- CreateIndex
CREATE INDEX "employee_shares_workspaceId_idx" ON "employee_shares"("workspaceId");

-- CreateIndex
CREATE INDEX "employee_shares_sharedAt_idx" ON "employee_shares"("sharedAt");

-- CreateIndex
CREATE INDEX "employee_badges_employeeId_idx" ON "employee_badges"("employeeId");

-- CreateIndex
CREATE INDEX "employee_badges_badgeType_idx" ON "employee_badges"("badgeType");

-- CreateIndex
CREATE INDEX "advocacy_leaderboards_workspaceId_idx" ON "advocacy_leaderboards"("workspaceId");

-- CreateIndex
CREATE INDEX "advocacy_leaderboards_period_idx" ON "advocacy_leaderboards"("period");

-- CreateIndex
CREATE INDEX "advocacy_leaderboards_startDate_endDate_idx" ON "advocacy_leaderboards"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "content_suggestions_employeeId_idx" ON "content_suggestions"("employeeId");

-- CreateIndex
CREATE INDEX "content_suggestions_contentId_idx" ON "content_suggestions"("contentId");

-- CreateIndex
CREATE INDEX "content_suggestions_status_idx" ON "content_suggestions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "advocacy_settings_workspaceId_key" ON "advocacy_settings"("workspaceId");

-- AddForeignKey
ALTER TABLE "employee_profiles" ADD CONSTRAINT "employee_profiles_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_profiles" ADD CONSTRAINT "employee_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advocacy_content" ADD CONSTRAINT "advocacy_content_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_shares" ADD CONSTRAINT "employee_shares_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_shares" ADD CONSTRAINT "employee_shares_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "advocacy_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_badges" ADD CONSTRAINT "employee_badges_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_suggestions" ADD CONSTRAINT "content_suggestions_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "advocacy_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
