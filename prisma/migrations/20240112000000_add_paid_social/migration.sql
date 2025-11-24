-- CreateEnum
CREATE TYPE "AdCampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AdCampaignObjective" AS ENUM ('AWARENESS', 'TRAFFIC', 'ENGAGEMENT', 'LEADS', 'CONVERSIONS', 'APP_INSTALLS', 'VIDEO_VIEWS', 'MESSAGES');

-- CreateEnum
CREATE TYPE "AdPlatform" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'TWITTER');

-- CreateEnum
CREATE TYPE "BidStrategy" AS ENUM ('LOWEST_COST', 'COST_CAP', 'BID_CAP', 'TARGET_COST');

-- CreateTable
CREATE TABLE "ad_campaigns" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "objective" "AdCampaignObjective" NOT NULL,
    "status" "AdCampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "platforms" "AdPlatform"[],
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "totalBudget" DOUBLE PRECISION,
    "dailyBudget" DOUBLE PRECISION,
    "bidStrategy" "BidStrategy" NOT NULL DEFAULT 'LOWEST_COST',
    "targetAudience" JSONB,
    "creativeAssets" JSONB,
    "tags" TEXT[],
    "metadata" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_sets" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" "AdPlatform" NOT NULL,
    "platformAdSetId" TEXT,
    "status" "AdCampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "budget" DOUBLE PRECISION,
    "bidAmount" DOUBLE PRECISION,
    "targeting" JSONB NOT NULL,
    "schedule" JSONB,
    "optimization" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ads" (
    "id" TEXT NOT NULL,
    "adSetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" "AdPlatform" NOT NULL,
    "platformAdId" TEXT,
    "status" "AdCampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "postId" TEXT,
    "creative" JSONB NOT NULL,
    "callToAction" TEXT,
    "destinationUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_performance" (
    "id" TEXT NOT NULL,
    "adId" TEXT,
    "adSetId" TEXT,
    "campaignId" TEXT NOT NULL,
    "platform" "AdPlatform" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "spend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cpc" DOUBLE PRECISION,
    "cpm" DOUBLE PRECISION,
    "ctr" DOUBLE PRECISION,
    "roas" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_alerts" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL,
    "recipients" TEXT[],
    "triggered" BOOLEAN NOT NULL DEFAULT false,
    "triggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ad_campaigns_workspaceId_idx" ON "ad_campaigns"("workspaceId");

-- CreateIndex
CREATE INDEX "ad_campaigns_status_idx" ON "ad_campaigns"("status");

-- CreateIndex
CREATE INDEX "ad_campaigns_createdBy_idx" ON "ad_campaigns"("createdBy");

-- CreateIndex
CREATE INDEX "ad_sets_campaignId_idx" ON "ad_sets"("campaignId");

-- CreateIndex
CREATE INDEX "ad_sets_platform_idx" ON "ad_sets"("platform");

-- CreateIndex
CREATE INDEX "ad_sets_status_idx" ON "ad_sets"("status");

-- CreateIndex
CREATE INDEX "ads_adSetId_idx" ON "ads"("adSetId");

-- CreateIndex
CREATE INDEX "ads_platform_idx" ON "ads"("platform");

-- CreateIndex
CREATE INDEX "ads_postId_idx" ON "ads"("postId");

-- CreateIndex
CREATE INDEX "ads_status_idx" ON "ads"("status");

-- CreateIndex
CREATE INDEX "ad_performance_campaignId_idx" ON "ad_performance"("campaignId");

-- CreateIndex
CREATE INDEX "ad_performance_adSetId_idx" ON "ad_performance"("adSetId");

-- CreateIndex
CREATE INDEX "ad_performance_adId_idx" ON "ad_performance"("adId");

-- CreateIndex
CREATE INDEX "ad_performance_date_idx" ON "ad_performance"("date");

-- CreateIndex
CREATE INDEX "ad_performance_platform_idx" ON "ad_performance"("platform");

-- CreateIndex
CREATE INDEX "budget_alerts_campaignId_idx" ON "budget_alerts"("campaignId");

-- CreateIndex
CREATE INDEX "budget_alerts_triggered_idx" ON "budget_alerts"("triggered");

-- AddForeignKey
ALTER TABLE "ad_campaigns" ADD CONSTRAINT "ad_campaigns_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_sets" ADD CONSTRAINT "ad_sets_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "ad_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ads" ADD CONSTRAINT "ads_adSetId_fkey" FOREIGN KEY ("adSetId") REFERENCES "ad_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ads" ADD CONSTRAINT "ads_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_performance" ADD CONSTRAINT "ad_performance_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "ad_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_performance" ADD CONSTRAINT "ad_performance_adSetId_fkey" FOREIGN KEY ("adSetId") REFERENCES "ad_sets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_performance" ADD CONSTRAINT "ad_performance_adId_fkey" FOREIGN KEY ("adId") REFERENCES "ads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_alerts" ADD CONSTRAINT "budget_alerts_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "ad_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
