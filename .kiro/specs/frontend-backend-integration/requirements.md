# Frontend-Backend Integration Requirements

## Introduction

This specification addresses the critical integration gap between the existing AI social media platform frontend (Next.js) and backend (NestJS). The frontend currently displays mock/static data while the backend has fully functional AgentFlow SDK and social media integrations. This integration will connect all frontend pages to their corresponding backend APIs, enabling real-time data flow and full platform functionality.

## Glossary

- **Frontend Application**: Next.js 14 application with React components located in `/frontend`
- **Backend API**: NestJS REST API with AgentFlow SDK located in `/src`
- **API Client**: Axios-based HTTP client in `/frontend/src/lib/api.ts`
- **AgentFlow SDK**: Custom multi-agent AI orchestration system in `/src/agentflow`
- **Social Account**: Connected social media platform account (Instagram, Twitter, LinkedIn, etc.)
- **Post Entity**: Content scheduled or published to social media platforms
- **Agent Entity**: AI agent instance (Content Creator, Strategy, Engagement, Analytics, Trend Detection, Competitor Analysis)

## Requirements

### Requirement 1: AI Hub Integration

**User Story:** As a user, I want to view and manage my AI agents in real-time, so that I can monitor their activity and control their behavior.

#### Acceptance Criteria

1. WHEN a user navigates to the AI Hub page THEN the system SHALL fetch all configured AI agents from the backend API endpoint `/api/v1/agentflow/agents`
2. WHEN displaying agent information THEN the system SHALL show agent name, type, status (active/idle), model configuration, performance metrics, and usage statistics
3. WHEN a user toggles an agent's active status THEN the system SHALL send a POST request to `/api/v1/agentflow/agents/:id/activate` or `/api/v1/agentflow/agents/:id/deactivate`
4. WHEN fetching agent statistics THEN the system SHALL retrieve real-time data including total cost, total tasks, average response time, and success rate from `/api/v1/agentflow/statistics`
5. WHEN an agent completes a task THEN the system SHALL update the activity feed with the agent's latest action and timestamp

### Requirement 2: Dashboard Integration

**User Story:** As a user, I want to see real-time performance metrics and AI insights on my dashboard, so that I can understand my social media performance at a glance.

#### Acceptance Criteria

1. WHEN a user loads the dashboard THEN the system SHALL fetch performance metrics from `/api/v1/analytics/overview` including reach, engagement, and follower counts
2. WHEN displaying AI insights THEN the system SHALL retrieve AI-generated recommendations from `/api/v1/ai/insights`
3. WHEN showing today's schedule THEN the system SHALL fetch scheduled posts from `/api/v1/posts?status=scheduled&date=today`
4. WHEN displaying the social inbox THEN the system SHALL retrieve recent messages from `/api/v1/inbox/conversations?limit=5`
5. WHEN showing agent activity THEN the system SHALL fetch active agent tasks from `/api/v1/agentflow/agents/activity`

### Requirement 3: Content Composer Integration

**User Story:** As a user, I want to create and schedule posts with AI assistance, so that I can efficiently manage my content creation workflow.

#### Acceptance Criteria

1. WHEN a user requests AI content generation THEN the system SHALL send the prompt to `/api/v1/ai/generate` with content type, platforms, and tone parameters
2. WHEN a user creates a post THEN the system SHALL send post data to `/api/v1/posts` including content, media URLs, scheduled time, and target platforms
3. WHEN a user uploads media THEN the system SHALL send files to `/api/v1/media/upload` and receive S3 URLs in response
4. WHEN a user schedules a post THEN the system SHALL validate the scheduled time and platform requirements before submission
5. WHEN AI generation completes THEN the system SHALL display the generated content with platform-specific adaptations

### Requirement 4: Analytics Integration

**User Story:** As a user, I want to view detailed analytics and performance reports, so that I can measure the effectiveness of my social media strategy.

#### Acceptance Criteria

1. WHEN a user navigates to the analytics page THEN the system SHALL fetch comprehensive metrics from `/api/v1/analytics` with date range parameters
2. WHEN displaying platform-specific analytics THEN the system SHALL retrieve data from `/api/v1/analytics/platforms/:platform`
3. WHEN showing engagement trends THEN the system SHALL fetch time-series data from `/api/v1/analytics/trends`
4. WHEN generating reports THEN the system SHALL request report data from `/api/v1/analytics/reports` with custom parameters
5. WHEN displaying competitor analysis THEN the system SHALL retrieve data from `/api/v1/analytics/competitors`

### Requirement 5: Settings and Account Management Integration

**User Story:** As a user, I want to manage my social media accounts and platform settings, so that I can configure my workspace and connected platforms.

#### Acceptance Criteria

1. WHEN a user views connected accounts THEN the system SHALL fetch all social accounts from `/api/v1/social-accounts`
2. WHEN a user initiates OAuth connection THEN the system SHALL redirect to `/api/v1/social-accounts/connect/:platform` for authentication
3. WHEN a user disconnects an account THEN the system SHALL send a DELETE request to `/api/v1/social-accounts/:id`
4. WHEN a user updates settings THEN the system SHALL send a PATCH request to `/api/v1/settings` with updated configuration
5. WHEN displaying account status THEN the system SHALL show token expiration, sync status, and connection health

### Requirement 6: Social Inbox Integration

**User Story:** As a user, I want to manage conversations and messages from all platforms in one place, so that I can efficiently handle customer engagement.

#### Acceptance Criteria

1. WHEN a user opens the inbox THEN the system SHALL fetch conversations from `/api/v1/inbox/conversations` with pagination and filtering
2. WHEN a user selects a conversation THEN the system SHALL retrieve messages from `/api/v1/inbox/conversations/:id/messages`
3. WHEN a user sends a reply THEN the system SHALL POST the message to `/api/v1/inbox/conversations/:id/messages`
4. WHEN requesting AI response suggestions THEN the system SHALL fetch suggestions from `/api/v1/ai/suggest-response` with conversation context
5. WHEN filtering by sentiment THEN the system SHALL apply sentiment filter parameters to the conversations endpoint

### Requirement 7: Team Management Integration

**User Story:** As a user, I want to manage team members and their permissions, so that I can collaborate effectively with my team.

#### Acceptance Criteria

1. WHEN a user views team members THEN the system SHALL fetch the team list from `/api/v1/team/members`
2. WHEN a user invites a team member THEN the system SHALL POST invitation data to `/api/v1/team/invite`
3. WHEN a user removes a team member THEN the system SHALL send a DELETE request to `/api/v1/team/members/:id`
4. WHEN a user updates member permissions THEN the system SHALL PATCH role data to `/api/v1/team/members/:id/permissions`
5. WHEN displaying team activity THEN the system SHALL fetch activity logs from `/api/v1/team/activity`

### Requirement 8: Real-Time Updates and WebSocket Integration

**User Story:** As a user, I want to receive real-time updates for agent activities and new messages, so that I can stay informed without manual refreshing.

#### Acceptance Criteria

1. WHEN a user is logged in THEN the system SHALL establish a WebSocket connection to the backend
2. WHEN an agent completes a task THEN the system SHALL receive a WebSocket event and update the UI immediately
3. WHEN a new message arrives THEN the system SHALL display a notification and update the inbox count
4. WHEN a scheduled post is published THEN the system SHALL receive confirmation and update the post status
5. WHEN the WebSocket connection drops THEN the system SHALL attempt reconnection with exponential backoff

### Requirement 9: Error Handling and User Feedback

**User Story:** As a user, I want clear feedback when operations succeed or fail, so that I understand the system's state and can take appropriate action.

#### Acceptance Criteria

1. WHEN an API request fails THEN the system SHALL display a user-friendly error message using toast notifications
2. WHEN authentication expires THEN the system SHALL redirect to the login page and clear stored credentials
3. WHEN rate limits are exceeded THEN the system SHALL display the retry time and prevent further requests
4. WHEN network errors occur THEN the system SHALL show a connection error message and retry button
5. WHEN operations succeed THEN the system SHALL display success confirmation with relevant details

### Requirement 10: Authentication and Authorization Flow

**User Story:** As a user, I want secure authentication and proper session management, so that my account and data remain protected.

#### Acceptance Criteria

1. WHEN a user logs in THEN the system SHALL send credentials to `/api/v1/auth/login` and store the JWT token
2. WHEN making authenticated requests THEN the system SHALL include the JWT token in the Authorization header
3. WHEN the token expires THEN the system SHALL attempt to refresh using `/api/v1/auth/refresh`
4. WHEN a user logs out THEN the system SHALL clear all stored authentication data and redirect to the login page
5. WHEN accessing protected routes THEN the system SHALL verify authentication status before rendering content
