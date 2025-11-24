-- CreateEnum
CREATE TYPE "DataType" AS ENUM ('POSTS', 'MEDIA_ASSETS', 'CONVERSATIONS', 'MESSAGES', 'ANALYTICS_DATA', 'AUDIT_LOGS', 'USER_DATA', 'SOCIAL_ACCOUNT_DATA', 'AI_CACHE', 'MENTIONS');

-- CreateEnum
CREATE TYPE "RetentionAction" AS ENUM ('DELETE', 'ARCHIVE', 'ANONYMIZE');

-- CreateEnum
CREATE TYPE "ExportRequestType" AS ENUM ('GDPR_SUBJECT_ACCESS', 'CCPA_DATA_ACCESS', 'FULL_WORKSPACE_EXPORT', 'SELECTIVE_EXPORT');

-- CreateEnum
CREATE TYPE "ExportFormat" AS ENUM ('JSON', 'CSV', 'XML', 'PDF');

-- CreateEnum
CREATE TYPE "ExportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DeletionRequestType" AS ENUM ('GDPR_RIGHT_TO_ERASURE', 'CCPA_RIGHT_TO_DELETE', 'RETENTION_POLICY', 'USER_REQUESTED', 'WORKSPACE_CLOSURE');

-- CreateEnum
CREATE TYPE "DeletionStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SCHEDULED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ComplianceReportType" AS ENUM ('GDPR_COMPLIANCE', 'CCPA_COMPLIANCE', 'DATA_RETENTION', 'SECURITY_AUDIT', 'ACCESS_LOG', 'DATA_PROCESSING', 'CONSENT_MANAGEMENT', 'BREACH_NOTIFICATION');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('GENERATING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('MARKETING_COMMUNICATIONS', 'DATA_PROCESSING', 'ANALYTICS_TRACKING', 'THIRD_PARTY_SHARING', 'COOKIES', 'PROFILING', 'AUTOMATED_DECISION_MAKING');

-- CreateEnum
CREATE TYPE "LegalBasis" AS ENUM ('CONSENT', 'CONTRACT', 'LEGAL_OBLIGATION', 'VITAL_INTERESTS', 'PUBLIC_TASK', 'LEGITIMATE_INTERESTS');

-- CreateEnum
CREATE TYPE "BreachSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH');

-- CreateEnum
CREATE TYPE "BreachStatus" AS ENUM ('INVESTIGATING', 'CONTAINED', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "data_retention_policies" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dataType" "DataType" NOT NULL,
    "retentionDays" INTEGER NOT NULL,
    "action" "RetentionAction" NOT NULL DEFAULT 'ARCHIVE',
    "conditions" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastExecutedAt" TIMESTAMP(3),
    "nextExecutionAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_retention_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_export_requests" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "requestType" "ExportRequestType" NOT NULL,
    "format" "ExportFormat" NOT NULL DEFAULT 'JSON',
    "dataTypes" "DataType"[],
    "dateFrom" TIMESTAMP(3),
    "dateTo" TIMESTAMP(3),
    "filters" JSONB,
    "status" "ExportStatus" NOT NULL DEFAULT 'PENDING',
    "fileUrl" TEXT,
    "fileSize" BIGINT,
    "expiresAt" TIMESTAMP(3),
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "requestedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_export_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_deletion_requests" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "requestType" "DeletionRequestType" NOT NULL,
    "dataTypes" "DataType"[],
    "userId" TEXT,
    "dateFrom" TIMESTAMP(3),
    "dateTo" TIMESTAMP(3),
    "filters" JSONB,
    "status" "DeletionStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "executedAt" TIMESTAMP(3),
    "itemsDeleted" INTEGER,
    "itemsFailed" INTEGER,
    "error" TEXT,
    "auditLog" JSONB,
    "metadata" JSONB,
    "requestedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_deletion_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_reports" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "reportType" "ComplianceReportType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "periodFrom" TIMESTAMP(3) NOT NULL,
    "periodTo" TIMESTAMP(3) NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'GENERATING',
    "data" JSONB,
    "summary" JSONB,
    "fileUrl" TEXT,
    "fileFormat" "ExportFormat" NOT NULL DEFAULT 'PDF',
    "fileSize" BIGINT,
    "complianceScore" DOUBLE PRECISION,
    "findings" JSONB,
    "recommendations" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "generatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_records" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT,
    "externalId" TEXT,
    "email" TEXT,
    "consentType" "ConsentType" NOT NULL,
    "purpose" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT false,
    "grantedAt" TIMESTAMP(3),
    "withdrawn" BOOLEAN NOT NULL DEFAULT false,
    "withdrawnAt" TIMESTAMP(3),
    "source" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "legalBasis" "LegalBasis",
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_processing_activities" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dataCategories" TEXT[],
    "purpose" TEXT NOT NULL,
    "legalBasis" "LegalBasis" NOT NULL,
    "dataSubjects" TEXT[],
    "recipients" TEXT[],
    "internationalTransfers" BOOLEAN NOT NULL DEFAULT false,
    "transferCountries" TEXT[],
    "transferSafeguards" TEXT,
    "retentionPeriod" TEXT NOT NULL,
    "securityMeasures" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_processing_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_breach_incidents" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "BreachSeverity" NOT NULL,
    "discoveredAt" TIMESTAMP(3) NOT NULL,
    "discoveredBy" TEXT NOT NULL,
    "dataTypes" "DataType"[],
    "affectedRecords" INTEGER,
    "affectedUsers" TEXT[],
    "riskLevel" "RiskLevel" NOT NULL,
    "impact" TEXT NOT NULL,
    "status" "BreachStatus" NOT NULL DEFAULT 'INVESTIGATING',
    "containedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "authoritiesNotified" BOOLEAN NOT NULL DEFAULT false,
    "authoritiesNotifiedAt" TIMESTAMP(3),
    "subjectsNotified" BOOLEAN NOT NULL DEFAULT false,
    "subjectsNotifiedAt" TIMESTAMP(3),
    "actionsTaken" JSONB,
    "rootCause" TEXT,
    "lessonsLearned" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_breach_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "data_retention_policies_workspaceId_idx" ON "data_retention_policies"("workspaceId");

-- CreateIndex
CREATE INDEX "data_retention_policies_dataType_idx" ON "data_retention_policies"("dataType");

-- CreateIndex
CREATE INDEX "data_retention_policies_isActive_idx" ON "data_retention_policies"("isActive");

-- CreateIndex
CREATE INDEX "data_retention_policies_nextExecutionAt_idx" ON "data_retention_policies"("nextExecutionAt");

-- CreateIndex
CREATE INDEX "data_export_requests_workspaceId_idx" ON "data_export_requests"("workspaceId");

-- CreateIndex
CREATE INDEX "data_export_requests_status_idx" ON "data_export_requests"("status");

-- CreateIndex
CREATE INDEX "data_export_requests_requestedBy_idx" ON "data_export_requests"("requestedBy");

-- CreateIndex
CREATE INDEX "data_export_requests_createdAt_idx" ON "data_export_requests"("createdAt");

-- CreateIndex
CREATE INDEX "data_deletion_requests_workspaceId_idx" ON "data_deletion_requests"("workspaceId");

-- CreateIndex
CREATE INDEX "data_deletion_requests_status_idx" ON "data_deletion_requests"("status");

-- CreateIndex
CREATE INDEX "data_deletion_requests_requestedBy_idx" ON "data_deletion_requests"("requestedBy");

-- CreateIndex
CREATE INDEX "data_deletion_requests_scheduledFor_idx" ON "data_deletion_requests"("scheduledFor");

-- CreateIndex
CREATE INDEX "data_deletion_requests_createdAt_idx" ON "data_deletion_requests"("createdAt");

-- CreateIndex
CREATE INDEX "compliance_reports_workspaceId_idx" ON "compliance_reports"("workspaceId");

-- CreateIndex
CREATE INDEX "compliance_reports_reportType_idx" ON "compliance_reports"("reportType");

-- CreateIndex
CREATE INDEX "compliance_reports_status_idx" ON "compliance_reports"("status");

-- CreateIndex
CREATE INDEX "compliance_reports_createdAt_idx" ON "compliance_reports"("createdAt");

-- CreateIndex
CREATE INDEX "consent_records_workspaceId_idx" ON "consent_records"("workspaceId");

-- CreateIndex
CREATE INDEX "consent_records_userId_idx" ON "consent_records"("userId");

-- CreateIndex
CREATE INDEX "consent_records_externalId_idx" ON "consent_records"("externalId");

-- CreateIndex
CREATE INDEX "consent_records_email_idx" ON "consent_records"("email");

-- CreateIndex
CREATE INDEX "consent_records_consentType_idx" ON "consent_records"("consentType");

-- CreateIndex
CREATE INDEX "consent_records_granted_idx" ON "consent_records"("granted");

-- CreateIndex
CREATE INDEX "data_processing_activities_workspaceId_idx" ON "data_processing_activities"("workspaceId");

-- CreateIndex
CREATE INDEX "data_processing_activities_isActive_idx" ON "data_processing_activities"("isActive");

-- CreateIndex
CREATE INDEX "data_breach_incidents_workspaceId_idx" ON "data_breach_incidents"("workspaceId");

-- CreateIndex
CREATE INDEX "data_breach_incidents_severity_idx" ON "data_breach_incidents"("severity");

-- CreateIndex
CREATE INDEX "data_breach_incidents_status_idx" ON "data_breach_incidents"("status");

-- CreateIndex
CREATE INDEX "data_breach_incidents_discoveredAt_idx" ON "data_breach_incidents"("discoveredAt");

-- AddForeignKey
ALTER TABLE "data_retention_policies" ADD CONSTRAINT "data_retention_policies_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_export_requests" ADD CONSTRAINT "data_export_requests_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_deletion_requests" ADD CONSTRAINT "data_deletion_requests_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_reports" ADD CONSTRAINT "compliance_reports_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_processing_activities" ADD CONSTRAINT "data_processing_activities_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_breach_incidents" ADD CONSTRAINT "data_breach_incidents_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
