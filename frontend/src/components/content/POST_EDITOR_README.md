# Post Editor Component

## Overview

The `PostEditor` component is a rich text editor specifically designed for social media content creation. It provides intelligent features like character counting per platform, hashtag/mention autocomplete, link preview, media attachment preview, and platform-specific customization.

## Features

### 1. Rich Text Editing
- Multi-line textarea with proper formatting
- Real-time character counting
- Platform-specific character limits
- Visual feedback for character limit violations

### 2. Character Counter with Platform Limits
The editor tracks character counts for each selected platform:
- **Twitter/X**: 280 characters
- **Instagram**: 2,200 characters
- **Facebook**: 63,206 characters
- **LinkedIn**: 3,000 characters
- **TikTok**: 2,200 characters
- **Threads**: 500 characters
- **Pinterest**: 500 characters

When multiple platforms are selected, the editor shows individual counts for each platform and highlights any that exceed their limits.

### 3. Hashtag Autocomplete
- Type `#` to trigger hashtag suggestions
- Filters popular hashtags based on your input
- Click or press Enter to insert a hashtag
- Automatically adds a space after insertion
- Shows extracted hashtags as badges below the editor

**Popular Hashtags Included:**
- marketing, socialmedia, business, entrepreneur, startup
- technology, innovation, digital, branding, contentmarketing
- smallbusiness, success, motivation, inspiration, growth
- leadership, strategy, tips, trending, viral

### 4. Mention Autocomplete
- Type `@` to trigger mention suggestions
- Filters user mentions based on your input
- Click to insert a mention
- Automatically adds a space after insertion
- Shows extracted mentions as badges below the editor

### 5. Link Preview
- Automatically detects URLs in content
- Fetches and displays link metadata (title, description, image)
- Shows loading state while fetching
- Displays preview card with thumbnail and link details

### 6. Media Attachment Preview
- Shows thumbnails of attached images/videos
- Displays count of total attachments
- Grid layout for up to 4 previews
- Shows "+N" indicator for additional files

### 7. Instagram First Comment
- Automatically shows when Instagram is selected
- Separate textarea for first comment content
- Useful for adding hashtags without cluttering the main caption
- Includes helpful tip about using first comment for hashtags

### 8. Post Validation
- Real-time validation of content
- Shows error messages for:
  - Character limit violations per platform
  - Required field validation
  - Invalid format detection
- Visual error indicators with AlertCircle icon

### 9. Platform-Specific Customization
- Displays info about automatic platform adaptation
- Handles different character limits
- Adapts hashtag placement
- Manages platform-specific requirements

## Usage

```tsx
import { PostEditor } from '@/components/content/post-editor';
import { SocialPlatform } from '@/types';

function MyComponent() {
  const [content, setContent] = useState('');
  const [firstComment, setFirstComment] = useState('');
  const [linkPreview, setLinkPreview] = useState(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([
    SocialPlatform.INSTAGRAM,
    SocialPlatform.TWITTER,
  ]);

  const handleAIGenerate = () => {
    // Call AI generation API
    setContent('AI generated content...');
  };

  const handleLinkDetected = async (url: string) => {
    // Fetch link metadata
    const metadata = await fetchLinkMetadata(url);
    setLinkPreview(metadata);
  };

  return (
    <PostEditor
      value={content}
      onChange={setContent}
      selectedPlatforms={selectedPlatforms}
      onAIGenerate={handleAIGenerate}
      firstComment={firstComment}
      onFirstCommentChange={setFirstComment}
      linkPreview={linkPreview}
      onLinkDetected={handleLinkDetected}
      mediaFiles={mediaFiles}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string` | Yes | Current content value |
| `onChange` | `(value: string) => void` | Yes | Callback when content changes |
| `selectedPlatforms` | `SocialPlatform[]` | Yes | Array of selected social platforms |
| `onAIGenerate` | `() => void` | No | Callback for AI content generation |
| `firstComment` | `string` | No | Instagram first comment value |
| `onFirstCommentChange` | `(value: string) => void` | No | Callback when first comment changes |
| `linkPreview` | `LinkPreviewData` | No | Link preview metadata |
| `onLinkDetected` | `(url: string) => void` | No | Callback when URL is detected |
| `mediaFiles` | `File[]` | No | Array of attached media files |
| `className` | `string` | No | Additional CSS classes |

## Types

```typescript
interface LinkPreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  loading?: boolean;
}

interface ValidationError {
  type: 'character_limit' | 'required_field' | 'invalid_format';
  message: string;
  platform?: SocialPlatform;
}
```

## Keyboard Shortcuts

- **Escape**: Close hashtag/mention suggestions
- **#**: Trigger hashtag autocomplete
- **@**: Trigger mention autocomplete

## Styling

The component uses Tailwind CSS with custom glass-morphism styles:
- `glass-input`: Glassmorphic input styling
- `glass-card`: Glassmorphic card styling
- Dark theme optimized with proper contrast

## Accessibility

- Proper label associations
- Keyboard navigation support
- Screen reader friendly
- Focus management
- Error announcements

## Future Enhancements

1. **Rich Text Formatting**: Bold, italic, underline support
2. **Emoji Picker**: Built-in emoji selector
3. **GIF Integration**: Search and insert GIFs
4. **Spell Check**: Real-time spelling and grammar checking
5. **Content Templates**: Pre-built content templates
6. **Scheduled Hashtags**: Time-based hashtag suggestions
7. **Sentiment Analysis**: Real-time sentiment feedback
8. **Readability Score**: Content readability analysis
9. **A/B Testing**: Content variation suggestions
10. **Multi-language Support**: Translation and localization

## Requirements Validation

This component satisfies the following requirements from the specification:

- **Requirement 1.1**: Multi-platform content publishing support
- **Requirement 1.2**: Platform-specific content adaptation (character limits, hashtag placement)
- **Requirement 1.4**: Platform-specific customization (Instagram first comment)

## Testing

To test the component:

1. **Character Counting**: Type content and verify counts update correctly
2. **Hashtag Autocomplete**: Type `#` and verify suggestions appear
3. **Mention Autocomplete**: Type `@` and verify suggestions appear
4. **Link Detection**: Paste a URL and verify preview loads
5. **Platform Limits**: Select different platforms and verify limits change
6. **Validation**: Exceed character limits and verify error messages
7. **First Comment**: Select Instagram and verify first comment field appears
8. **Media Preview**: Add media files and verify thumbnails display

## Performance Considerations

- Debounced link preview fetching
- Memoized character count calculations
- Efficient regex matching for hashtags/mentions
- Lazy loading of autocomplete suggestions
- Optimized re-renders with proper state management

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with touch optimization
