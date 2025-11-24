"""Type definitions for the AI Social SDK."""

from typing import Dict, List, Optional, Literal, TypedDict


class Media(TypedDict, total=False):
    """Media asset definition."""
    url: str
    type: Literal["image", "video", "gif"]
    thumbnailUrl: Optional[str]


class Post(TypedDict, total=False):
    """Post definition."""
    id: Optional[str]
    content: str
    platforms: List[str]
    scheduledAt: Optional[str]
    media: Optional[List[Media]]
    platformCustomizations: Optional[Dict[str, any]]
    status: Optional[Literal["draft", "scheduled", "published", "failed"]]


class AIGenerateRequest(TypedDict, total=False):
    """AI content generation request."""
    prompt: str
    tone: Optional[Literal["professional", "casual", "friendly", "formal", "humorous"]]
    platforms: Optional[List[str]]
    variations: Optional[int]
    includeHashtags: Optional[bool]
    brandVoiceId: Optional[str]


class AnalyticsQuery(TypedDict, total=False):
    """Analytics query parameters."""
    startDate: Optional[str]
    endDate: Optional[str]
    platforms: Optional[List[str]]
    metrics: Optional[List[str]]


class ListeningQuery(TypedDict):
    """Social listening query definition."""
    name: str
    keywords: List[str]
    platforms: List[str]
    languages: Optional[List[str]]
    sentiment: Optional[List[str]]


class WebhookConfig(TypedDict):
    """Webhook configuration."""
    url: str
    events: List[str]
    secret: Optional[str]


class DateRange(TypedDict):
    """Date range definition."""
    start: str
    end: str


class ReportConfig(TypedDict):
    """Report generation configuration."""
    name: str
    dateRange: DateRange
    metrics: List[str]
    platforms: List[str]
    format: Literal["pdf", "csv", "excel"]
