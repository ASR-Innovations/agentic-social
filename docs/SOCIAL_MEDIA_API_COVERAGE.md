# Social Media Platform API Coverage

## Overview

This document provides comprehensive details about the social media platform APIs integrated into the Agentic Social backend. The platform supports **9 major social media networks** with full OAuth 2.0 authentication and content publishing capabilities.

## Platform Summary

| Platform | API Version | Authentication | Status | Content Types |
|----------|-------------|----------------|--------|---------------|
| Instagram | Graph API (Instagram) | OAuth 2.0 | ✅ Implemented | Images, Videos, Carousel |
| Twitter (X) | API v2 | OAuth 2.0 | ✅ Implemented | Text, Images, Videos |
| LinkedIn | API v2 | OAuth 2.0 | ✅ Implemented | Text, Images, Articles |
| Facebook | Graph API v18.0 | OAuth 2.0 | ✅ Implemented | Text, Images, Links, Videos |
| TikTok | Open API v1 | OAuth 2.0 | ✅ Implemented | Videos |
| YouTube | Data API v3 | OAuth 2.0 (Google) | ✅ Implemented | Videos |
| Pinterest | API v5 | OAuth 2.0 | ✅ Implemented | Pins (Images with links) |
| Threads | Graph API v1.0 | OAuth 2.0 | ✅ Implemented | Text, Images, Videos |
| Reddit | API v1 | OAuth 2.0 | ✅ Implemented | Text, Links, Images |

---

## 1. Instagram (Facebook Graph API)

### API Details
- **Base URL**: `https://graph.instagram.com`
- **API Version**: Instagram Graph API
- **Documentation**: https://developers.facebook.com/docs/instagram-api

### OAuth Configuration
**Scopes Required**:
- `instagram_basic` - Access to basic profile information
- `instagram_content_publish` - Publish posts on behalf of users
- `pages_read_engagement` - Read page engagement data

**Endpoints**:
- Auth: `https://api.instagram.com/oauth/authorize`
- Token: `https://api.instagram.com/oauth/access_token`

### API Endpoints Called

#### 1. Get Account Info
```
GET /me
Parameters:
  - fields: id, username, account_type, media_count
  - access_token: {token}
```
**Data Tracked**:
- Account ID
- Username
- Account Type (Personal, Business, Creator)
- Total Media Count

#### 2. Create Media Container
```
POST /{account_id}/media
Parameters:
  - image_url: {url} (for images)
  - video_url: {url} (for videos)
  - caption: {text}
  - access_token: {token}
```

#### 3. Publish Media
```
POST /{account_id}/media_publish
Parameters:
  - creation_id: {container_id}
  - access_token: {token}
```

#### 4. Get Post Details
```
GET /{media_id}
Parameters:
  - fields: id, caption, media_type, media_url, permalink, timestamp, like_count, comments_count
  - access_token: {token}
```
**Analytics Data Tracked**:
- Like Count
- Comment Count
- Media Type
- Timestamp
- Permalink

#### 5. Delete Post
```
DELETE /{media_id}
Parameters:
  - access_token: {token}
```

### Platform Limitations
- Requires approved Instagram Business or Creator account
- Media must be hosted externally (URL-based)
- Video duration limits: 3-60 seconds (feed), up to 60 minutes (IGTV)
- Image aspect ratio: 4:5 to 1.91:1
- Two-step publishing process (create container, then publish)

---

## 2. Twitter (X)

### API Details
- **Base URL**: `https://api.twitter.com/2`
- **Media Upload URL**: `https://upload.twitter.com/1.1`
- **API Version**: Twitter API v2
- **Documentation**: https://developer.twitter.com/en/docs/twitter-api

### OAuth Configuration
**Scopes Required**:
- `tweet.read` - Read tweets
- `tweet.write` - Create and delete tweets
- `users.read` - Read user profile information
- `offline.access` - Refresh tokens for long-lived access

**Endpoints**:
- Auth: `https://twitter.com/i/oauth2/authorize`
- Token: `https://api.twitter.com/2/oauth2/token`

### API Endpoints Called

#### 1. Get Account Info
```
GET /users/me
Parameters:
  - user.fields: id, name, username, public_metrics, verified
Headers:
  - Authorization: Bearer {token}
```
**Data Tracked**:
- User ID
- Display Name
- Username (@handle)
- Verified Status
- Followers Count
- Following Count
- Tweet Count

#### 2. Create Tweet
```
POST /tweets
Body:
  {
    "text": "Tweet content",
    "media": {
      "media_ids": ["id1", "id2"]
    }
  }
Headers:
  - Authorization: Bearer {token}
  - Content-Type: application/json
```

#### 3. Upload Media (v1.1 API)
```
POST https://upload.twitter.com/1.1/media/upload.json
Body: {media_data}
Headers:
  - Authorization: Bearer {token}
  - Content-Type: {media_type}
```
**Returns**: `media_id_string` for use in tweets

#### 4. Get Tweet Details
```
GET /tweets/{tweet_id}
Parameters:
  - tweet.fields: created_at, public_metrics, attachments
  - expansions: attachments.media_keys
  - media.fields: url, preview_image_url
Headers:
  - Authorization: Bearer {token}
```
**Analytics Data Tracked**:
- Retweet Count
- Reply Count
- Like Count
- Quote Count
- Impression Count (if available)

#### 5. Delete Tweet
```
DELETE /tweets/{tweet_id}
Headers:
  - Authorization: Bearer {token}
```

### Platform Limitations
- Text limit: 280 characters (4000 for Premium/Twitter Blue)
- Images: Up to 4 per tweet, max 5MB each
- Videos: Max 512MB (mobile), 2GB (web)
- Video duration: 2 minutes 20 seconds (standard), 10 minutes (verified)
- Rate limits apply per user and per app

---

## 3. LinkedIn

### API Details
- **Base URL**: `https://api.linkedin.com/v2`
- **API Version**: LinkedIn API v2
- **Documentation**: https://docs.microsoft.com/en-us/linkedin/

### OAuth Configuration
**Scopes Required**:
- `r_liteprofile` - Read basic profile information
- `r_emailaddress` - Read email address
- `w_member_social` - Post content on behalf of user
- `rw_organization_admin` - Manage organization pages (for company posts)

**Endpoints**:
- Auth: `https://www.linkedin.com/oauth/v2/authorization`
- Token: `https://www.linkedin.com/oauth/v2/accessToken`

### API Endpoints Called

#### 1. Get Account Info
```
GET /me
Headers:
  - Authorization: Bearer {token}
```
**Data Tracked**:
- Member ID
- First Name (localized)
- Last Name (localized)

#### 2. Create Post (UGC Post)
```
POST /ugcPosts
Body:
  {
    "author": "urn:li:person:{personId}",
    "lifecycleState": "PUBLISHED",
    "specificContent": {
      "com.linkedin.ugc.ShareContent": {
        "shareCommentary": {
          "text": "Post content"
        },
        "shareMediaCategory": "IMAGE|NONE",
        "media": [...]
      }
    },
    "visibility": {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
    }
  }
Headers:
  - Authorization: Bearer {token}
  - Content-Type: application/json
  - X-Restli-Protocol-Version: 2.0.0
```

#### 3. Get Post Details
```
GET /ugcPosts/{postId}
Headers:
  - Authorization: Bearer {token}
```

#### 4. Delete Post
```
DELETE /ugcPosts/{postId}
Headers:
  - Authorization: Bearer {token}
```

### Platform Limitations
- Text limit: 3000 characters (1300 recommended for full visibility)
- Images: Up to 9 per post
- Video: Max 5GB, up to 10 minutes
- Requires URN format for author identification
- Posts go through LinkedIn's review system

---

## 4. Facebook

### API Details
- **Base URL**: `https://graph.facebook.com/v18.0`
- **API Version**: Graph API v18.0
- **Documentation**: https://developers.facebook.com/docs/graph-api

### OAuth Configuration
**Scopes Required**:
- `pages_manage_posts` - Create, edit, and delete posts on pages
- `pages_read_engagement` - Read engagement data
- `pages_show_list` - Access list of pages user manages
- `public_profile` - Access basic profile information

**Endpoints**:
- Auth: `https://www.facebook.com/v18.0/dialog/oauth`
- Token: `https://graph.facebook.com/v18.0/oauth/access_token`

### API Endpoints Called

#### 1. Get Account Info
```
GET /me
Parameters:
  - fields: id, name, accounts{id, name, category, followers_count}
  - access_token: {token}
```
**Data Tracked**:
- User/Page ID
- Name
- Page Category
- Followers Count
- List of managed pages

#### 2. Create Feed Post
```
POST /{page_id}/feed
Parameters:
  - message: {text}
  - link: {url} (optional)
  - access_token: {token}
```

#### 3. Create Photo Post
```
POST /{page_id}/photos
Parameters:
  - url: {image_url}
  - message: {caption}
  - access_token: {token}
```

#### 4. Get Post Details
```
GET /{post_id}
Parameters:
  - fields: id, message, created_time, full_picture, permalink_url, shares, likes.summary(true), comments.summary(true)
  - access_token: {token}
```
**Analytics Data Tracked**:
- Like Count
- Comment Count (with summary)
- Share Count
- Post Timestamp
- Engagement Metrics

#### 5. Delete Post
```
DELETE /{post_id}
Parameters:
  - access_token: {token}
```

### Platform Limitations
- Text limit: 63,206 characters
- Image: Max 4MB, minimum 600px width
- Video: Max 10GB, up to 240 minutes
- Link posts require Open Graph metadata
- Page access tokens required for page posting

---

## 5. TikTok

### API Details
- **Base URL**: `https://open-api.tiktok.com`
- **API Version**: TikTok Open API v1
- **Documentation**: https://developers.tiktok.com/

### OAuth Configuration
**Scopes Required**:
- `user.info.basic` - Access basic user information
- `video.upload` - Upload videos
- `video.publish` - Publish videos

**Endpoints**:
- Auth: `https://www.tiktok.com/auth/authorize/`
- Token: `https://open-api.tiktok.com/oauth/access_token/`

### API Endpoints Called

#### 1. Get Account Info
```
GET /user/info/
Parameters:
  - fields: open_id, union_id, avatar_url, display_name, follower_count, following_count, likes_count
Headers:
  - Authorization: Bearer {token}
```
**Data Tracked**:
- Open ID (unique identifier)
- Union ID
- Display Name
- Avatar URL
- Follower Count
- Following Count
- Total Likes Count

#### 2. Upload and Share Video
```
POST /share/video/upload/
Body:
  {
    "video": {
      "video_url": "https://..."
    },
    "post_info": {
      "title": "Video caption",
      "privacy_level": "PUBLIC_TO_EVERYONE",
      "disable_duet": false,
      "disable_comment": false,
      "disable_stitch": false
    }
  }
Headers:
  - Authorization: Bearer {token}
  - Content-Type: application/json
```

#### 3. Query Video Details
```
GET /video/query/
Parameters:
  - fields: id, title, video_description, duration, cover_image_url, share_url, view_count, like_count, comment_count, share_count
  - filters: {"video_ids": ["id1"]}
Headers:
  - Authorization: Bearer {token}
```
**Analytics Data Tracked**:
- View Count
- Like Count
- Comment Count
- Share Count
- Video Duration

#### 4. Delete Video
```
POST /video/delete/
Body:
  {
    "video_id": "id"
  }
Headers:
  - Authorization: Bearer {token}
  - Content-Type: application/json
```

### Platform Limitations
- Video only platform (no text-only posts)
- Video duration: 15 seconds to 10 minutes
- Video size: Max 4GB
- Aspect ratio: 9:16 (portrait) recommended
- Requires app review and approval for API access
- Rate limits: 100 requests per day (may vary by approval)

---

## 6. YouTube

### API Details
- **Base URL**: `https://www.googleapis.com/youtube/v3`
- **API Version**: YouTube Data API v3
- **Documentation**: https://developers.google.com/youtube/v3

### OAuth Configuration
**Scopes Required**:
- `https://www.googleapis.com/auth/youtube.upload` - Upload videos
- `https://www.googleapis.com/auth/youtube.readonly` - View channel and video data

**Endpoints**:
- Auth: `https://accounts.google.com/o/oauth2/v2/auth`
- Token: `https://oauth2.googleapis.com/token`

### API Endpoints Called

#### 1. Get Channel Info
```
GET /channels
Parameters:
  - part: snippet, statistics
  - mine: true
Headers:
  - Authorization: Bearer {token}
```
**Data Tracked**:
- Channel ID
- Channel Title
- Description
- Custom URL
- Thumbnails
- Subscriber Count
- Video Count
- Total View Count

#### 2. Upload Video
```
POST /videos
Parameters:
  - part: snippet, status
  - uploadType: resumable
Body:
  {
    "snippet": {
      "title": "Video title",
      "description": "Description",
      "tags": ["tag1", "tag2"],
      "categoryId": "22"
    },
    "status": {
      "privacyStatus": "private|public|unlisted"
    }
  }
Headers:
  - Authorization: Bearer {token}
  - Content-Type: application/json
```

#### 3. Get Video Details
```
GET /videos
Parameters:
  - part: snippet, statistics, status
  - id: {video_id}
Headers:
  - Authorization: Bearer {token}
```
**Analytics Data Tracked**:
- View Count
- Like Count
- Comment Count
- Favorite Count
- Upload Date
- Video Status

#### 4. Delete Video
```
DELETE /videos
Parameters:
  - id: {video_id}
Headers:
  - Authorization: Bearer {token}
```

### Platform Limitations
- Video size: Max 256GB (or 12 hours long)
- Default upload: 15 minutes (can verify for longer)
- Quota: 10,000 units per day (upload costs 1600 units)
- Resumable upload required for large files
- Videos require metadata (title, description)
- Privacy settings: public, unlisted, or private

---

## 7. Pinterest

### API Details
- **Base URL**: `https://api.pinterest.com/v5`
- **API Version**: Pinterest API v5
- **Documentation**: https://developers.pinterest.com/docs/api/v5/

### OAuth Configuration
**Scopes Required**:
- `boards:read` - Read board information
- `pins:read` - Read pins
- `pins:write` - Create and edit pins

**Endpoints**:
- Auth: `https://www.pinterest.com/oauth/`
- Token: `https://api.pinterest.com/v5/oauth/token`

### API Endpoints Called

#### 1. Get Account Info
```
GET /user_account
Headers:
  - Authorization: Bearer {token}
```
**Data Tracked**:
- Username
- Account Type (Personal, Business)
- Profile Image
- Website URL
- Follower Count
- Following Count
- Board Count
- Pin Count

#### 2. Create Pin
```
POST /pins
Body:
  {
    "board_id": "board_id",
    "title": "Pin title",
    "description": "Description",
    "link": "https://destination-url.com",
    "media_source": {
      "source_type": "image_url",
      "url": "https://image-url.com"
    }
  }
Headers:
  - Authorization: Bearer {token}
  - Content-Type: application/json
```

#### 3. Get Pin Details
```
GET /pins/{pin_id}
Headers:
  - Authorization: Bearer {token}
```

#### 4. Delete Pin
```
DELETE /pins/{pin_id}
Headers:
  - Authorization: Bearer {token}
```

#### 5. Get User Boards
```
GET /boards
Headers:
  - Authorization: Bearer {token}
```
**Returns**: List of user's boards with IDs (required for pinning)

### Platform Limitations
- Requires destination board ID for all pins
- Image requirements: Min 100x100px, max 4000x4000px
- Aspect ratio: 2:3 or 1:2.1 recommended (vertical)
- Link required for all pins
- Video support limited (separate media type)
- Rate limit: 300 requests per hour

---

## 8. Threads (Meta)

### API Details
- **Base URL**: `https://graph.threads.net/v1.0`
- **API Version**: Threads Graph API v1.0
- **Documentation**: https://developers.facebook.com/docs/threads

### OAuth Configuration
**Scopes Required**:
- `threads_basic` - Access basic profile information
- `threads_content_publish` - Publish threads on behalf of users

**Endpoints**:
- Auth: `https://threads.net/oauth/authorize`
- Token: `https://graph.threads.net/oauth/access_token`

### API Endpoints Called

#### 1. Get Account Info
```
GET /me
Parameters:
  - fields: id, username, name, threads_profile_picture_url, threads_biography
  - access_token: {token}
```
**Data Tracked**:
- Account ID
- Username
- Display Name
- Profile Picture URL
- Biography

#### 2. Create Thread (Two-step process)
```
POST /{user_id}/threads
Parameters:
  - media_type: TEXT|IMAGE|VIDEO
  - text: {content}
  - image_url: {url} (if image)
  - video_url: {url} (if video)
  - access_token: {token}
```
**Returns**: Creation ID

#### 3. Publish Thread
```
POST /{user_id}/threads_publish
Parameters:
  - creation_id: {container_id}
  - access_token: {token}
```

#### 4. Get Thread Details
```
GET /{thread_id}
Parameters:
  - fields: id, text, media_type, media_url, permalink, timestamp, is_quote_post
  - access_token: {token}
```

#### 5. Delete Thread
```
DELETE /{thread_id}
Parameters:
  - access_token: {token}
```

### Platform Limitations
- Text limit: 500 characters
- Images: Up to 10 per thread
- Video: Max 5 minutes
- Two-step publishing (similar to Instagram)
- Relatively new API with evolving features
- Limited analytics currently available

---

## 9. Reddit

### API Details
- **Base URL**: `https://oauth.reddit.com`
- **API Version**: Reddit API v1
- **Documentation**: https://www.reddit.com/dev/api

### OAuth Configuration
**Scopes Required**:
- `identity` - Access account information
- `submit` - Submit links and text posts
- `read` - Read posts and comments

**Endpoints**:
- Auth: `https://www.reddit.com/api/v1/authorize`
- Token: `https://www.reddit.com/api/v1/access_token`

**Note**: Reddit requires Basic Auth for token exchange (client_id:client_secret)

### API Endpoints Called

#### 1. Get Account Info
```
GET /api/v1/me
Headers:
  - Authorization: Bearer {token}
  - User-Agent: AgenticSocial/1.0
```
**Data Tracked**:
- Account ID
- Username
- Icon Image
- Link Karma
- Comment Karma
- Total Karma
- Account Created Date
- Verified Status
- Email Verification Status

**Note**: User-Agent header is required for all Reddit API calls

#### 2. Submit Post
```
POST /api/submit
Body:
  {
    "sr": "subreddit_name",
    "title": "Post title",
    "kind": "self|link|image|video",
    "text": "Post content" (for self posts),
    "url": "link_url" (for link posts),
    "sendreplies": true
  }
Headers:
  - Authorization: Bearer {token}
  - User-Agent: AgenticSocial/1.0
  - Content-Type: application/x-www-form-urlencoded
```
**Returns**: Post ID with format `t3_{id}`

#### 3. Get Post Info
```
GET /api/info
Parameters:
  - id: {post_id} (with t3_ prefix)
Headers:
  - Authorization: Bearer {token}
  - User-Agent: AgenticSocial/1.0
```
**Analytics Data Tracked**:
- Upvote/Downvote counts
- Score (net votes)
- Comment count
- Awards received
- Post timestamp

#### 4. Delete Post
```
POST /api/del
Body:
  {
    "id": "{post_id}"
  }
Headers:
  - Authorization: Bearer {token}
  - User-Agent: AgenticSocial/1.0
  - Content-Type: application/x-www-form-urlencoded
```

#### 5. Get User's Subreddits
```
GET /subreddits/mine/subscriber
Headers:
  - Authorization: Bearer {token}
  - User-Agent: AgenticSocial/1.0
```
**Returns**: List of subreddits user is subscribed to

### Platform Limitations
- Title required for all posts (max 300 characters)
- Text posts limited to 40,000 characters
- Must post to specific subreddit (community)
- Each subreddit has its own rules and karma requirements
- Rate limiting based on karma (higher karma = higher rate limits)
- API requires unique User-Agent header
- Some subreddits may have posting restrictions

---

## API Data Flow Architecture

### Publishing Flow

```
┌─────────────────┐
│   Our Backend   │
│   POST /posts   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│   Post Service              │
│   - Validate content        │
│   - Check tenant limits     │
│   - Store in database       │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   Bull Queue                │
│   - Schedule for publish    │
│   - Add to Redis queue      │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   Post Publish Processor    │
│   - Get post & accounts     │
│   - For each platform...    │
└────────┬────────────────────┘
         │
         ├──────────┬──────────┬──────────┬─────────┐
         ▼          ▼          ▼          ▼         ▼
    Instagram  Twitter  LinkedIn  Facebook  ...
    ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
    │Client│  │Client│  │Client│  │Client│
    └───┬──┘  └───┬──┘  └───┬──┘  └───┬──┘
        │         │         │         │
        ▼         ▼         ▼         ▼
    [Platform APIs - Create Post]
        │         │         │         │
        └─────────┴─────────┴─────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Update Status  │
         │  in Database    │
         └─────────────────┘
```

### Analytics Tracking Flow

```
┌──────────────────┐
│  Platform APIs   │
│  (Post Metrics)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│  Platform Client         │
│  - getPost()             │
│  - Extract metrics       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Analytics Service       │
│  - Record event          │
│  - Store in analytics DB │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Analytics Endpoints     │
│  GET /analytics/posts/:id│
│  GET /analytics/tenant   │
└──────────────────────────┘
```

---

## Rate Limits Summary

| Platform  | Rate Limit | Window | Notes |
|-----------|------------|--------|-------|
| Instagram | ~200 calls | 1 hour | Per user token |
| Twitter   | ~300 tweets| 3 hours | Plus read limits |
| LinkedIn  | ~100 posts | 24 hours | Per member |
| Facebook  | ~200 calls | 1 hour | Per user token |
| TikTok    | 100 requests| 1 day | Requires approval |
| YouTube   | 10,000 units| 1 day | Upload = 1600 units |
| Pinterest | 300 requests| 1 hour | Per user |
| Threads   | Similar to IG| 1 hour | New API |
| Reddit    | ~60 requests| 1 minute | Based on OAuth app |

**Note**: Rate limits vary based on API access level, user type, and platform policies. Always implement retry logic with exponential backoff.

---

## Authentication Token Management

All platforms use **OAuth 2.0** authentication with the following pattern:

1. **Authorization**: User redirects to platform's OAuth URL
2. **Code Exchange**: Backend exchanges auth code for access token
3. **Token Storage**: Tokens encrypted with AES-256-GCM before storage
4. **Token Refresh**: Automatic refresh when tokens expire (where supported)
5. **Token Usage**: Decrypted on-demand for API calls

### Token Expiry

| Platform  | Access Token Expiry | Refresh Token | Long-Lived Token |
|-----------|---------------------|---------------|------------------|
| Instagram | 60 days | ❌ No | ✅ Yes |
| Twitter   | 2 hours | ✅ Yes | ✅ Yes (with refresh) |
| LinkedIn  | 60 days | ✅ Yes | ✅ Yes |
| Facebook  | 60 days | ❌ No | ✅ Yes |
| TikTok    | 24 hours | ✅ Yes | ❌ No |
| YouTube   | 1 hour | ✅ Yes | ✅ Yes (with refresh) |
| Pinterest | 1 year | ✅ Yes | ✅ Yes |
| Threads   | 60 days | ❌ No | ✅ Yes |
| Reddit    | 1 hour | ✅ Yes | ✅ Yes (with refresh) |

---

## Content Validation

### Platform-Specific Requirements

#### Text Length Limits
- **Twitter**: 280 chars (4000 with premium)
- **Instagram**: 2,200 chars caption
- **Threads**: 500 chars
- **LinkedIn**: 3,000 chars
- **Facebook**: 63,206 chars
- **Reddit**: 300 chars (title) + 40,000 chars (body)
- **TikTok**: 150 chars (caption)
- **YouTube**: 5,000 chars (description)
- **Pinterest**: 500 chars (description)

#### Media Requirements
- **Images**: All platforms support JPEG, PNG
- **Videos**: MP4 recommended for all platforms
- **File Sizes**: Vary significantly (see platform sections above)
- **Aspect Ratios**: Platform-specific (vertical for TikTok, flexible for others)

---

## Webhook Support

Currently, the following platforms support webhooks for real-time updates:

| Platform | Webhook Support | Events |
|----------|----------------|---------|
| Instagram | ✅ Yes | Comments, mentions, story mentions |
| Twitter | ✅ Yes | Mentions, DMs, follows |
| LinkedIn | ⚠️ Limited | Organization updates only |
| Facebook | ✅ Yes | Comments, messages, mentions |
| TikTok | ❌ No | Polling required |
| YouTube | ✅ Yes | Channel events, comments |
| Pinterest | ❌ No | Polling required |
| Threads | ⚠️ Limited | New API, evolving |
| Reddit | ❌ No | Polling required |

**Note**: Webhook implementation is not yet included in current version but infrastructure is prepared for future integration.

---

## Error Handling

All platform clients implement standardized error handling:

1. **Authentication Errors** (401, 403): Token refresh or re-authorization
2. **Rate Limit Errors** (429): Exponential backoff with retry
3. **Content Errors** (400): Detailed validation error messages
4. **Server Errors** (500, 503): Retry with backoff
5. **Platform-Specific Errors**: Mapped to common error format

### Retry Strategy

```javascript
Max Retries: 3
Backoff: Exponential (2s, 4s, 8s)
Retry on: 429, 500, 502, 503, 504
No Retry on: 400, 401, 403, 404
```

---

## API Coverage Summary

### What We Track

#### Account Level
- ✅ Profile information (name, username, ID)
- ✅ Account metrics (followers, following, etc.)
- ✅ Account type/verification status
- ✅ Profile images and bios

#### Content Publishing
- ✅ Text posts
- ✅ Image posts
- ✅ Video posts
- ✅ Link posts
- ✅ Scheduled publishing
- ✅ Multi-platform simultaneous publishing

#### Content Management
- ✅ Retrieve post details
- ✅ Update post status
- ✅ Delete posts
- ✅ Duplicate posts

#### Analytics & Metrics
- ✅ Engagement metrics (likes, comments, shares)
- ✅ Reach metrics (views, impressions)
- ✅ Performance tracking over time
- ✅ Platform-specific metrics (retweets, pins, karma, etc.)

### What We Don't Track (Yet)

- ❌ Direct messages/DMs
- ❌ Comments/replies management
- ❌ Follower growth analytics
- ❌ Hashtag performance
- ❌ Competitor analysis
- ❌ Advanced audience insights
- ❌ Story/Reels (Instagram, Facebook)
- ❌ Live streaming data

---

## Environment Variables Required

To enable each platform, set these environment variables:

```bash
# Instagram
INSTAGRAM_CLIENT_ID=your_client_id
INSTAGRAM_CLIENT_SECRET=your_client_secret
INSTAGRAM_REDIRECT_URI=https://yourapp.com/auth/instagram/callback

# Twitter
TWITTER_CLIENT_ID=your_client_id
TWITTER_CLIENT_SECRET=your_client_secret
TWITTER_REDIRECT_URI=https://yourapp.com/auth/twitter/callback

# LinkedIn
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=https://yourapp.com/auth/linkedin/callback

# Facebook
FACEBOOK_CLIENT_ID=your_app_id
FACEBOOK_CLIENT_SECRET=your_app_secret
FACEBOOK_REDIRECT_URI=https://yourapp.com/auth/facebook/callback

# TikTok
TIKTOK_CLIENT_KEY=your_client_key
TIKTOK_CLIENT_SECRET=your_client_secret
TIKTOK_REDIRECT_URI=https://yourapp.com/auth/tiktok/callback

# YouTube (Google)
YOUTUBE_CLIENT_ID=your_client_id
YOUTUBE_CLIENT_SECRET=your_client_secret
YOUTUBE_REDIRECT_URI=https://yourapp.com/auth/youtube/callback

# Pinterest
PINTEREST_CLIENT_ID=your_app_id
PINTEREST_CLIENT_SECRET=your_app_secret
PINTEREST_REDIRECT_URI=https://yourapp.com/auth/pinterest/callback

# Threads
THREADS_CLIENT_ID=your_client_id
THREADS_CLIENT_SECRET=your_client_secret
THREADS_REDIRECT_URI=https://yourapp.com/auth/threads/callback

# Reddit
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_REDIRECT_URI=https://yourapp.com/auth/reddit/callback

# General
FRONTEND_URL=https://yourapp.com
ENCRYPTION_SECRET=your_32_byte_secret_key
```

---

## Testing the Integration

Each platform client can be tested independently:

1. **Unit Tests**: Mock API responses to test client logic
2. **Integration Tests**: Use sandbox/test accounts where available
3. **E2E Tests**: Full OAuth flow with real credentials in test environment

Test coverage includes:
- ✅ OAuth flow (authorization URL generation, token exchange)
- ✅ Account connection and info retrieval
- ✅ Post creation, retrieval, deletion
- ✅ Token encryption/decryption
- ✅ Error handling and retries
- ✅ Rate limit handling

---

## Future Enhancements

### Planned API Integrations
1. **Story/Reels Support**: Instagram Stories, Facebook Stories
2. **Comment Management**: Reply to comments across platforms
3. **Direct Messaging**: Handle DMs where APIs support
4. **Advanced Analytics**: Detailed audience insights and demographics
5. **Webhook Integration**: Real-time event notifications
6. **Media Upload Optimization**: Direct upload without external hosting

### Additional Platforms Under Consideration
- Bluesky
- Mastodon
- Discord
- Telegram
- WhatsApp Business

---

## Support & Documentation Links

- **Instagram**: https://developers.facebook.com/docs/instagram-api
- **Twitter**: https://developer.twitter.com/en/docs
- **LinkedIn**: https://docs.microsoft.com/en-us/linkedin/
- **Facebook**: https://developers.facebook.com/docs/graph-api
- **TikTok**: https://developers.tiktok.com/
- **YouTube**: https://developers.google.com/youtube/v3
- **Pinterest**: https://developers.pinterest.com/docs/api/v5/
- **Threads**: https://developers.facebook.com/docs/threads
- **Reddit**: https://www.reddit.com/dev/api

---

## Conclusion

This backend implementation provides comprehensive API coverage for **9 major social media platforms**, supporting:

- ✅ **OAuth 2.0 authentication** for all platforms
- ✅ **Content publishing** (text, images, videos)
- ✅ **Account management** and profile information
- ✅ **Analytics tracking** (engagement, reach, performance)
- ✅ **Secure token storage** with AES-256-GCM encryption
- ✅ **Multi-platform posting** with single API call
- ✅ **Scheduled publishing** with queue-based processing
- ✅ **Rate limit handling** with automatic retry logic
- ✅ **Error handling** and logging across all platforms

The architecture is designed for extensibility, making it easy to add new platforms or enhance existing integrations as social media APIs evolve.
