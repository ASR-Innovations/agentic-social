"""
AI Social Media Management Platform - Python SDK

Official Python SDK for the AI Social Media Management Platform API.
"""

from .client import AISocialClient, AISocialError
from .types import (
    Post,
    Media,
    AIGenerateRequest,
    AnalyticsQuery,
    ListeningQuery,
    WebhookConfig,
)

__version__ = "1.0.0"
__all__ = [
    "AISocialClient",
    "AISocialError",
    "Post",
    "Media",
    "AIGenerateRequest",
    "AnalyticsQuery",
    "ListeningQuery",
    "WebhookConfig",
]
