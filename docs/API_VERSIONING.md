# API Versioning Guide

This document explains the API versioning strategy for the AI Social Media Management Platform.

## Versioning Strategy

The API uses **URI-based versioning** where the version number is included in the URL path:

```
https://api.example.com/api/v{version}/{resource}
```

Example:
```
https://api.example.com/api/v1/posts
https://api.example.com/api/v2/posts
```

## Current Version

**Current Stable Version**: v1

## Version Support Policy

### Support Timeline

- **Active Support**: Latest version receives all new features, bug fixes, and security updates
- **Maintenance Support**: Previous version receives critical bug fixes and security updates for 12 months
- **Deprecated**: Version is marked deprecated 6 months before end-of-life
- **End-of-Life**: Version is no longer supported and may be shut down

### Version Lifecycle

```
v1 Released (Jan 2024)
├─ Active Support (Jan 2024 - Dec 2024)
├─ Maintenance Support (Jan 2025 - Dec 2025)
├─ Deprecated (Jul 2025 - Dec 2025)
└─ End-of-Life (Jan 2026)

v2 Released (Jan 2025)
├─ Active Support (Jan 2025 - Dec 2025)
└─ ...
```

## Breaking vs Non-Breaking Changes

### Non-Breaking Changes (Patch/Minor Updates)

These changes are made within the same major version:

✅ **Allowed**:
- Adding new endpoints
- Adding new optional parameters
- Adding new fields to responses
- Adding new event types
- Improving error messages
- Performance improvements
- Bug fixes

Example:
```json
// v1.0 Response
{
  "id": "post_123",
  "content": "Hello world"
}

// v1.1 Response (non-breaking)
{
  "id": "post_123",
  "content": "Hello world",
  "views": 1000  // New field added
}
```

### Breaking Changes (Major Updates)

These changes require a new major version:

❌ **Breaking**:
- Removing endpoints
- Removing fields from responses
- Changing field types
- Renaming fields
- Making optional parameters required
- Changing authentication methods
- Changing error response format
- Changing rate limits significantly

Example:
```json
// v1 Response
{
  "postId": "post_123",
  "text": "Hello world"
}

// v2 Response (breaking - field renamed)
{
  "id": "post_123",
  "content": "Hello world"
}
```

## Version Migration

### Deprecation Process

1. **Announcement** (T-12 months)
   - Deprecation notice in API documentation
   - Email notification to all API users
   - Deprecation warnings in API responses

2. **Deprecation Headers** (T-6 months)
   ```
   Deprecation: true
   Sunset: Sat, 31 Dec 2025 23:59:59 GMT
   Link: <https://docs.example.com/migration/v1-to-v2>; rel="deprecation"
   ```

3. **Migration Period** (T-6 to T-0 months)
   - Both versions available
   - Migration guides published
   - Support for migration questions

4. **End-of-Life** (T-0)
   - Old version shut down
   - Requests return 410 Gone

### Migration Checklist

When migrating to a new API version:

- [ ] Review changelog and breaking changes
- [ ] Read migration guide
- [ ] Update SDK to latest version
- [ ] Test in staging environment
- [ ] Update API version in code
- [ ] Monitor error rates
- [ ] Update documentation
- [ ] Train team on changes

## Version-Specific Features

### v1 (Current)

**Released**: January 2024

**Features**:
- Multi-platform content publishing
- AI content generation
- Analytics and reporting
- Social listening
- Unified inbox
- Webhooks
- Campaign management
- Influencer discovery

**Endpoints**: 150+

**Status**: Active Support

### v2 (Planned)

**Expected Release**: January 2025

**Planned Features**:
- GraphQL API support
- Enhanced real-time capabilities
- Advanced AI personalization
- Improved batch operations
- New analytics endpoints

**Breaking Changes**:
- Response format standardization
- Authentication flow updates
- Webhook payload restructuring

## Accessing Different Versions

### Default Version

If no version is specified, the API defaults to v1:

```bash
# These are equivalent
curl https://api.example.com/api/posts
curl https://api.example.com/api/v1/posts
```

### Specifying Version

Always specify the version explicitly in production:

```bash
curl https://api.example.com/api/v1/posts
```

### SDK Version Support

SDKs are version-specific:

```bash
# JavaScript
npm install @ai-social/sdk@1.x  # v1 API
npm install @ai-social/sdk@2.x  # v2 API

# Python
pip install ai-social-sdk==1.*  # v1 API
pip install ai-social-sdk==2.*  # v2 API
```

## Version Headers

### Request Headers

Optionally specify version via header:

```
API-Version: 1
```

### Response Headers

All responses include version information:

```
API-Version: 1
API-Version-Status: active
```

## Changelog

### v1.2.0 (Planned - March 2024)

**New Features**:
- Bulk post operations endpoint
- Advanced filtering for analytics
- Custom report templates

**Improvements**:
- Faster response times for analytics queries
- Enhanced error messages
- Better rate limit handling

**Bug Fixes**:
- Fixed timezone handling in scheduling
- Corrected pagination cursor encoding

### v1.1.0 (February 2024)

**New Features**:
- Video content management endpoints
- Instagram-specific features
- Enhanced hashtag intelligence

**Improvements**:
- Improved AI content generation quality
- Better sentiment analysis accuracy

### v1.0.0 (January 2024)

**Initial Release**:
- Core publishing functionality
- Basic analytics
- Social listening
- Inbox management

## Best Practices

### 1. Always Specify Version

```javascript
// ❌ Bad - relies on default
const response = await fetch('https://api.example.com/api/posts');

// ✅ Good - explicit version
const response = await fetch('https://api.example.com/api/v1/posts');
```

### 2. Monitor Deprecation Headers

```javascript
const response = await fetch('https://api.example.com/api/v1/posts');

if (response.headers.get('Deprecation')) {
  console.warn('API version is deprecated!');
  console.warn('Sunset date:', response.headers.get('Sunset'));
  console.warn('Migration guide:', response.headers.get('Link'));
}
```

### 3. Use SDK Version Pinning

```json
// package.json
{
  "dependencies": {
    "@ai-social/sdk": "1.2.5"  // Pin to specific version
  }
}
```

### 4. Test Before Migrating

```javascript
// Test new version in staging
const clientV1 = new AISocialSDK({
  apiKey: 'staging_key',
  baseURL: 'https://api-staging.example.com/api/v1'
});

const clientV2 = new AISocialSDK({
  apiKey: 'staging_key',
  baseURL: 'https://api-staging.example.com/api/v2'
});

// Compare responses
const v1Response = await clientV1.listPosts();
const v2Response = await clientV2.listPosts();
```

### 5. Handle Version Errors

```javascript
try {
  const response = await client.createPost(post);
} catch (error) {
  if (error.code === 'VERSION_NOT_SUPPORTED') {
    console.error('API version no longer supported');
    console.error('Please upgrade to:', error.details.latestVersion);
  }
}
```

## Version-Specific Documentation

Each version has dedicated documentation:

- **v1 Docs**: https://docs.example.com/api/v1
- **v2 Docs**: https://docs.example.com/api/v2 (when available)

## Migration Guides

Detailed migration guides are available for each version transition:

- **v1 to v2**: https://docs.example.com/migration/v1-to-v2 (when available)

## Support

For version-related questions:

- **Email**: api-versions@example.com
- **Documentation**: https://docs.example.com/versioning
- **Status Page**: https://status.example.com

## FAQ

### Q: Can I use multiple versions simultaneously?

Yes, you can use different versions for different parts of your application. However, we recommend migrating completely to avoid complexity.

### Q: How long do I have to migrate?

You have at least 12 months from the deprecation announcement to migrate to the new version.

### Q: Will my API keys work across versions?

Yes, API keys and access tokens work across all supported versions.

### Q: What happens if I don't migrate?

After the end-of-life date, requests to the old version will return a 410 Gone status code.

### Q: Can I request features to be backported?

Critical security fixes are backported to maintained versions. Feature backports are evaluated case-by-case.

### Q: How do I know which version I'm using?

Check the `API-Version` response header or review your code for the version in the URL path.
