# Approval Workflow Engine

A comprehensive workflow engine for managing multi-level approval processes with conditional routing, audit trails, and delegation support.

## Features

### 1. Workflow Definition
- Create configurable workflows with multiple steps
- Support for different workflow types (APPROVAL, AUTOMATION)
- Conditional routing based on entity properties
- Flexible step configuration

### 2. Multi-Level Approval Chains
- Support for up to 5 approval levels
- Different approval types:
  - **ALL**: All approvers must approve
  - **ANY**: Any single approver can approve
  - **MAJORITY**: Majority of approvers must approve
- Automatic progression through approval chain

### 3. Conditional Routing
- Evaluate conditions based on entity data
- Support for multiple operators:
  - EQUALS, NOT_EQUALS
  - CONTAINS, NOT_CONTAINS
  - GREATER_THAN, LESS_THAN
  - IN, NOT_IN
- Combine conditions with AND/OR logic
- Skip steps based on conditions

### 4. Approval Notifications
- Email notifications for pending approvals
- In-app notifications
- Deadline tracking
- Escalation support

### 5. Audit Trail Logging
- Complete history of all workflow actions
- Track who did what and when
- Immutable audit logs
- Detailed action metadata

### 6. Bulk Approval
- Approve multiple items at once
- Batch processing for efficiency
- Consistent comments across bulk actions

### 7. Delegation Support
- Delegate approvals during absence
- Time-bound delegations
- Automatic delegation application
- Delegation history tracking

### 8. Workflow Analytics
- Completion rates
- Average completion time
- Rejection rates
- Bottleneck identification

## API Endpoints

### Workflow Management

#### Create Workflow
```http
POST /workflows
Authorization: Bearer {token}

{
  "name": "Content Approval Workflow",
  "description": "Multi-level approval for content publishing",
  "type": "APPROVAL",
  "config": {
    "triggerType": "MANUAL",
    "entityTypes": ["post"],
    "deadlineHours": 24
  },
  "steps": [
    {
      "name": "Manager Approval",
      "type": "APPROVAL",
      "order": 0,
      "config": {
        "approvers": ["user-id-1"],
        "approvalType": "ALL"
      }
    }
  ]
}
```

#### List Workflows
```http
GET /workflows?type=APPROVAL&status=ACTIVE&page=1&limit=20
Authorization: Bearer {token}
```

#### Get Workflow
```http
GET /workflows/{id}
Authorization: Bearer {token}
```

#### Update Workflow
```http
PUT /workflows/{id}
Authorization: Bearer {token}

{
  "name": "Updated Workflow Name",
  "status": "ACTIVE"
}
```

#### Delete Workflow
```http
DELETE /workflows/{id}
Authorization: Bearer {token}
```

### Workflow Instances

#### Start Workflow
```http
POST /workflows/instances
Authorization: Bearer {token}

{
  "workflowId": "workflow-id",
  "entityType": "post",
  "entityId": "post-id",
  "metadata": {
    "priority": "high"
  }
}
```

#### List Workflow Instances
```http
GET /workflows/instances?workflowId={id}&status=IN_PROGRESS
Authorization: Bearer {token}
```

#### Get Workflow Instance
```http
GET /workflows/instances/{id}
Authorization: Bearer {token}
```

### Approvals

#### List Pending Approvals
```http
GET /workflows/approvals/pending?page=1&limit=20
Authorization: Bearer {token}
```

#### Approve/Reject
```http
PUT /workflows/approvals/{id}
Authorization: Bearer {token}

{
  "action": "APPROVE",
  "comments": "Looks good!"
}
```

#### Bulk Approve
```http
POST /workflows/approvals/bulk
Authorization: Bearer {token}

{
  "approvalIds": ["approval-1", "approval-2"],
  "action": "APPROVE",
  "comments": "Bulk approved"
}
```

### Delegations

#### Create Delegation
```http
POST /workflows/delegations
Authorization: Bearer {token}

{
  "toUserId": "user-id",
  "startDate": "2024-01-15T00:00:00Z",
  "endDate": "2024-01-22T00:00:00Z",
  "reason": "Vacation"
}
```

#### List Delegations
```http
GET /workflows/delegations
Authorization: Bearer {token}
```

#### Cancel Delegation
```http
DELETE /workflows/delegations/{id}
Authorization: Bearer {token}
```

### Analytics

#### Get Workflow Analytics
```http
GET /workflows/{id}/analytics
Authorization: Bearer {token}
```

#### Get Analytics Overview
```http
GET /workflows/analytics/overview
Authorization: Bearer {token}
```

## Usage Examples

### Example 1: Simple Two-Level Approval

```typescript
// Create a workflow
const workflow = await workflowService.createWorkflow(workspaceId, userId, {
  name: 'Content Approval',
  type: WorkflowType.APPROVAL,
  config: {
    triggerType: 'MANUAL',
    entityTypes: ['post'],
  },
  steps: [
    {
      name: 'Manager Approval',
      type: WorkflowStepType.APPROVAL,
      order: 0,
      config: {
        approvers: [managerId],
        approvalType: 'ALL',
      },
    },
    {
      name: 'Director Approval',
      type: WorkflowStepType.APPROVAL,
      order: 1,
      config: {
        approvers: [directorId],
        approvalType: 'ALL',
      },
    },
  ],
});

// Start workflow for a post
const instance = await workflowService.startWorkflow(workspaceId, userId, {
  workflowId: workflow.id,
  entityType: 'post',
  entityId: postId,
});
```

### Example 2: Conditional Approval Based on Budget

```typescript
const workflow = await workflowService.createWorkflow(workspaceId, userId, {
  name: 'Campaign Approval',
  type: WorkflowType.APPROVAL,
  config: {
    triggerType: 'AUTOMATIC',
    entityTypes: ['campaign'],
  },
  steps: [
    {
      name: 'Budget Check',
      type: WorkflowStepType.CONDITION,
      order: 0,
      config: {},
      conditions: [
        {
          field: 'budget',
          operator: ConditionOperator.GREATER_THAN,
          value: 10000,
        },
      ],
    },
    {
      name: 'Executive Approval',
      type: WorkflowStepType.APPROVAL,
      order: 1,
      config: {
        approvers: [executiveId],
        approvalType: 'ALL',
      },
    },
  ],
});
```

### Example 3: Delegation During Vacation

```typescript
// Create delegation
const delegation = await delegationService.createDelegation(
  workspaceId,
  userId,
  {
    toUserId: backupApproverId,
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-01-22T00:00:00Z',
    reason: 'Vacation',
  },
);

// All approvals assigned to userId will now go to backupApproverId
// during the delegation period
```

## Database Schema

### Workflow
- Stores workflow definitions
- Contains configuration and metadata
- Links to steps

### WorkflowStep
- Individual steps in a workflow
- Can be APPROVAL, CONDITION, NOTIFICATION, or ACTION
- Contains step-specific configuration

### WorkflowCondition
- Conditions for conditional routing
- Evaluated against entity data
- Supports multiple operators

### WorkflowInstance
- Running instance of a workflow
- Tracks current step and status
- Links to approvals and audit logs

### WorkflowApproval
- Individual approval requests
- Tracks approver, status, and comments
- Links to workflow instance and step

### WorkflowAuditLog
- Immutable audit trail
- Records all workflow actions
- Includes timestamps and user attribution

### WorkflowDelegation
- Temporary delegation of approval authority
- Time-bound with start and end dates
- Automatically applied to new approvals

## Requirements Validation

This implementation satisfies all requirements from Requirement 24:

- ✅ **24.1**: Configurable approval workflows with up to 5 approval levels and conditional routing
- ✅ **24.2**: Email and in-app notifications with deadline tracking
- ✅ **24.3**: Complete audit trail with timestamps and user attribution
- ✅ **24.4**: Legal review routing with specialized interface support
- ✅ **24.5**: Bulk approval, conditional auto-approval rules, and delegation support

## Testing

Run integration tests:
```bash
npm test -- workflow.integration.spec.ts
```

## Future Enhancements

- Visual workflow designer UI
- Workflow templates library
- Advanced analytics dashboard
- Workflow versioning
- Parallel approval paths
- Time-based auto-approval
- Integration with external approval systems
