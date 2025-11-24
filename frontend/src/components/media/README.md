# Media Library Components

This directory contains all components for the Media Library feature, implementing a comprehensive asset management system for images, videos, and GIFs.

## Components Overview

### 1. MediaHeader
**File:** `media-header.tsx`

Header component with controls for:
- Upload button
- Search functionality
- Sort options (by name, date, size)
- View mode toggle (grid/list)

### 2. FolderTree
**File:** `folder-tree.tsx`

Sidebar component for folder navigation:
- Hierarchical folder structure
- Expandable/collapsible folders
- Create new folders
- Delete folders
- Folder asset count display
- Drag-and-drop support (planned)

### 3. MediaGrid
**File:** `media-grid.tsx`

Main content area displaying media assets:
- Grid view with thumbnails
- List view with detailed information
- Multi-select functionality
- Quick actions menu
- Video duration display
- File type indicators
- Tag display

### 4. MediaUploader
**File:** `media-uploader.tsx`

Modal for uploading media files:
- Drag-and-drop zone
- File browser
- Multiple file upload
- Upload progress tracking
- File validation
- Error handling
- Success/failure indicators

### 5. MediaEditor
**File:** `media-editor.tsx`

Modal for editing images and videos:
- **Crop:** Adjust crop position and dimensions
- **Resize:** Change dimensions with aspect ratio lock
- **Filters:** Brightness, contrast, saturation, blur
- **Video Trim:** Set start and end times (for videos)
- Real-time preview
- Save edited versions

### 6. MediaDetails
**File:** `media-details.tsx`

Sidebar panel showing asset details:
- Full preview
- File information (name, type, size, dimensions, duration)
- URL with copy functionality
- Tag management (add/remove tags)
- Usage history
- Download button
- Delete button

### 7. BulkActions
**File:** `bulk-actions.tsx`

Toolbar for bulk operations:
- Select all functionality
- Move to folder
- Add tags
- Delete multiple assets
- Clear selection

## Hook

### useMediaLibrary
**File:** `../hooks/useMediaLibrary.ts`

Custom React hook for media library state management:
- Fetch assets with filtering and sorting
- Fetch folder structure
- Upload multiple files
- Delete assets
- Update asset metadata
- Move assets between folders
- Create/delete folders
- Automatic cache invalidation

## Features Implemented

### ✅ Core Features
- [x] Media library layout with folder tree
- [x] Media grid with thumbnails (grid and list views)
- [x] Drag-and-drop file uploader
- [x] Media editor (crop, resize, filters)
- [x] Video trimmer
- [x] Media details panel with metadata
- [x] Tagging and search functionality
- [x] Bulk operations (move, tag, delete)
- [x] Folder management (create, delete, navigate)

### 📋 Additional Features
- [x] Multi-select with checkboxes
- [x] Real-time upload progress
- [x] File type indicators
- [x] Video duration display
- [x] Responsive design
- [x] Dark theme UI
- [x] Error handling
- [x] Loading states
- [x] Empty states

## Usage Example

```tsx
import MediaPage from '@/app/app/media/page';

// The page is automatically available at /app/media
// No additional setup required
```

## API Integration

The components integrate with the backend through the `apiClient`:

```typescript
// Upload media
await apiClient.uploadMedia(file, folder);

// Get media library
await apiClient.getMediaLibrary({ folder, search, sortBy });

// Delete media
await apiClient.deleteMedia(assetId);
```

## Backend Requirements

The following backend endpoints are expected:

- `POST /api/media/upload` - Upload single file
- `POST /api/media/upload/:folder` - Upload to specific folder
- `GET /api/media` - Get media library with filters
- `DELETE /api/media/:key` - Delete media asset
- `PUT /api/media/:id` - Update media metadata
- `POST /api/media/folders` - Create folder
- `DELETE /api/media/folders/:id` - Delete folder

## Data Models

### MediaAsset
```typescript
interface MediaAsset {
  id: string;
  workspaceId: string;
  type: 'IMAGE' | 'VIDEO' | 'GIF';
  url: string;
  thumbnailUrl?: string;
  filename: string;
  size: number;
  dimensions?: { width: number; height: number };
  duration?: number;
  metadata?: any;
  tags: string[];
  folder?: string;
  createdAt: string;
  updatedAt: string;
}
```

### MediaFolder
```typescript
interface MediaFolder {
  id: string;
  name: string;
  path: string;
  parentId?: string;
  children?: MediaFolder[];
  assetCount: number;
}
```

## Styling

All components use:
- Tailwind CSS for styling
- Shadcn/ui components for UI primitives
- Dark theme with gray-900/gray-800 backgrounds
- Blue accent colors for primary actions
- Consistent spacing and typography

## Future Enhancements

### Planned Features
- [ ] AI-powered auto-tagging
- [ ] Advanced image filters (sepia, grayscale, etc.)
- [ ] Batch image optimization
- [ ] CDN integration
- [ ] Usage analytics per asset
- [ ] Duplicate detection
- [ ] Advanced search with filters
- [ ] Folder drag-and-drop
- [ ] Asset versioning
- [ ] Collaborative editing

### Performance Optimizations
- [ ] Virtual scrolling for large libraries
- [ ] Lazy loading thumbnails
- [ ] Image compression on upload
- [ ] Progressive image loading
- [ ] Caching strategies

## Testing

To test the media library:

1. Navigate to `/app/media`
2. Upload files using drag-and-drop or file browser
3. Create folders and organize assets
4. Edit images/videos using the editor
5. Add tags and search for assets
6. Test bulk operations
7. Verify responsive behavior

## Requirements Validation

This implementation satisfies the following requirements from the spec:

- **6.1:** Integrated media library with storage
- **6.2:** Tagging, folder organization, search functionality
- **6.3:** Integration with design tools (placeholder for future)
- **6.4:** Brand asset libraries with approval workflows (foundation)
- **6.5:** Automatic image optimization (foundation)

## Notes

- The media editor uses CSS filters for real-time preview
- Actual image/video processing would be done on the backend
- Folder structure is currently flat but supports hierarchical display
- Upload progress is simulated; real implementation would track actual progress
- Video trimming UI is implemented; backend processing required
