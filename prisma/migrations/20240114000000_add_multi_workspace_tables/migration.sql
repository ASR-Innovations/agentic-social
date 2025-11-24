-- Migration: Add Multi-Workspace Management Tables
-- This migration adds support for workspace templates and client portal access

-- Create workspace_templates table
CREATE TABLE IF NOT EXISTS workspace_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  config JSONB,
  is_public BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on created_by for faster queries
CREATE INDEX idx_workspace_templates_created_by ON workspace_templates(created_by);
CREATE INDEX idx_workspace_templates_is_public ON workspace_templates(is_public);

-- Create client_portal_access table
CREATE TABLE IF NOT EXISTS client_portal_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  workspace_id UUID NOT NULL,
  access_level VARCHAR(50) DEFAULT 'VIEW_ONLY' CHECK (access_level IN ('VIEW_ONLY', 'VIEW_AND_COMMENT', 'VIEW_AND_APPROVE')),
  permissions TEXT[],
  is_active BOOLEAN DEFAULT true,
  invite_token VARCHAR(255),
  invite_expires_at TIMESTAMP,
  last_access_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_client_portal_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT unique_email_workspace UNIQUE(email, workspace_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_client_portal_workspace_id ON client_portal_access(workspace_id);
CREATE INDEX idx_client_portal_email ON client_portal_access(email);
CREATE INDEX idx_client_portal_invite_token ON client_portal_access(invite_token);
CREATE INDEX idx_client_portal_is_active ON client_portal_access(is_active);

-- Add comments for documentation
COMMENT ON TABLE workspace_templates IS 'Pre-configured workspace templates for quick client onboarding';
COMMENT ON TABLE client_portal_access IS 'Client portal access management for view-only or limited workspace access';

COMMENT ON COLUMN workspace_templates.config IS 'JSON configuration including settings, workflows, branding, and defaults';
COMMENT ON COLUMN workspace_templates.is_public IS 'Whether this template is available to all users or only the creator';

COMMENT ON COLUMN client_portal_access.access_level IS 'Level of access: VIEW_ONLY, VIEW_AND_COMMENT, or VIEW_AND_APPROVE';
COMMENT ON COLUMN client_portal_access.permissions IS 'Array of specific permissions granted to the client';
COMMENT ON COLUMN client_portal_access.invite_token IS 'Secure token for client invitation link';
COMMENT ON COLUMN client_portal_access.invite_expires_at IS 'Expiration date for the invite token (default 7 days)';
