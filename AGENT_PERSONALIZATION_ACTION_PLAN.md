# Agent Personalization & Social Account Integration - Action Plan

## Overview
Link agents to social accounts and create instant + detailed agent creation modes with chat-based personalization.

## Phase 1: Backend - Database Schema Update

### 1.1 Update Agent Entity
- Add `socialAccountId` field (nullable, UUID, foreign key to social_accounts)
- Add index on `socialAccountId`
- Add relation to SocialAccount entity

### 1.2 Create Migration
- Create new migration file to add `socialAccountId` column
- Add foreign key constraint
- Add index

### 1.3 Update DTOs
- Add `socialAccountId` to CreateAgentDto (optional)
- Add `socialAccountId` to UpdateAgentDto (optional)
- Keep it optional so agents can exist without social accounts

### 1.4 Update Service
- Modify `createAgent` to accept and validate `socialAccountId`
- Add method to get agents by social account
- Validate social account belongs to tenant

## Phase 2: Backend - New Endpoints

### 2.1 Instant Creation Endpoint
- POST `/api/v1/agents/instant`
- Body: `{ socialAccountId, type }`
- Auto-generates name, uses defaults for everything
- Returns created agent

### 2.2 Chat-Based Personalization Endpoint
- POST `/api/v1/agents/personalize`
- Body: `{ agentId, message }`
- Uses AI to parse user intent and update agent config
- Returns updated agent + AI response

### 2.3 Get Agents by Social Account
- GET `/api/v1/agents?socialAccountId=xxx`
- Returns all agents for a specific social account

## Phase 3: Frontend - Type Definitions

### 3.1 Update API Types
- Add `socialAccountId` to Agent interface
- Add instant creation request/response types
- Add personalization chat types

### 3.2 Update API Client
- Add `createAgentInstant(socialAccountId, type)` method
- Add `personalizeAgent(agentId, message)` method
- Add `getAgentsBySocialAccount(socialAccountId)` method

## Phase 4: Frontend - AI Hub Page Redesign

### 4.1 Main Layout
- Show connected social accounts at top
- For each social account, show its agents
- Add "Create Agent" button per social account

### 4.2 Creation Mode Selection Modal
- Modal with two options:
  - **Instant Mode**: "Quick Setup" - 1 click, uses defaults
  - **Detailed Mode**: "Customize Everything" - opens chat interface

### 4.3 Instant Mode Flow
1. User clicks "Quick Setup"
2. Select agent type (content_creator, strategy, etc.)
3. Click "Create"
4. Agent created with defaults
5. Show success + option to personalize later

### 4.4 Detailed Mode - Chat Interface
1. User clicks "Customize Everything"
2. Opens chat modal
3. AI asks questions:
   - "What type of agent do you want?"
   - "What tone should it use?"
   - "How creative should it be?"
   - "What's your brand voice?"
4. User answers in natural language
5. AI parses responses and creates agent
6. Shows preview before final creation

### 4.5 Agent Cards
- Show agent name, type, status
- Show linked social account
- Quick actions: Edit, Activate/Deactivate, Delete
- Click to open personalization chat

## Phase 5: Frontend - Personalization Chat Component

### 5.1 Chat UI Component
- Message list (user + AI messages)
- Input field for user messages
- Send button
- Loading state while AI processes
- Preview panel showing current agent config

### 5.2 Chat Logic
- Send user message to backend
- Backend uses AI to parse intent
- Backend updates agent config
- Returns updated config + AI response
- Update preview panel in real-time

### 5.3 Example Conversations
```
User: "Make it more creative and funny"
AI: "I've increased creativity to 0.9 and humor to 0.8. Your agent will now generate more creative and humorous content!"

User: "Use a professional tone"
AI: "Updated! Your agent now uses a professional tone with high formality (0.9) and low humor (0.2)."

User: "Switch to GPT-4"
AI: "Changed AI provider to OpenAI GPT-4. This will provide higher quality outputs but may cost more."
```

## Phase 6: Additional Features

### 6.1 Agent Templates
- Pre-configured agent templates
- "Twitter Growth Expert"
- "Instagram Engagement Specialist"
- "LinkedIn Thought Leader"
- One-click creation from template

### 6.2 Agent Cloning
- Clone existing agent to another social account
- Copies all personality settings
- Useful for multi-account management

### 6.3 Bulk Operations
- Activate/deactivate multiple agents
- Update settings across multiple agents
- Useful for managing many accounts

## Implementation Order

1. ✅ Backend schema update (migration + entity)
2. ✅ Backend DTOs update
3. ✅ Backend service methods
4. ✅ Backend controller endpoints
5. ✅ Frontend types
6. ✅ Frontend API client
7. ✅ AI Hub page redesign
8. ✅ Instant mode implementation
9. ✅ Chat interface component
10. ✅ Detailed mode implementation
11. ✅ Testing & polish

## Success Criteria

- ✅ Agents can be linked to social accounts
- ✅ Users can create agents in 1 click (instant mode)
- ✅ Users can customize agents via chat (detailed mode)
- ✅ Users can personalize existing agents via chat
- ✅ UI shows agents grouped by social account
- ✅ All CRUD operations work correctly
- ✅ Chat AI correctly parses user intent
- ✅ Real-time preview of agent config changes

## Technical Notes

### AI Personalization Logic
The backend will use a simple AI prompt to parse user messages:
```
You are helping configure an AI agent. Parse the user's message and extract:
- tone (friendly, professional, casual, etc.)
- style (creative, analytical, conversational, etc.)
- creativity (0-1)
- formality (0-1)
- humor (0-1)
- aiProvider (openai, claude, gemini, deepseek)
- model (specific model name)
- brandVoice (any specific brand voice instructions)

Return JSON with only the fields that should be updated.
```

### Database Considerations
- `socialAccountId` is nullable to support agents without social accounts
- Foreign key ensures referential integrity
- Cascade delete: when social account deleted, agents remain but socialAccountId set to null

### Frontend State Management
- Use React Query for agent data
- Optimistic updates for instant feedback
- Real-time updates via polling or websockets (future)
