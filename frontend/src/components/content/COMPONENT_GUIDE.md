# Content Calendar Component Guide

## Component Hierarchy

```
ContentPage (page.tsx)
├── Header
│   ├── Title & Description
│   └── Create Post Button
├── View Selector (Month/Week/Day)
├── Statistics Badges
├── CalendarFilters
│   ├── Search Input
│   ├── Filter Toggle Button
│   ├── Active Filter Badges
│   └── Filter Panel (collapsible)
│       ├── Platform Filter
│       ├── Status Filter
│       ├── Date Range Filter
│       └── Tags Filter
├── CalendarGrid
│   ├── Calendar Header
│   │   ├── Current Period Display
│   │   ├── Today Button
│   │   └── Navigation Buttons
│   └── Calendar Body
│       ├── Month View (7x5 grid)
│       ├── Week View (7 columns)
│       └── Day View (single column)
├── PostPreviewModal (conditional)
│   ├── Modal Header
│   ├── Platform Badges
│   ├── Schedule Info
│   ├── Content Display
│   ├── Media Type
│   ├── Platform Previews
│   └── Action Buttons
├── PostCreationSidebar (conditional)
│   ├── Sidebar Header
│   ├── PlatformSelector
│   ├── Content Editor
│   ├── MediaUploader (conditional)
│   ├── SchedulePicker (conditional)
│   ├── AI Suggestions
│   ├── Platform-Specific Settings
│   └── Action Buttons
└── BulkActionsToolbar (conditional)
    ├── Selection Controls
    ├── Action Buttons
    └── Reschedule Modal (conditional)
```

## Component Interactions

### 1. Creating a Post
```
User clicks "Create Post"
  → Opens PostCreationSidebar
    → User selects platforms (PlatformSelector)
    → User enters content
    → User clicks "Add Media" (opens MediaUploader)
      → User drags/drops files
      → User confirms upload
    → User clicks schedule (opens SchedulePicker)
      → User selects date/time/timezone
      → User confirms schedule
    → User clicks "Schedule Post"
  → Post added to calendar
  → Toast notification shown
  → Sidebar closes
```

### 2. Viewing a Post
```
User clicks post in calendar
  → Opens PostPreviewModal
    → Displays full post details
    → Shows platform previews
    → User can:
      - Click "Edit" → Opens PostCreationSidebar in edit mode
      - Click "Duplicate" → Creates copy
      - Click "Delete" → Confirms and deletes
```

### 3. Rescheduling a Post (Drag-and-Drop)
```
User drags post card
  → Visual feedback (opacity change)
  → Droppable zones highlight on hover
  → User drops on new date
    → Post scheduledAt updated
    → Calendar re-renders
    → Toast notification shown
```

### 4. Filtering Posts
```
User clicks "Filters" button
  → Filter panel expands
  → User selects filters:
    - Platforms (multi-select)
    - Status (multi-select)
    - Date range
    - Tags
  → Active filters shown as badges
  → Calendar updates in real-time
  → User can click badge to remove filter
  → User can click "Clear" to reset all
```

### 5. Bulk Operations
```
User selects multiple posts (checkbox mode)
  → BulkActionsToolbar appears at bottom
  → Shows selected count
  → User can:
    - Select/Deselect all
    - Reschedule all → Opens date picker
    - Duplicate all → Creates copies
    - Export all → Downloads CSV
    - Delete all → Confirms and deletes
  → Action performed
  → Selection cleared
  → Toolbar hides
```

## State Flow

### Main Page State
```typescript
{
  // View state
  view: 'month' | 'week' | 'day',
  currentDate: Date,
  
  // Data state
  posts: Post[],
  
  // UI state
  selectedPost: Post | null,
  showPreviewModal: boolean,
  showCreationSidebar: boolean,
  editingPost: Post | undefined,
  selectedPostIds: string[],
  
  // Filter state
  filters: {
    search: string,
    platforms: string[],
    status: string[],
    dateRange: { start: Date | null, end: Date | null },
    tags: string[]
  }
}
```

### Component Props Flow
```
ContentPage
  ├─> CalendarGrid
  │     ├─ view (from state)
  │     ├─ currentDate (from state)
  │     ├─ posts (filtered from state)
  │     ├─ onDateChange (updates state)
  │     ├─ onPostClick (opens modal)
  │     └─ onPostDrop (updates post)
  │
  ├─> PostPreviewModal
  │     ├─ post (from state)
  │     ├─ isOpen (from state)
  │     ├─ onClose (updates state)
  │     ├─ onEdit (opens sidebar)
  │     ├─ onDuplicate (creates post)
  │     └─ onDelete (removes post)
  │
  ├─> PostCreationSidebar
  │     ├─ isOpen (from state)
  │     ├─ onClose (updates state)
  │     ├─ onSave (creates/updates post)
  │     └─ editingPost (from state)
  │
  ├─> CalendarFilters
  │     ├─ filters (from state)
  │     ├─ onChange (updates state)
  │     └─ onReset (clears filters)
  │
  └─> BulkActionsToolbar
        ├─ posts (filtered from state)
        ├─ selectedPostIds (from state)
        ├─ onSelectAll (updates state)
        ├─ onDeselectAll (updates state)
        ├─ onBulkDelete (removes posts)
        ├─ onBulkReschedule (updates posts)
        ├─ onBulkDuplicate (creates posts)
        └─ onBulkExport (downloads CSV)
```

## Styling Patterns

### Glass Morphism
```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.glass-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Gradient Primary
```css
.gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Status Colors
```css
.status-draft { background: rgba(107, 114, 128, 0.2); }
.status-scheduled { background: rgba(59, 130, 246, 0.2); }
.status-published { background: rgba(34, 197, 94, 0.2); }
.status-failed { background: rgba(239, 68, 68, 0.2); }
```

### Platform Colors
```css
.platform-instagram { background: linear-gradient(135deg, #f56565, #9f7aea); }
.platform-twitter { background: linear-gradient(135deg, #60a5fa, #2563eb); }
.platform-linkedin { background: linear-gradient(135deg, #2563eb, #1e40af); }
.platform-facebook { background: linear-gradient(135deg, #3b82f6, #4f46e5); }
```

## Responsive Breakpoints

```css
/* Mobile: < 768px */
- Single column layouts
- Stacked filters
- Full-width modals
- Simplified calendar grid

/* Tablet: 768px - 1024px */
- Two column layouts
- Side-by-side filters
- Wider modals
- Compact calendar grid

/* Desktop: > 1024px */
- Multi-column layouts
- Expanded filters
- Optimal modal width
- Full calendar grid
```

## Keyboard Shortcuts (Future)

```
Planned shortcuts:
- N: New post
- /: Focus search
- Esc: Close modal/sidebar
- ←/→: Navigate dates
- M: Month view
- W: Week view
- D: Day view
- T: Go to today
- Ctrl+A: Select all
- Delete: Delete selected
```

## Animation Timings

```css
/* Transitions */
.transition-fast { transition: all 150ms ease; }
.transition-normal { transition: all 300ms ease; }
.transition-slow { transition: all 500ms ease; }

/* Hover effects */
.hover-scale { transform: scale(1.05); }
.hover-lift { transform: translateY(-2px); }

/* Drag feedback */
.dragging { opacity: 0.5; }
.drag-over { background: rgba(59, 130, 246, 0.2); }
```

## Error Handling

### User-Facing Errors
```typescript
// Validation errors
- Empty content → "Content is required"
- No platforms → "Select at least one platform"
- Past date → "Schedule date must be in the future"

// Operation errors
- Delete failed → "Failed to delete post. Please try again."
- Upload failed → "Failed to upload media. Please try again."
- Save failed → "Failed to save post. Please try again."
```

### Success Messages
```typescript
- Post created → "Post created successfully"
- Post updated → "Post updated successfully"
- Post deleted → "Post deleted successfully"
- Post rescheduled → "Post rescheduled successfully"
- Bulk operation → "X post(s) [action] successfully"
```

## Performance Tips

### Optimization Strategies
1. **Memoization**: Use `useMemo` for filtered posts
2. **Callbacks**: Use `useCallback` for event handlers
3. **Virtual Scrolling**: For large post lists (future)
4. **Debouncing**: For search input (future)
5. **Lazy Loading**: For modals and sidebars
6. **Code Splitting**: For heavy components

### Current Performance
- Handles 100+ posts smoothly
- Instant filter updates
- Smooth drag-and-drop
- Fast modal/sidebar transitions

## Browser Support

### Tested Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Required Features
- CSS Grid
- Flexbox
- CSS Backdrop Filter
- ES6+ JavaScript
- HTML5 Drag and Drop API

## Accessibility Status

### Current (Basic)
- ✅ Semantic HTML
- ✅ Button elements
- ✅ Form labels
- ✅ Color contrast

### Planned (Enhanced)
- ⏳ ARIA labels
- ⏳ Keyboard navigation
- ⏳ Focus management
- ⏳ Screen reader support
- ⏳ Reduced motion
- ⏳ High contrast mode

## Testing Strategy

### Unit Tests (Planned)
```typescript
// Component tests
- CalendarGrid renders correctly
- PostPreviewModal displays data
- PlatformSelector toggles selection
- SchedulePicker validates dates
- Filters apply correctly

// Utility tests
- Date calculations
- Filter logic
- Mock data generation
```

### Integration Tests (Planned)
```typescript
// User flows
- Create and schedule post
- Edit existing post
- Drag-and-drop reschedule
- Apply multiple filters
- Bulk operations
```

### E2E Tests (Planned)
```typescript
// Critical paths
- Complete post creation flow
- Calendar navigation
- Filter and search
- Bulk operations
```

## Troubleshooting

### Common Issues

**Issue**: Drag-and-drop not working
- Check react-beautiful-dnd is installed
- Verify DragDropContext wraps droppable areas
- Ensure unique droppableId and draggableId

**Issue**: Dates showing incorrectly
- Check timezone settings
- Verify date-fns format strings
- Ensure Date objects are valid

**Issue**: Filters not applying
- Check filter logic in main page
- Verify filter state updates
- Ensure posts array is being filtered

**Issue**: Modal/Sidebar not closing
- Check state management
- Verify onClose callbacks
- Ensure proper event handling

## Future Enhancements

### Phase 1 (Next Sprint)
- [ ] API integration
- [ ] Real-time updates
- [ ] Loading states
- [ ] Error boundaries

### Phase 2 (Future)
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements
- [ ] Performance optimizations
- [ ] Advanced animations

### Phase 3 (Long-term)
- [ ] Collaborative features
- [ ] Template library
- [ ] Advanced analytics
- [ ] Mobile app

---

**Last Updated**: January 2024
**Maintainer**: Development Team
**Status**: Active Development
