-- CreateEnum
CREATE TYPE "ReviewPlatform" AS ENUM ('GOOGLE_MY_BUSINESS', 'FACEBOOK', 'YELP', 'TRIPADVISOR', 'TRUSTPILOT', 'AMAZON', 'APP_STORE', 'GOOGLE_PLAY');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('NEW', 'PENDING', 'RESPONDED', 'ESCALATED', 'RESOLVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ReviewResponseStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'FAILED');

-- CreateEnum
CREATE TYPE "ReviewTemplateCategory" AS ENUM ('THANK_YOU', 'APOLOGY', 'CLARIFICATION', 'RESOLUTION', 'FOLLOW_UP', 'GENERAL');

-- CreateEnum
CREATE TYPE "ReviewAlertType" AS ENUM ('NEGATIVE_REVIEW', 'RATING_DROP', 'REVIEW_SPIKE', 'SENTIMENT_SHIFT', 'COMPETITOR_MENTION', 'URGENT_ISSUE');

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "platform" "ReviewPlatform" NOT NULL,
    "platformReviewId" TEXT NOT NULL,
    "locationId" TEXT,
    "locationName" TEXT,
    "reviewerName" TEXT NOT NULL,
    "reviewerAvatar" TEXT,
    "reviewerProfile" TEXT,
    "rating" DOUBLE PRECISION NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "sentiment" "Sentiment" NOT NULL DEFAULT 'NEUTRAL',
    "sentimentScore" DOUBLE PRECISION,
    "topics" TEXT[],
    "keywords" TEXT[],
    "hasResponse" BOOLEAN NOT NULL DEFAULT false,
    "responseText" TEXT,
    "responseDate" TIMESTAMP(3),
    "respondedBy" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'NEW',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "assignedTo" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "flagReason" TEXT,
    "metadata" JSONB,
    "tags" TEXT[],
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_responses" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "templateId" TEXT,
    "status" "ReviewResponseStatus" NOT NULL DEFAULT 'DRAFT',
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "platformResponseId" TEXT,
    "metadata" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_templates" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "category" "ReviewTemplateCategory" NOT NULL,
    "sentiment" "Sentiment" NOT NULL,
    "ratingRange" TEXT,
    "variables" TEXT[],
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT[],
    "metadata" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_alerts" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "reviewId" TEXT,
    "type" "ReviewAlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "affectedReviews" INTEGER,
    "ratingDrop" DOUBLE PRECISION,
    "metadata" JSONB,
    "status" "AlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "acknowledgedBy" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "notificationsSent" TEXT[],
    "recipients" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reputation_scores" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "platform" "ReviewPlatform",
    "locationId" TEXT,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "averageRating" DOUBLE PRECISION NOT NULL,
    "totalReviews" INTEGER NOT NULL,
    "positiveCount" INTEGER NOT NULL DEFAULT 0,
    "neutralCount" INTEGER NOT NULL DEFAULT 0,
    "negativeCount" INTEGER NOT NULL DEFAULT 0,
    "positivePercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "responseRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgResponseTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingTrend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewVolumeTrend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sentimentTrend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "topPositiveTopics" TEXT[],
    "topNegativeTopics" TEXT[],
    "commonKeywords" TEXT[],
    "industryAverage" DOUBLE PRECISION,
    "competitorAverage" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reputation_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_sync_configs" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "platform" "ReviewPlatform" NOT NULL,
    "credentials" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "syncFrequency" INTEGER NOT NULL DEFAULT 60,
    "locationIds" TEXT[],
    "minRating" DOUBLE PRECISION,
    "maxAge" INTEGER,
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncStatus" TEXT,
    "lastSyncError" TEXT,
    "nextSyncAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_sync_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reviews_workspaceId_idx" ON "reviews"("workspaceId");

-- CreateIndex
CREATE INDEX "reviews_platform_idx" ON "reviews"("platform");

-- CreateIndex
CREATE INDEX "reviews_sentiment_idx" ON "reviews"("sentiment");

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- CreateIndex
CREATE INDEX "reviews_status_idx" ON "reviews"("status");

-- CreateIndex
CREATE INDEX "reviews_publishedAt_idx" ON "reviews"("publishedAt");

-- CreateIndex
CREATE INDEX "reviews_assignedTo_idx" ON "reviews"("assignedTo");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_platform_platformReviewId_key" ON "reviews"("platform", "platformReviewId");

-- CreateIndex
CREATE INDEX "review_responses_reviewId_idx" ON "review_responses"("reviewId");

-- CreateIndex
CREATE INDEX "review_responses_status_idx" ON "review_responses"("status");

-- CreateIndex
CREATE INDEX "review_responses_createdBy_idx" ON "review_responses"("createdBy");

-- CreateIndex
CREATE INDEX "review_templates_workspaceId_idx" ON "review_templates"("workspaceId");

-- CreateIndex
CREATE INDEX "review_templates_category_idx" ON "review_templates"("category");

-- CreateIndex
CREATE INDEX "review_templates_sentiment_idx" ON "review_templates"("sentiment");

-- CreateIndex
CREATE INDEX "review_templates_isActive_idx" ON "review_templates"("isActive");

-- CreateIndex
CREATE INDEX "review_alerts_workspaceId_idx" ON "review_alerts"("workspaceId");

-- CreateIndex
CREATE INDEX "review_alerts_reviewId_idx" ON "review_alerts"("reviewId");

-- CreateIndex
CREATE INDEX "review_alerts_type_idx" ON "review_alerts"("type");

-- CreateIndex
CREATE INDEX "review_alerts_status_idx" ON "review_alerts"("status");

-- CreateIndex
CREATE INDEX "review_alerts_createdAt_idx" ON "review_alerts"("createdAt");

-- CreateIndex
CREATE INDEX "reputation_scores_workspaceId_idx" ON "reputation_scores"("workspaceId");

-- CreateIndex
CREATE INDEX "reputation_scores_date_idx" ON "reputation_scores"("date");

-- CreateIndex
CREATE INDEX "reputation_scores_platform_idx" ON "reputation_scores"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "reputation_scores_workspaceId_date_platform_locationId_key" ON "reputation_scores"("workspaceId", "date", "platform", "locationId");

-- CreateIndex
CREATE INDEX "review_sync_configs_workspaceId_idx" ON "review_sync_configs"("workspaceId");

-- CreateIndex
CREATE INDEX "review_sync_configs_platform_idx" ON "review_sync_configs"("platform");

-- CreateIndex
CREATE INDEX "review_sync_configs_isActive_idx" ON "review_sync_configs"("isActive");

-- CreateIndex
CREATE INDEX "review_sync_configs_nextSyncAt_idx" ON "review_sync_configs"("nextSyncAt");

-- CreateIndex
CREATE UNIQUE INDEX "review_sync_configs_workspaceId_platform_key" ON "review_sync_configs"("workspaceId", "platform");

-- AddForeignKey
ALTER TABLE "review_responses" ADD CONSTRAINT "review_responses_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_alerts" ADD CONSTRAINT "review_alerts_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
