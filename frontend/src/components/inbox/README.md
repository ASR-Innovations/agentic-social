# Inbox Components

This directory contains all components for the unified social media inbox feature.

## Components

### ConversationCard
Displays a single conversation in the list with:
- Participant avatar and name
- Platform badge
- Message preview
- Sentiment indicator
- Priority badge
- Unread count
- Tags

### ConversationList
Main list view showing all conversations with:
- Search functionality
- Filter tabs (All, Unread, Assigned, Urgent)
- Sort options (Recent, Oldest, Priority, Unread)
- Real-time conversation counts

### MessageThread
Displays the message history for a conversation:
- Chronological message display
- Date separators
- Sender avatars
- Sentiment indicators
- AI-suggested message badges
- Media attachments
- Auto-scroll to latest message

### ReplyComposer
Message composition interface with:
- Rich text input
- Media attachment support
- Reply templates dropdown
- AI assistance button
- Keyboard shortcuts (Cmd/Ctrl + Enter to send)

### ConversationHeader
Header bar for the active conversation with:
- Participant name and platform
- Assign button
- Tag button
- Status dropdown (Open, Pending, Resolved)
- Archive and delete actions

### ConversationSidebar
Right sidebar showing conversation details:
- Participant information
- Conversation stats (first contact, last activity, priority)
- Tag management
- Internal notes
- Conversation summary

### InboxStats
Dashboard metrics showing:
- Average response time
- Resolution rate
- Active conversations count
- Total conversations count

## Features

### Real-time Updates
- WebSocket connection for instant message delivery
- Live conversation list updates
- Push notifications for new messages

### Filtering & Search
- Full-text search across conversations
- Filter by status (unread, assigned, urgent)
- Sort by multiple criteria

### Sentiment Analysis
- Automatic sentiment detection for incoming messages
- Visual sentiment indicators (positive, neutral, negative)
- Priority assignment based on sentiment

### Team Collaboration
- Assign conversations to team members
- Add tags for organization
- Internal notes for context

### Templates
- Pre-defined reply templates
- Quick response options
- Customizable template library

### AI Assistance
- AI-suggested responses
- Sentiment-aware reply generation
- Context-aware recommendations

## Usage Example

```tsx
import { InboxPage } from '@/app/app/inbox/page';

// The page handles all state management and API calls internally
<InboxPage />
```

## API Integration

The inbox components integrate with the following API endpoints:

- `GET /api/inbox/conversations` - Fetch all conversations
- `GET /api/inbox/conversations/:id/messages` - Fetch messages for a conversation
- `POST /api/inbox/conversations/:id/messages` - Send a new message
- `PUT /api/inbox/conversations/:id/tags` - Update conversation tags
- `PUT /api/inbox/conversations/:id/assign` - Assign conversation to team member
- `PUT /api/inbox/conversations/:id/status` - Update conversation status

## WebSocket Events

The inbox listens for the following WebSocket events:

- `new_message` - New message received
- `conversation_updated` - Conversation metadata updated
- `typing_indicator` - User is typing (future enhancement)

## Styling

All components use the glass-morphism design system with:
- Dark theme optimized
- Purple/pink gradient accents
- Smooth transitions and animations
- Responsive layout

## Future Enhancements

- [ ] Typing indicators
- [ ] Message reactions
- [ ] Voice messages
- [ ] Video calls
- [ ] Automated chatbot responses
- [ ] Bulk actions on conversations
- [ ] Advanced filtering (by date range, platform, etc.)
- [ ] Export conversation history
- [ ] SLA tracking and alerts
