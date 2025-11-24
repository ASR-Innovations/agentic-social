# Multi-Workspace Management

This module provides comprehensive multi-workspace management capabilities for agency and enterprise users, enabling them to manage multiple client workspaces, switch between workspaces, view cross-workspace analytics, and provide client portal access.

## Features

### 1. Workspace Switching

Users can seamlessly switch between multiple workspaces they have access to.

**Endpoint:** `POST /api/workspaces/switch`

**Request:**
```json
{
  "workspaceId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Response:**
```json
{
  "workspace": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Client Workspace",
    "plan": "PROFESSIONAL"
  }
}
```

### 2. Cross-Workspace Analytics

View aggregated analytics across multiple workspaces for agency-level insights.

**Endpoint:** `GET /api/workspaces/analytics/cross-workspace`

**Query Parameters:**
- `workspaceIds` (optional): Array of workspace IDs to filter

**Response:**
```json
{
  "workspaces": [
    {
      "id": "workspace-1",
      "name": "Client A",
      "plan": "PROFESSIONAL"
    }
  ],
  "analytics": [
    {
      "workspaceId": "workspace-1",
      "workspaceName": "Client A",
      "metrics": {
        "totalPosts": 150,
        "totalEngagement": 5000,
        "totalReach": 50000,
        "totalFollowers": 10000
      }
    }
  ],
  "summary": {
    "totalWorkspaces": 5,
    "totalPosts": 750,
    "totalEngagement": 25000,
    "totalReach": 250000
  }
}
```

### 3. Agency Dashboard

Comprehensive dashboard view for agencies managing multiple client workspaces.

**Endpoint:** `GET /api/workspaces/agency-dashboard`

**Response:**
```json
{
  "overview": {
    "totalWorkspaces": 10,
    "totalClients": 15,
    "activeClients": 12,
    "totalPosts": 1500,
    "totalEngagement": 50000,
    "totalReach": 500000
  },
  "workspaces": [
    {
      "id": "workspace-1",
      "name": "Client A",
      "plan": "PROFESSIONAL",
      "clientCount": 2
    }
  ],
  "recentActivity": [],
  "performanceMetrics": []
}
```

### 4. Workspace Templates

Create and apply pre-configured workspace templates for quick client onboarding.

#### Create Template

**Endpoint:** `POST /api/workspaces/templates`

**Request:**
```json
{
  "name": "E-commerce Starter",
  "description": "Pre-configured workspace for e-commerce businesses",
  "config": {
    "settings": {
      "timezone": "UTC",
      "defaultPostingTimes": ["09:00", "12:00", "18:00"]
    },
    "branding": {
      "primaryColor": "#007bff",
      "secondaryColor": "#6c757d"
    }
  },
  "isPublic": true
}
```

#### Apply Template

**Endpoint:** `POST /api/workspaces/templates/apply`

**Request:**
```json
{
  "templateId": "template-id",
  "workspaceId": "workspace-id"
}
```

#### Get Templates

**Endpoint:** `GET /api/workspaces/templates`

Returns all public templates and templates created by the current user.

### 5. Client Portal Access

Grant clients view-only or limited access to their workspace for collaboration and approval workflows.

#### Create Client Access

**Endpoint:** `POST /api/workspaces/:workspaceId/client-portal`

**Request:**
```json
{
  "email": "client@example.com",
  "name": "John Doe",
  "workspaceId": "workspace-id",
  "accessLevel": "VIEW_AND_APPROVE",
  "permissions": ["view_analytics", "approve_posts"]
}
```

**Access Levels:**
- `VIEW_ONLY`: Can only view content and analytics
- `VIEW_AND_COMMENT`: Can view and leave comments
- `VIEW_AND_APPROVE`: Can view, comment, and approve content

**Response:**
```json
{
  "id": "access-id",
  "email": "client@example.com",
  "name": "John Doe",
  "workspaceId": "workspace-id",
  "accessLevel": "VIEW_AND_APPROVE",
  "permissions": ["view_analytics", "approve_posts"],
  "inviteToken": "abc123...",
  "inviteExpiresAt": "2024-01-15T00:00:00Z",
  "isActive": true
}
```

#### Verify Client Token

**Endpoint:** `GET /api/workspaces/client-portal/verify/:token`

Clients use this endpoint to verify their invite token and gain access to the workspace.

#### Update Client Access

**Endpoint:** `PUT /api/workspaces/client-portal/:accessId`

**Request:**
```json
{
  "accessLevel": "VIEW_ONLY",
  "permissions": ["view_analytics"]
}
```

#### Revoke Client Access

**Endpoint:** `DELETE /api/workspaces/client-portal/:accessId`

Revokes client access to the workspace.

## Database Schema

### workspace_templates

```sql
CREATE TABLE workspace_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  config JSONB,
  is_public BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### client_portal_access

```sql
CREATE TABLE client_portal_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  access_level ENUM('VIEW_ONLY', 'VIEW_AND_COMMENT', 'VIEW_AND_APPROVE') DEFAULT 'VIEW_ONLY',
  permissions TEXT[],
  is_active BOOLEAN DEFAULT true,
  invite_token VARCHAR(255),
  invite_expires_at TIMESTAMP,
  last_access_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(email, workspace_id)
);
```

## Usage Examples

### Agency Workflow

```typescript
// 1. Get all workspaces for agency user
const workspaces = await multiWorkspaceService.getUserWorkspaces(userId);

// 2. View agency dashboard
const dashboard = await multiWorkspaceService.getAgencyDashboard(userId);

// 3. Create a template for common client setup
const template = await multiWorkspaceService.createTemplate({
  name: 'Social Media Starter',
  description: 'Basic setup for social media management',
  config: {
    settings: { timezone: 'America/New_York' },
    branding: { primaryColor: '#007bff' }
  },
  isPublic: false
}, userId);

// 4. Apply template to new client workspace
await multiWorkspaceService.applyTemplate({
  templateId: template.id,
  workspaceId: newClientWorkspaceId
}, userId);

// 5. Grant client portal access
const clientAccess = await multiWorkspaceService.createClientPortalAccess({
  email: 'client@example.com',
  name: 'Client Name',
  workspaceId: newClientWorkspaceId,
  accessLevel: ClientPortalAccessLevel.VIEW_AND_APPROVE,
  permissions: ['view_analytics', 'approve_posts']
});

// 6. Send invite email to client with token
// clientAccess.inviteToken
```

### Client Workflow

```typescript
// 1. Client receives invite email with token
// 2. Client verifies token
const access = await multiWorkspaceService.verifyClientPortalToken(token);

// 3. Client can now access workspace with limited permissions
// based on their accessLevel and permissions
```

## Security Considerations

1. **Token Expiry**: Client invite tokens expire after 7 days by default
2. **Access Control**: All endpoints verify user has appropriate permissions
3. **Workspace Isolation**: Complete data isolation between workspaces
4. **Audit Trail**: All access and modifications are logged
5. **Token Security**: Invite tokens are cryptographically secure random strings

## Requirements Validation

This implementation satisfies the following requirements:

- **Requirement 23.1**: Complete tenant isolation with separate social accounts, content libraries, team members, and billing per client
- **Requirement 23.2**: Brand switching, cross-brand reporting, and agency-level analytics dashboard

## Testing

Run the integration tests:

```bash
npm run test:e2e -- multi-workspace.integration.spec.ts
```

Run the unit tests:

```bash
npm run test -- multi-workspace.service.spec.ts
```

## Future Enhancements

1. **Workspace Templates Marketplace**: Public marketplace for sharing templates
2. **Advanced Analytics**: More detailed cross-workspace analytics and benchmarking
3. **Client Collaboration**: Real-time collaboration features for clients
4. **Automated Reporting**: Scheduled reports sent to clients automatically
5. **White-Label Portal**: Fully customizable client portal with agency branding
