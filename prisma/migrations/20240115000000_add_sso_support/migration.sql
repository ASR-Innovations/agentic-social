-- CreateEnum for SSO Provider
CREATE TYPE "SSOProvider" AS ENUM ('SAML', 'GOOGLE', 'AZURE_AD', 'OKTA');

-- AlterTable: Make password optional and add SSO fields to users
ALTER TABLE "users" 
  ALTER COLUMN "password" DROP NOT NULL,
  ADD COLUMN "ssoProvider" "SSOProvider",
  ADD COLUMN "ssoProviderId" VARCHAR(255),
  ADD COLUMN "refreshToken" TEXT;

-- CreateTable: SSO Configuration
CREATE TABLE "sso_configs" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "provider" "SSOProvider" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "entryPoint" TEXT,
    "issuer" TEXT,
    "cert" TEXT,
    "callbackUrl" TEXT,
    "clientId" TEXT,
    "clientSecret" TEXT,
    "domain" TEXT,
    "tenantDomain" TEXT,
    "redirectUri" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sso_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sso_configs_workspaceId_key" ON "sso_configs"("workspaceId");

-- CreateIndex
CREATE INDEX "sso_configs_workspaceId_idx" ON "sso_configs"("workspaceId");

-- AddForeignKey
ALTER TABLE "sso_configs" ADD CONSTRAINT "sso_configs_workspaceId_fkey" 
  FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
