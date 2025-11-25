
# 🚀 MVP Integration Tasks - Execute One by One

## Goal
Complete all frontend-backend integrations so you only need to add API keys and test.

---

## ✅ Task 1: Integrate AI Hub Page with React Query Hooks
**File:** `frontend/src/app/app/ai-hub/page.tsx`
**Status:** 🔄 IN PROGRESS
**Time:** 15 minutes

### What to do:
- Replace mock data with useAgents() hook
- Replace mock statistics with useAgentStatistics() hook
- Connect toggle buttons to activate/deactivate mutations
- Add loading states
- Add error handling

---

## ✅ Task 2: Create Content Generation Hook
**File:** `frontend/src/hooks/useContent.ts`
**Status:** ⏳ TODO
**Time:** 10 minutes

### What to do:
- Create useGenerateContent() mutation
- Create useCreatePost() mutation
- Create useUploadMedia() mutation
- Export from hooks/index.ts

---

## ✅ Task 3: Integrate Content Page with AI Generation
**File:** `frontend/src/app/app/content/page.tsx`
**Status:** ⏳ TODO
**Time:** 20 minutes

### What to do:
- Add AI generation form
- Connect to useGenerateContent() hook
- Add post creation form
- Connect to useCreatePost() hook
- Add media upload
- Add loading/error states

---

## ✅ Task 4: Add Twitter OAuth to Settings Page
**File:** `frontend/src/app/app/settings/page.tsx`
**Status:** ⏳ TODO
**Time:** 15 minutes

### What to do:
- Add "Connect Twitter" button
- Implement OAuth flow
- Display connected accounts
- Add disconnect functionality
- Show connection status

---

## ✅ Task 5: Update .env.example with All Required Variables
**File:** `.env.example`
**Status:** ⏳ TODO
**Time:** 5 minutes

### What to do:
- Add all required environment variables
- Add comments explaining each
- Add example values
- Document where to get API keys

---

## ✅ Task 6: Create Frontend .env.example
**File:** `frontend/.env.example`
**Status:** ⏳ TODO
**Time:** 3 minutes

### What to do:
- Add NEXT_PUBLIC_API_URL
- Add NEXT_PUBLIC_WS_URL
- Add comments

---

## ✅ Task 7: Fix Backend API Endpoint Routing
**File:** `src/agentflow/agentflow.controller.ts`
**Status:** ⏳ TODO
**Time:** 5 minutes

### What to do:
- Ensure routes match frontend expectations
- Add proper decorators
- Test endpoint accessibility

---

## ✅ Task 8: Create Startup Verification Script
**File:** `scripts/verify-integration.ts`
**Status:** ⏳ TODO
**Time:** 10 minutes

### What to do:
- Check all required env variables
- Verify database connection
- Test API endpoints
- Verify agent initialization

---

## Total Estimated Time: ~90 minutes

---

## Execution Order:
1. Task 1 - AI Hub integration (most critical)
2. Task 2 - Content hooks
3. Task 3 - Content page integration
4. Task 4 - Settings OAuth
5. Task 5 & 6 - Environment files
6. Task 7 - Backend routing
7. Task 8 - Verification script

---

## After Completion, You Need To:
1. Copy `.env.example` to `.env`
2. Add your API keys:
   - Twitter OAuth credentials
   - OpenAI API key
   - Anthropic API key (optional)
   - PostgreSQL connection string
3. Run `npm run start:dev` (backend)
4. Run `cd frontend && npm run dev` (frontend)
5. Test the complete flow!

---

**Let's execute these tasks one by one!**
