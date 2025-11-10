# Agentic Social Media Platform - System Architecture

## 🏗️ High-Level Architecture Flowchart

```mermaid
graph TB
    subgraph "Frontend Layer"
        FE[Next.js Frontend]
    end

    subgraph "API Gateway Layer"
        API[NestJS API Gateway<br/>Port: 3001<br/>Prefix: /api/v1]
        CORS[CORS Middleware]
        THROTTLE[Rate Limiter<br/>100 req/min]
        AUTH_GUARD[JWT Auth Guard]
        LOGGING[Logging Interceptor]
        ERROR[Global Exception Filter]
    end

    subgraph "Authentication & Authorization"
        AUTH_MODULE[Auth Module]
        JWT[JWT Service]
        PASSPORT[Passport.js]
        LOCAL[Local Strategy]
        JWT_STRAT[JWT Strategy]
    end

    subgraph "Core Business Modules"
        TENANT[Tenant Module<br/>Multi-tenancy]
        USER[User Module<br/>RBAC]
        SOCIAL[Social Account Module<br/>OAuth & Token Mgmt]
        POST[Post Module<br/>Content Management]
        AI[AI Module<br/>Content Generation]
        ANALYTICS[Analytics Module<br/>Metrics & Reporting]
        MEDIA[Media Module<br/>File Upload]
    end

    subgraph "Social Platform Integrations"
        OAUTH[OAuth Service<br/>9 Platforms]
        ENCRYPT[Encryption Service<br/>AES-256-GCM]
        FACTORY[Platform Client Factory]

        subgraph "Platform Clients"
            INSTA[Instagram Client]
            TWITTER[Twitter/X Client]
            LINKEDIN[LinkedIn Client]
            FACEBOOK[Facebook Client]
            TIKTOK[TikTok Client]
            YOUTUBE[YouTube Client]
            PINTEREST[Pinterest Client]
            THREADS[Threads Client]
            REDDIT[Reddit Client]
        end
    end

    subgraph "AI Services"
        OPENAI[OpenAI Service<br/>GPT-4 & DALL-E]
        ANTHROPIC[Anthropic Service<br/>Claude 3.5 Sonnet]
    end

    subgraph "Queue System"
        BULL[Bull Queue<br/>Redis-backed]
        POST_PROC[Post Publishing Processor]
        SCHEDULER[Post Scheduler]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL 15<br/>Multi-tenant RLS)]
        REDIS[(Redis 7<br/>Cache & Queue)]
        S3[AWS S3<br/>Media Storage]
    end

    subgraph "External APIs"
        INSTA_API[Instagram Graph API]
        TWITTER_API[Twitter API v2]
        LINKEDIN_API[LinkedIn API]
        FACEBOOK_API[Facebook Graph API]
        TIKTOK_API[TikTok API]
        YOUTUBE_API[YouTube Data API]
        PINTEREST_API[Pinterest API v5]
        THREADS_API[Threads API]
        REDDIT_API[Reddit API]
        OPENAI_API[OpenAI API]
        ANTHROPIC_API[Anthropic API]
    end

    %% Frontend to API Gateway
    FE -->|HTTP/HTTPS| API

    %% API Gateway Flow
    API --> CORS
    CORS --> THROTTLE
    THROTTLE --> AUTH_GUARD
    AUTH_GUARD --> LOGGING
    LOGGING --> ERROR

    %% Authentication Flow
    AUTH_GUARD --> AUTH_MODULE
    AUTH_MODULE --> JWT
    AUTH_MODULE --> PASSPORT
    PASSPORT --> LOCAL
    PASSPORT --> JWT_STRAT

    %% Core Module Connections
    AUTH_MODULE --> TENANT
    AUTH_MODULE --> USER
    API --> TENANT
    API --> USER
    API --> SOCIAL
    API --> POST
    API --> AI
    API --> ANALYTICS
    API --> MEDIA

    %% Social Account Integration
    SOCIAL --> OAUTH
    SOCIAL --> ENCRYPT
    SOCIAL --> FACTORY
    FACTORY --> INSTA
    FACTORY --> TWITTER
    FACTORY --> LINKEDIN
    FACTORY --> FACEBOOK
    FACTORY --> TIKTOK
    FACTORY --> YOUTUBE
    FACTORY --> PINTEREST
    FACTORY --> THREADS
    FACTORY --> REDDIT

    %% AI Integration
    AI --> OPENAI
    AI --> ANTHROPIC
    AI --> TENANT

    %% Post Publishing Flow
    POST --> BULL
    BULL --> POST_PROC
    BULL --> SCHEDULER
    POST_PROC --> FACTORY

    %% Database Connections
    TENANT --> PG
    USER --> PG
    SOCIAL --> PG
    POST --> PG
    AI --> PG
    ANALYTICS --> PG
    BULL --> REDIS

    %% Media Storage
    MEDIA --> S3

    %% External API Calls
    INSTA --> INSTA_API
    TWITTER --> TWITTER_API
    LINKEDIN --> LINKEDIN_API
    FACEBOOK --> FACEBOOK_API
    TIKTOK --> TIKTOK_API
    YOUTUBE --> YOUTUBE_API
    PINTEREST --> PINTEREST_API
    THREADS --> THREADS_API
    REDDIT --> REDDIT_API
    OPENAI --> OPENAI_API
    ANTHROPIC --> ANTHROPIC_API

    style FE fill:#4CAF50
    style API fill:#2196F3
    style PG fill:#336791
    style REDIS fill:#DC382D
    style S3 fill:#FF9900
    style OPENAI fill:#10A37F
    style ANTHROPIC fill:#191919
```

## 🔄 Request Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Auth
    participant Module
    participant Queue
    participant DB
    participant External

    User->>Frontend: Action (e.g., Create Post)
    Frontend->>API: HTTP Request + JWT
    API->>API: Rate Limiting Check
    API->>Auth: Validate JWT Token
    Auth->>DB: Verify User & Tenant
    DB-->>Auth: User Data
    Auth-->>API: Authenticated User
    API->>Module: Process Request

    alt Immediate Operation
        Module->>DB: CRUD Operation
        DB-->>Module: Result
        Module-->>API: Response
    else Async Operation
        Module->>Queue: Add Job
        Queue-->>Module: Job ID
        Module-->>API: Accepted
        Queue->>Queue: Process Job
        Queue->>External: API Call
        External-->>Queue: Result
        Queue->>DB: Update Status
    end

    API-->>Frontend: JSON Response
    Frontend-->>User: Updated UI
```

## 📊 Data Flow for Multi-Platform Posting

```mermaid
flowchart TD
    START([User Creates Post]) --> DRAFT[Save as Draft<br/>in Database]
    DRAFT --> SCHEDULE{Schedule<br/>Post?}

    SCHEDULE -->|Yes| SCHEDULE_TIME[Set scheduledAt<br/>timestamp]
    SCHEDULE_TIME --> QUEUE_SCHEDULE[Add to Bull Queue<br/>with delay]
    QUEUE_SCHEDULE --> WAIT[Wait until<br/>scheduled time]

    SCHEDULE -->|No| PUBLISH{Publish<br/>Now?}

    PUBLISH -->|Yes| QUEUE_NOW[Add to Bull Queue<br/>immediately]
    PUBLISH -->|No| END_DRAFT([Saved as Draft])

    WAIT --> PROCESSOR[Post Publishing<br/>Processor]
    QUEUE_NOW --> PROCESSOR

    PROCESSOR --> GET_ACCOUNTS[Get Connected<br/>Social Accounts]
    GET_ACCOUNTS --> DECRYPT[Decrypt OAuth<br/>Tokens]
    DECRYPT --> CHECK_EXPIRE{Token<br/>Expired?}

    CHECK_EXPIRE -->|Yes| REFRESH[Refresh Token<br/>via OAuth]
    CHECK_EXPIRE -->|No| PARALLEL
    REFRESH --> PARALLEL

    PARALLEL[Publish to All<br/>Platforms in Parallel] --> P1[Platform 1]
    PARALLEL --> P2[Platform 2]
    PARALLEL --> P3[Platform N...]

    P1 --> API1[Platform API Call]
    P2 --> API2[Platform API Call]
    P3 --> API3[Platform API Call]

    API1 --> RES1{Success?}
    API2 --> RES2{Success?}
    API3 --> RES3{Success?}

    RES1 -->|Yes| SAVE1[Save Platform Post ID]
    RES1 -->|No| RETRY1{Retry<br/>Count < 3?}
    RETRY1 -->|Yes| API1
    RETRY1 -->|No| FAIL1[Mark as Failed]

    RES2 -->|Yes| SAVE2[Save Platform Post ID]
    RES2 -->|No| FAIL2[Mark as Failed]

    RES3 -->|Yes| SAVE3[Save Platform Post ID]
    RES3 -->|No| FAIL3[Mark as Failed]

    SAVE1 --> RECORD_ANALYTICS1[Record Analytics<br/>Event]
    SAVE2 --> RECORD_ANALYTICS2[Record Analytics<br/>Event]
    SAVE3 --> RECORD_ANALYTICS3[Record Analytics<br/>Event]

    RECORD_ANALYTICS1 --> CHECK_ALL{All<br/>Platforms<br/>Done?}
    RECORD_ANALYTICS2 --> CHECK_ALL
    RECORD_ANALYTICS3 --> CHECK_ALL
    FAIL1 --> CHECK_ALL
    FAIL2 --> CHECK_ALL
    FAIL3 --> CHECK_ALL

    CHECK_ALL -->|All Success| STATUS_PUBLISHED[Update Post Status:<br/>PUBLISHED]
    CHECK_ALL -->|Some Failed| STATUS_PARTIAL[Update Post Status:<br/>PARTIALLY_PUBLISHED]
    CHECK_ALL -->|All Failed| STATUS_FAILED[Update Post Status:<br/>FAILED]

    STATUS_PUBLISHED --> END_SUCCESS([Post Live on<br/>All Platforms])
    STATUS_PARTIAL --> END_PARTIAL([Post Live on<br/>Some Platforms])
    STATUS_FAILED --> END_FAIL([Publishing Failed])
```

## 🤖 AI Content Generation Flow

```mermaid
flowchart TD
    START([User Requests AI<br/>Content Generation]) --> CHECK_BUDGET{AI Budget<br/>Available?}

    CHECK_BUDGET -->|No| ERROR_BUDGET[Throw Budget<br/>Exceeded Error]
    ERROR_BUDGET --> END_ERROR([Return Error])

    CHECK_BUDGET -->|Yes| CREATE_REQ[Create AI Request<br/>Record in DB]
    CREATE_REQ --> DETERMINE{Request<br/>Type?}

    DETERMINE -->|Caption| OPENAI_CAPTION[OpenAI GPT-4<br/>Generate Captions]
    DETERMINE -->|Content| ANTHROPIC_CONTENT[Anthropic Claude<br/>Generate Content]
    DETERMINE -->|Image| OPENAI_IMAGE[OpenAI DALL-E 3<br/>Generate Image]
    DETERMINE -->|Hashtag| OPENAI_HASHTAG[OpenAI GPT-4<br/>Generate Hashtags]
    DETERMINE -->|Improve| ANTHROPIC_IMPROVE[Anthropic Claude<br/>Improve Content]

    OPENAI_CAPTION --> API_CALL1[API Call to OpenAI]
    ANTHROPIC_CONTENT --> API_CALL2[API Call to Anthropic]
    OPENAI_IMAGE --> API_CALL3[API Call to OpenAI]
    OPENAI_HASHTAG --> API_CALL4[API Call to OpenAI]
    ANTHROPIC_IMPROVE --> API_CALL5[API Call to Anthropic]

    API_CALL1 --> RESULT1{Success?}
    API_CALL2 --> RESULT2{Success?}
    API_CALL3 --> RESULT3{Success?}
    API_CALL4 --> RESULT4{Success?}
    API_CALL5 --> RESULT5{Success?}

    RESULT1 -->|Yes| PARSE1[Parse Response<br/>Extract Captions]
    RESULT2 -->|Yes| PARSE2[Parse Response<br/>Extract Content]
    RESULT3 -->|Yes| PARSE3[Parse Response<br/>Extract Image URLs]
    RESULT4 -->|Yes| PARSE4[Parse Response<br/>Extract Hashtags]
    RESULT5 -->|Yes| PARSE5[Parse Response<br/>Extract Improvements]

    RESULT1 -->|No| ERROR_AI[Record Error]
    RESULT2 -->|No| ERROR_AI
    RESULT3 -->|No| ERROR_AI
    RESULT4 -->|No| ERROR_AI
    RESULT5 -->|No| ERROR_AI

    PARSE1 --> UPDATE_SUCCESS
    PARSE2 --> UPDATE_SUCCESS
    PARSE3 --> UPDATE_SUCCESS
    PARSE4 --> UPDATE_SUCCESS
    PARSE5 --> UPDATE_SUCCESS

    UPDATE_SUCCESS[Update AI Request:<br/>Status = COMPLETED<br/>Save Output & Metrics] --> UPDATE_BUDGET[Update Tenant<br/>AI Usage & Cost]

    ERROR_AI --> UPDATE_FAILED[Update AI Request:<br/>Status = FAILED<br/>Save Error Message]

    UPDATE_BUDGET --> END_SUCCESS([Return Generated<br/>Content + Request ID])
    UPDATE_FAILED --> END_ERROR
```

## 🔐 OAuth Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Platform
    participant DB

    User->>Frontend: Click "Connect Instagram"
    Frontend->>Backend: GET /social-accounts/auth-url/instagram
    Backend->>Backend: Generate State Token<br/>(tenant_id + timestamp)
    Backend->>Backend: Build OAuth URL with:<br/>- client_id<br/>- redirect_uri<br/>- scope<br/>- state
    Backend-->>Frontend: Return OAuth URL + State
    Frontend->>Platform: Redirect to OAuth URL
    Platform->>User: Show Authorization Screen
    User->>Platform: Grant Permissions
    Platform->>Frontend: Redirect with Code + State
    Frontend->>Backend: POST /social-accounts/connect<br/>{ platform, code, redirectUri }
    Backend->>Backend: Validate State Token
    Backend->>Platform: Exchange Code for Tokens<br/>(Authorization Code Grant)
    Platform-->>Backend: Access Token + Refresh Token<br/>+ Expires In
    Backend->>Backend: Encrypt Tokens<br/>(AES-256-GCM)
    Backend->>Platform: Get Account Info<br/>using Access Token
    Platform-->>Backend: Account Details<br/>(ID, Name, Metadata)
    Backend->>DB: Save Encrypted Tokens<br/>+ Account Info
    DB-->>Backend: Saved
    Backend-->>Frontend: Account Connected<br/>(without tokens)
    Frontend-->>User: Success Message
```

## 🗄️ Database Schema Overview

```mermaid
erDiagram
    TENANTS ||--o{ USERS : has
    TENANTS ||--o{ SOCIAL_ACCOUNTS : has
    TENANTS ||--o{ POSTS : has
    TENANTS ||--o{ AI_REQUESTS : has
    TENANTS ||--o{ ANALYTICS_EVENTS : has

    USERS ||--o{ POSTS : creates
    USERS ||--o{ AI_REQUESTS : creates

    POSTS ||--o{ POST_PLATFORMS : "published to"
    SOCIAL_ACCOUNTS ||--o{ POST_PLATFORMS : "publishes via"

    TENANTS {
        uuid id PK
        string name
        enum plan_tier
        decimal ai_budget_limit
        decimal ai_usage_current
        jsonb settings
        timestamp created_at
    }

    USERS {
        uuid id PK
        uuid tenant_id FK
        string email UK
        string password
        enum role
        boolean is_active
        timestamp last_login_at
    }

    SOCIAL_ACCOUNTS {
        uuid id PK
        uuid tenant_id FK
        enum platform
        string account_identifier
        text oauth_tokens_encrypted
        text refresh_token_encrypted
        timestamp token_expires_at
        string status
        timestamp last_sync_at
    }

    POSTS {
        uuid id PK
        uuid tenant_id FK
        uuid created_by FK
        string title
        text content
        enum type
        enum status
        jsonb media_urls
        timestamp scheduled_at
        timestamp published_at
        jsonb ai_generated_data
    }

    POST_PLATFORMS {
        uuid id PK
        uuid post_id FK
        uuid social_account_id FK
        enum status
        string platform_post_id
        text custom_content
        text error_message
        int retry_count
    }

    AI_REQUESTS {
        uuid id PK
        uuid tenant_id FK
        uuid user_id FK
        enum type
        enum status
        string model
        jsonb input
        jsonb output
        int tokens_used
        decimal cost_usd
    }

    ANALYTICS_EVENTS {
        uuid id PK
        uuid tenant_id FK
        uuid post_id FK
        uuid social_account_id FK
        string event_type
        string platform
        int value
        timestamp recorded_at
    }
```

## 📦 Module Dependencies

```mermaid
graph LR
    AUTH[Auth Module] --> USER[User Module]
    AUTH --> TENANT[Tenant Module]
    AUTH --> JWT[JWT Module]

    USER --> TENANT

    SOCIAL[Social Account Module] --> ENCRYPT[Encryption Service]
    SOCIAL --> OAUTH[OAuth Service]
    SOCIAL --> CLIENTS[Platform Clients]

    POST[Post Module] --> SOCIAL
    POST --> BULL[Bull Queue]
    POST --> USER

    AI[AI Module] --> TENANT
    AI --> OPENAI_SVC[OpenAI Service]
    AI --> ANTHROPIC_SVC[Anthropic Service]

    ANALYTICS[Analytics Module] --> NONE[No Dependencies]

    MEDIA[Media Module] --> S3_SVC[S3 Service]

    APP[App Module] --> AUTH
    APP --> TENANT
    APP --> USER
    APP --> SOCIAL
    APP --> POST
    APP --> AI
    APP --> ANALYTICS
    APP --> MEDIA
    APP --> THROTTLE[Throttler]
    APP --> CONFIG[Config Module]
    APP --> TYPEORM[TypeORM]
    APP --> BULL

    style APP fill:#2196F3
    style AUTH fill:#4CAF50
    style SOCIAL fill:#FF9800
    style POST fill:#9C27B0
    style AI fill:#F44336
```

---

## 📝 Key Architectural Decisions

### 1. **Multi-Tenancy with Row-Level Security (RLS)**
- Every table has `tenant_id`
- PostgreSQL RLS policies enforce tenant isolation
- Prevents data leakage between tenants

### 2. **Queue-Based Asynchronous Processing**
- Bull + Redis for job queues
- Scheduled posts processed at exact time
- Retry logic with exponential backoff
- Parallel platform publishing

### 3. **Encrypted Token Storage**
- AES-256-GCM encryption for OAuth tokens
- Unique salt + IV per encryption
- Authentication tags for tamper detection
- Secure key derivation with scrypt

### 4. **Platform-Agnostic Design**
- Factory pattern for platform clients
- Common interface for all social platforms
- Easy to add new platforms
- Centralized token management

### 5. **AI Cost Tracking**
- Per-request cost calculation
- Tenant-level budget enforcement
- Token usage tracking
- Request history for auditing

### 6. **Comprehensive Analytics**
- Event-based tracking system
- Real-time metrics aggregation
- Platform-specific breakdowns
- Engagement rate calculations

---

This architecture provides:
✅ **Scalability** - Horizontal scaling with stateless API
✅ **Security** - Encryption, RLS, JWT, rate limiting
✅ **Reliability** - Queue-based async processing with retries
✅ **Flexibility** - Modular design, easy to extend
✅ **Performance** - Redis caching, connection pooling
✅ **Observability** - Logging, error tracking, analytics
