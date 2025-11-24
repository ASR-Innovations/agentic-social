# Content Calendar Components

This directory contains all components for the Content Calendar feature, implementing a comprehensive social media content scheduling and management system.

## Components Overview

### 1. CalendarGrid (`calendar-grid.tsx`)
The main calendar component that displays posts in month, week, or day views with drag-and-drop functionality.

**Features:**
- Three view modes: Month, Week, Day
- Drag-and-drop post rescheduling using react-beautiful-dnd
- Visual indicators for post status (draft, scheduled, published, failed)
- Color-coded posts by status
- Navigation controls (previous/next, today button)
- Responsive grid layout

**Props:**
- `view`: Current calendar view ('month' | 'week' | 'day')
- `currentDate`: Currently displayed date
- `posts`: Array of posts to display
- `onDateChange`: Callback when date navigation occurs
- `onPostClick`: Callback when a post is clicked
- `onPostDrop`: Callback when a post is dragged to a new date

### 2. PostPreviewModal (`post-preview-modal.tsx`)
Modal dialog for previewing post details with platform-specific previews.

**Features:**
- Full post content display
- Platform-specific preview cards
- Schedule information (date and time)
- Media type indicators
- AI-generated badge
- Action buttons (Edit, Duplicate, Delete)

**Props:**
- `post`: Post object to preview
- `isOpen`: Modal visibility state
- `onClose`: Callback to close modal
- `onEdit`: Callback to edit post
- `onDuplicate`: Callback to duplicate post
- `onDelete`: Callback to delete post

### 3. PostCreationSidebar (`post-creation-sidebar.tsx`)
Sliding sidebar for creating and editing posts.

**Features:**
- Rich text content editor with character counter
- Platform multi-selector
- Media uploader integration
- Schedule picker with timezone support
- AI content generation button
- Platform-specific settings (Instagram first comment, Twitter threads)
- AI suggestions panel
- Draft and schedule actions

**Props:**
- `isOpen`: Sidebar visibility state
- `onClose`: Callback to close sidebar
- `onSave`: Callback when post is saved
- `editingPost`: Optional post object for editing mode

### 4. MediaUploader (`media-uploader.tsx`)
Drag-and-drop media upload component.

**Features:**
- Drag-and-drop file upload
- Multiple file selection
- File type validation (images and videos)
- File preview with size information
- Upload progress indication
- File removal capability

**Props:**
- `onFilesSelected`: Callback when files are selected
- `onClose`: Callback to close uploader
- `maxFiles`: Maximum number of files (default: 10)
- `acceptedFileTypes`: Array of accepted MIME types

### 5. PlatformSelector (`platform-selector.tsx`)
Multi-select component for choosing social media platforms.

**Features:**
- Visual platform cards with icons
- Multi-select functionality
- Platform-specific branding colors
- Selected platforms summary
- Support for Instagram, Twitter, LinkedIn, Facebook, YouTube, TikTok

**Props:**
- `selectedPlatforms`: Array of selected platform IDs
- `onChange`: Callback when selection changes

### 6. SchedulePicker (`schedule-picker.tsx`)
Date and time picker with timezone support and AI recommendations.

**Features:**
- Date picker with minimum date validation
- Time picker (24-hour format)
- Timezone selector with major timezones
- Quick schedule options (Now, In 1 hour, Tomorrow, etc.)
- AI-recommended optimal posting time
- Schedule preview

**Props:**
- `selectedDate`: Currently selected date
- `onChange`: Callback when date changes
- `onClose`: Callback to close picker

### 7. BulkActionsToolbar (`bulk-actions-toolbar.tsx`)
Floating toolbar for bulk operations on multiple posts.

**Features:**
- Select all/deselect all functionality
- Bulk reschedule with date picker
- Bulk duplicate
- Bulk export to CSV
- Bulk delete with confirmation
- Selected count indicator
- Floating bottom-center positioning

**Props:**
- `posts`: All available posts
- `selectedPostIds`: Array of selected post IDs
- `onSelectAll`: Callback to select all posts
- `onDeselectAll`: Callback to deselect all posts
- `onBulkDelete`: Callback for bulk delete
- `onBulkReschedule`: Callback for bulk reschedule
- `onBulkDuplicate`: Callback for bulk duplicate
- `onBulkExport`: Callback for bulk export

### 8. CalendarFilters (`calendar-filters.tsx`)
Advanced filtering system for posts.

**Features:**
- Text search across post content
- Platform filter (multi-select)
- Status filter (draft, scheduled, published, failed)
- Date range filter
- Tag filter with dynamic tag addition
- Active filter badges with removal
- Collapsible filter panel
- Filter count indicator
- Reset all filters

**Props:**
- `filters`: Current filter state object
- `onChange`: Callback when filters change
- `onReset`: Callback to reset all filters

## Data Types

### Post
```typescript
interface Post {
  id: string;
  content: string;
  platforms: string[];
  scheduledAt: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  mediaType?: 'image' | 'video' | 'carousel';
  aiGenerated?: boolean;
}
```

### CalendarFilters
```typescript
interface CalendarFilters {
  search: string;
  platforms: string[];
  status: string[];
  dateRange: { start: Date | null; end: Date | null };
  tags: string[];
}
```

## Usage Example

```tsx
import { useState } from 'react';
import { CalendarGrid } from '@/components/content/calendar-grid';
import { PostPreviewModal } from '@/components/content/post-preview-modal';
import { PostCreationSidebar } from '@/components/content/post-creation-sidebar';

function ContentCalendar() {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showCreation, setShowCreation] = useState(false);

  return (
    <div>
      <CalendarGrid
        view={view}
        currentDate={currentDate}
        posts={posts}
        onDateChange={setCurrentDate}
        onPostClick={(post) => {
          setSelectedPost(post);
          setShowPreview(true);
        }}
        onPostDrop={(postId, newDate) => {
          // Handle post rescheduling
        }}
      />
      
      <PostPreviewModal
        post={selectedPost}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onEdit={(post) => {
          // Handle edit
        }}
        onDuplicate={(post) => {
          // Handle duplicate
        }}
        onDelete={(post) => {
          // Handle delete
        }}
      />
      
      <PostCreationSidebar
        isOpen={showCreation}
        onClose={() => setShowCreation(false)}
        onSave={(post) => {
          // Handle save
        }}
      />
    </div>
  );
}
```

## Styling

All components use the application's design system with:
- Glass morphism effects (`glass-card`, `glass-button`)
- Gradient primary buttons (`gradient-primary`)
- Consistent color scheme (white text on dark backgrounds)
- Responsive layouts
- Smooth transitions and animations
- Hover effects

## Dependencies

- `react-beautiful-dnd`: Drag-and-drop functionality
- `date-fns`: Date manipulation and formatting
- `react-dropzone`: File upload
- `lucide-react`: Icons
- `react-hot-toast`: Toast notifications
- `@/components/ui/*`: Shadcn UI components

## Future Enhancements

- [ ] Real-time collaboration indicators
- [ ] Post templates library
- [ ] Advanced AI content suggestions
- [ ] Calendar sync with Google Calendar/Outlook
- [ ] Post performance predictions
- [ ] Automated content recycling
- [ ] Team member assignment
- [ ] Approval workflow integration
- [ ] Multi-language support
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
