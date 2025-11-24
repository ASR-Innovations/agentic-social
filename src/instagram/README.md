# Instagram-Specific Features

This module provides specialized features for Instagram, implementing all requirements from Requirement 17 of the platform specification.

## Overview

The Instagram module delivers platform-specific functionality that goes beyond basic posting, including:

- **Visual Grid Preview**: See how posts will appear in your Instagram feed before publishing
- **Drag-and-Drop Grid Rearrangement**: Reorder scheduled posts to optimize visual flow
- **Story Scheduling with Stickers**: Schedule Stories with polls, questions, countdowns, and links
- **Aesthetic Consistency Scoring**: AI-powered analysis of color harmony and theme consistency
- **Instagram Shop Integration**: Create shoppable posts with product tagging
- **Reels Optimization**: Specialized tools for creating and optimizing Instagram Reels

## Features

### 1. Visual Grid Preview (Requirement 17.1)

The grid preview feature allows users to visualize how their posts will appear in the Instagram feed grid layout.

**Endpoints:**
- `GET /instagram/grid/preview` - Get grid preview with aesthetic analysis
- `PUT /instagram/grid/rearrange` - Rearrange posts via drag-and-drop

**Features:**
- Shows up to N posts in grid format (default 9)
- Displays published and scheduled posts
- Includes aesthetic scoring (0-100)
- Color harmony analysis with dominant palette
- Theme consistency detection
- Visual suggestions for improvement

**Example Request:**
```typescript
GET /instagram/grid/preview?accountId=account-123&count=12
```

**Example Response:**
```json
{
  "posts": [
    {
      "id": "post-1",
      "mediaUrl": "https://...",
      "type": "image",
      "position": 0,
      "dominantColors": ["#FF6B6B", "#4ECDC4"],
      "publishedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "aestheticScore": 85,
  "colorHarmony": {
    "score": 88,
    "dominantPalette": ["#FF6B6B", "#4ECDC4", "#45B7D1"],
    "suggestions": ["Great color harmony! Your grid has a cohesive look"]
  },
  "themeConsistency": {
    "score": 82,
    "detectedThemes": ["warm", "vibrant"],
    "suggestions": ["Excellent theme consistency!"]
  }
}
```

### 2. Drag-and-Drop Grid Rearrangement (Requirement 17.1)

Reorder scheduled posts to optimize the visual flow of your Instagram grid.

**How it works:**
- Only affects scheduled posts (not published)
- Updates scheduled times based on new order
- Maintains 24-hour spacing between posts
- Preserves all post content and settings

**Example Request:**
```typescript
PUT /instagram/grid/rearrange
{
  "accountId": "account-123",
  "postOrder": ["post-3", "post-1", "post-2"]
}
```

### 3. First Comment Scheduling (Requirement 17.3)

Schedule a first comment to be posted immediately after your main post. Useful for:
- Adding hashtags without cluttering captions
- Including links
- Providing additional context

**Implementation:**
First comments are stored in the post content and automatically posted after the main post publishes.

```typescript
{
  "content": {
    "text": "Main caption here",
    "firstComment": "#hashtags #go #here"
  }
}
```

### 4. Story Scheduling with Stickers (Requirement 17.2)

Create and schedule Instagram Stories with interactive stickers.

**Endpoints:**
- `POST /instagram/stories` - Create and publish Story immediately
- `POST /instagram/stories/schedule` - Schedule Story for later
- `GET /instagram/stories/:storyId/analytics` - Get Story performance metrics

**Supported Stickers:**
- **Poll**: Two-option polls with custom question
- **Question**: Open-ended question sticker
- **Countdown**: Countdown to specific date/time
- **Link**: Swipe-up links (requires permissions)
- **Mentions**: Tag other users
- **Hashtags**: Add hashtag stickers

**Example Request:**
```typescript
POST /instagram/stories/schedule
{
  "accountId": "account-123",
  "mediaUrl": "https://...",
  "mediaType": "image",
  "pollSticker": {
    "question": "Which do you prefer?",
    "options": ["Option A", "Option B"],
    "x": 0.5,
    "y": 0.7
  },
  "linkSticker": {
    "url": "https://example.com",
    "text": "Learn More"
  },
  "hashtags": ["#brand", "#product"],
  "scheduledAt": "2024-01-20T15:00:00Z"
}
```

### 5. Aesthetic Consistency Scoring (Requirement 17.4)

AI-powered analysis of your Instagram aesthetic to maintain brand consistency.

**Endpoints:**
- `POST /instagram/aesthetic/analyze` - Analyze account aesthetic
- `POST /instagram/aesthetic/color-palette` - Extract colors from image

**Metrics Analyzed:**
- **Overall Score** (0-100): Combined aesthetic rating
- **Color Harmony** (0-100): Consistency of color palette
- **Theme Consistency** (0-100): Visual style coherence
- **Visual Balance** (0-100): Content variety and posting rhythm

**Color Analysis:**
- Dominant color palette extraction
- Color temperature detection (warm/cool)
- Brightness and saturation analysis
- Complementary color suggestions

**Theme Detection:**
- Warm-toned, cool-toned, vibrant, muted, bright, dark
- Mixed theme identification
- Consistency scoring

**Example Request:**
```typescript
POST /instagram/aesthetic/analyze
{
  "accountId": "account-123",
  "postIds": ["post-1", "post-2", "post-3"] // Optional
}
```

**Example Response:**
```json
{
  "score": 85,
  "colorHarmony": 88,
  "themeConsistency": 82,
  "visualBalance": 85,
  "dominantPalette": ["#FF6B6B", "#4ECDC4", "#45B7D1"],
  "detectedThemes": ["warm", "vibrant"],
  "suggestions": [
    "Great color harmony! Your grid has a cohesive look",
    "Excellent theme consistency!"
  ],
  "colorDistribution": [
    { "color": "#FF6B6B", "percentage": 35 },
    { "color": "#4ECDC4", "percentage": 28 }
  ]
}
```

### 6. Instagram Shop Integration (Requirement 17.5)

Create shoppable posts and manage Instagram Shop.

**Endpoints:**
- `POST /instagram/shop/posts` - Create shoppable post
- `POST /instagram/shop/tag-product` - Tag product in existing post
- `POST /instagram/shop/sync` - Sync with commerce platform
- `GET /instagram/shop/products` - Get shop products
- `GET /instagram/shop/posts/:postId/analytics` - Shopping analytics

**Features:**
- Product tagging in images (up to 5 per image)
- Carousel post support
- Shopify/WooCommerce/BigCommerce integration
- Shopping analytics (views, clicks, purchases)

**Example Request:**
```typescript
POST /instagram/shop/posts
{
  "accountId": "account-123",
  "content": "Check out our new collection!",
  "mediaUrls": ["https://..."],
  "productTags": [
    {
      "productId": "prod-123",
      "x": 0.3,
      "y": 0.5,
      "mediaIndex": 0
    }
  ],
  "scheduledAt": "2024-01-20T12:00:00Z"
}
```

### 7. Reels-Specific Optimization (Requirement 17.5)

Specialized tools for Instagram Reels creation and optimization.

**Endpoints:**
- `POST /instagram/reels` - Create Reel
- `POST /instagram/reels/optimize` - Optimize video for Reels
- `GET /instagram/reels/:postId/analytics` - Reel analytics
- `GET /instagram/reels/recommendations` - Get optimization tips
- `GET /instagram/reels/best-practices` - Best practices guide

**Optimization Features:**
- Aspect ratio conversion (9:16, 1:1, 4:5)
- Duration trimming (3-90 seconds)
- Auto-caption generation
- Thumbnail extraction
- Bitrate and codec optimization

**Analytics Tracked:**
- Plays, reach, likes, comments, shares, saves
- Average watch time
- Completion rate
- Engagement rate

**Example Request:**
```typescript
POST /instagram/reels/optimize
{
  "videoUrl": "https://...",
  "aspectRatio": "9:16",
  "targetDuration": 30,
  "autoCaptions": true
}
```

**Example Response:**
```json
{
  "optimizedVideoUrl": "https://...",
  "thumbnailUrl": "https://...",
  "duration": 30,
  "aspectRatio": "9:16",
  "fileSize": 5242880,
  "suggestions": [
    "Video optimized for vertical 9:16 format",
    "Auto-captions added to improve accessibility",
    "Video compressed for optimal Instagram delivery"
  ],
  "captionsUrl": "https://..."
}
```

## Architecture

### Services

1. **InstagramGridService**: Grid preview and rearrangement
2. **InstagramStoryService**: Story creation and scheduling
3. **InstagramAestheticService**: Aesthetic analysis and scoring
4. **InstagramShopService**: Shopping integration
5. **InstagramReelsService**: Reels optimization and analytics

### Data Flow

```
Controller → Service → PrismaService → Database
                    ↓
              Instagram Graph API
```

### Database Schema

Posts with Instagram-specific data are stored with platform-specific metadata:

```typescript
{
  content: {
    text: string,
    media: MediaAsset[],
    firstComment?: string,
    storyData?: {
      stickers: {...}
    },
    reelData?: {
      coverFrameTime: number,
      audioUrl: string
    }
  },
  platformPosts: [{
    platform: 'INSTAGRAM',
    customContent: {
      isReel?: boolean,
      productTags?: ProductTag[]
    }
  }]
}
```

## Best Practices

### Grid Aesthetics
- Maintain a consistent color palette (3-5 signature colors)
- Post regularly to maintain visual flow
- Mix content types (single images, carousels, Reels)
- Use the aesthetic analyzer before posting

### Stories
- Keep videos under 15 seconds for better completion rates
- Use interactive stickers to boost engagement
- Add captions for accessibility
- Schedule during peak engagement times

### Reels
- Use 9:16 vertical format
- Hook viewers in first 3 seconds
- Keep duration 15-30 seconds for best performance
- Use trending audio
- Add text overlays

### Shopping
- Tag products clearly in images
- Use high-quality product photos
- Include compelling captions
- Track shopping analytics to optimize

## Testing

All services include comprehensive unit tests:

```bash
npm test -- instagram
```

Test coverage includes:
- Grid preview and rearrangement
- Story creation with stickers
- Aesthetic analysis algorithms
- Shop integration
- Reels optimization

## API Integration

The module integrates with Instagram Graph API v18.0:

- **Authentication**: OAuth 2.0 with encrypted token storage
- **Rate Limiting**: Automatic retry with exponential backoff
- **Error Handling**: Comprehensive error messages and logging
- **Token Refresh**: Automatic token refresh before expiry

## Future Enhancements

- Real-time aesthetic scoring as you upload
- AI-powered grid layout suggestions
- Advanced Reels editing (filters, effects)
- Instagram Live scheduling
- IGTV optimization
- Collaborative Stories
- Shopping catalog management

## Requirements Mapping

This module implements the following requirements:

- **17.1**: Visual grid preview with drag-and-drop rearrangement ✅
- **17.2**: Story scheduling with stickers (polls, questions, countdowns, links) ✅
- **17.3**: First comment scheduling ✅
- **17.4**: Aesthetic consistency scoring ✅
- **17.5**: Instagram Shop integration and Reels optimization ✅

## Support

For issues or questions about Instagram-specific features, please refer to:
- Instagram Graph API Documentation: https://developers.facebook.com/docs/instagram-api
- Platform Requirements Document: `.kiro/specs/ai-social-media-platform/requirements.md`
- Design Document: `.kiro/specs/ai-social-media-platform/design.md`