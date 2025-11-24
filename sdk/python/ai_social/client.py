"""Main client for the AI Social SDK."""

import requests
from typing import Dict, List, Optional, Any
from .types import (
    Post,
    AIGenerateRequest,
    AnalyticsQuery,
    ListeningQuery,
    WebhookConfig,
    ReportConfig,
)


class AISocialError(Exception):
    """Custom exception for AI Social API errors."""

    def __init__(self, message: str, status_code: int, code: Optional[str] = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.code = code


class AISocialClient:
    """Client for interacting with the AI Social Media Management Platform API."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        access_token: Optional[str] = None,
        base_url: str = "https://api.example.com",
        timeout: int = 30,
    ):
        """
        Initialize the AI Social client.

        Args:
            api_key: API key for authentication
            access_token: JWT access token for authentication
            base_url: Base URL for the API
            timeout: Request timeout in seconds
        """
        self.base_url = base_url
        self.timeout = timeout
        self.api_key = api_key
        self.access_token = access_token
        self.session = requests.Session()
        self._update_headers()

    def _update_headers(self):
        """Update session headers with authentication."""
        headers = {"Content-Type": "application/json"}

        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
        elif self.api_key:
            headers["X-API-Key"] = self.api_key

        self.session.headers.update(headers)

    def _request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict] = None,
        json: Optional[Dict] = None,
    ) -> Any:
        """
        Make an HTTP request to the API.

        Args:
            method: HTTP method
            endpoint: API endpoint
            params: Query parameters
            json: JSON body

        Returns:
            Response data

        Raises:
            AISocialError: If the request fails
        """
        url = f"{self.base_url}{endpoint}"

        try:
            response = self.session.request(
                method=method,
                url=url,
                params=params,
                json=json,
                timeout=self.timeout,
            )

            if response.status_code >= 400:
                error_data = response.json().get("error", {})
                raise AISocialError(
                    message=error_data.get("message", "API Error"),
                    status_code=response.status_code,
                    code=error_data.get("code"),
                )

            return response.json()

        except requests.exceptions.RequestException as e:
            raise AISocialError(str(e), 0)

    # Authentication

    def login(self, email: str, password: str) -> Dict:
        """
        Login with email and password.

        Args:
            email: User email
            password: User password

        Returns:
            Authentication data including access token
        """
        response = self._request(
            "POST",
            "/api/v1/auth/login",
            json={"email": email, "password": password},
        )
        self.access_token = response["data"]["accessToken"]
        self._update_headers()
        return response["data"]

    def refresh_token(self, refresh_token: str) -> Dict:
        """
        Refresh access token.

        Args:
            refresh_token: Refresh token

        Returns:
            New authentication data
        """
        response = self._request(
            "POST",
            "/api/v1/auth/refresh",
            json={"refreshToken": refresh_token},
        )
        self.access_token = response["data"]["accessToken"]
        self._update_headers()
        return response["data"]

    # Posts

    def create_post(self, post: Post) -> Dict:
        """Create a new post."""
        response = self._request("POST", "/api/v1/posts", json=post)
        return response["data"]

    def get_post(self, post_id: str) -> Dict:
        """Get a post by ID."""
        response = self._request("GET", f"/api/v1/posts/{post_id}")
        return response["data"]

    def list_posts(
        self,
        status: Optional[str] = None,
        platform: Optional[str] = None,
        limit: int = 20,
        cursor: Optional[str] = None,
    ) -> Dict:
        """List posts with optional filters."""
        params = {"limit": limit}
        if status:
            params["status"] = status
        if platform:
            params["platform"] = platform
        if cursor:
            params["cursor"] = cursor

        return self._request("GET", "/api/v1/posts", params=params)

    def update_post(self, post_id: str, updates: Dict) -> Dict:
        """Update a post."""
        response = self._request("PUT", f"/api/v1/posts/{post_id}", json=updates)
        return response["data"]

    def delete_post(self, post_id: str) -> None:
        """Delete a post."""
        self._request("DELETE", f"/api/v1/posts/{post_id}")

    def publish_post(self, post_id: str) -> Dict:
        """Publish a post immediately."""
        response = self._request("POST", f"/api/v1/posts/{post_id}/publish")
        return response["data"]

    def bulk_create_posts(self, posts: List[Post]) -> Dict:
        """Create multiple posts in bulk."""
        response = self._request("POST", "/api/v1/posts/bulk", json={"posts": posts})
        return response["data"]

    # AI

    def generate_content(self, request: AIGenerateRequest) -> Dict:
        """Generate content using AI."""
        response = self._request("POST", "/api/v1/ai/generate", json=request)
        return response["data"]

    def optimize_content(
        self, content: str, platform: str, goals: Optional[List[str]] = None
    ) -> Dict:
        """Optimize content for a platform."""
        response = self._request(
            "POST",
            "/api/v1/ai/optimize",
            json={
                "content": content,
                "platform": platform,
                "optimizationGoals": goals,
            },
        )
        return response["data"]

    def generate_hashtags(self, content: str, platform: str, count: int = 30) -> Dict:
        """Generate hashtags for content."""
        response = self._request(
            "POST",
            "/api/v1/ai/hashtags",
            json={"content": content, "platform": platform, "count": count},
        )
        return response["data"]

    def get_strategy_recommendations(
        self, goals: List[str], platforms: List[str], timeframe: str = "30_days"
    ) -> Dict:
        """Get AI strategy recommendations."""
        response = self._request(
            "POST",
            "/api/v1/ai/strategy",
            json={"goals": goals, "platforms": platforms, "timeframe": timeframe},
        )
        return response["data"]

    # Analytics

    def get_analytics_overview(self, query: Optional[AnalyticsQuery] = None) -> Dict:
        """Get analytics overview."""
        response = self._request("GET", "/api/v1/analytics/overview", params=query)
        return response["data"]

    def get_post_analytics(self, post_id: str) -> Dict:
        """Get analytics for a specific post."""
        response = self._request("GET", f"/api/v1/analytics/posts/{post_id}")
        return response["data"]

    def get_audience_analytics(self) -> Dict:
        """Get audience analytics."""
        response = self._request("GET", "/api/v1/analytics/audience")
        return response["data"]

    def generate_report(self, config: ReportConfig) -> Dict:
        """Generate a custom report."""
        response = self._request("POST", "/api/v1/analytics/reports", json=config)
        return response["data"]

    # Social Listening

    def create_listening_query(self, query: ListeningQuery) -> Dict:
        """Create a social listening query."""
        response = self._request("POST", "/api/v1/listening/queries", json=query)
        return response["data"]

    def get_mentions(
        self, query_id: str, limit: int = 50, cursor: Optional[str] = None
    ) -> Dict:
        """Get mentions for a listening query."""
        params = {"queryId": query_id, "limit": limit}
        if cursor:
            params["cursor"] = cursor

        return self._request("GET", "/api/v1/listening/mentions", params=params)

    def get_sentiment_analysis(
        self, query_id: str, start_date: Optional[str] = None
    ) -> Dict:
        """Get sentiment analysis for a query."""
        params = {"queryId": query_id}
        if start_date:
            params["startDate"] = start_date

        response = self._request("GET", "/api/v1/listening/sentiment", params=params)
        return response["data"]

    def get_trending_topics(self) -> Dict:
        """Get trending topics."""
        response = self._request("GET", "/api/v1/listening/trends")
        return response["data"]

    # Inbox

    def get_inbox_messages(
        self,
        status: Optional[str] = None,
        platform: Optional[str] = None,
        limit: int = 20,
        cursor: Optional[str] = None,
    ) -> Dict:
        """Get inbox messages."""
        params = {"limit": limit}
        if status:
            params["status"] = status
        if platform:
            params["platform"] = platform
        if cursor:
            params["cursor"] = cursor

        return self._request("GET", "/api/v1/inbox/messages", params=params)

    def reply_to_message(
        self, message_id: str, content: str, use_template: bool = False
    ) -> Dict:
        """Reply to an inbox message."""
        response = self._request(
            "POST",
            f"/api/v1/inbox/messages/{message_id}/reply",
            json={"content": content, "useTemplate": use_template},
        )
        return response["data"]

    def assign_message(self, message_id: str, user_id: str) -> Dict:
        """Assign a message to a team member."""
        response = self._request(
            "PUT",
            f"/api/v1/inbox/messages/{message_id}/assign",
            json={"userId": user_id},
        )
        return response["data"]

    def create_reply_template(self, name: str, content: str, category: str) -> Dict:
        """Create a reply template."""
        response = self._request(
            "POST",
            "/api/v1/inbox/templates",
            json={"name": name, "content": content, "category": category},
        )
        return response["data"]

    # Webhooks

    def create_webhook(self, config: WebhookConfig) -> Dict:
        """Create a webhook."""
        response = self._request("POST", "/api/v1/webhooks", json=config)
        return response["data"]

    def list_webhooks(self) -> List[Dict]:
        """List all webhooks."""
        response = self._request("GET", "/api/v1/webhooks")
        return response["data"]

    def test_webhook(self, webhook_id: str) -> Dict:
        """Test a webhook."""
        response = self._request("POST", f"/api/v1/webhooks/{webhook_id}/test")
        return response["data"]

    def delete_webhook(self, webhook_id: str) -> None:
        """Delete a webhook."""
        self._request("DELETE", f"/api/v1/webhooks/{webhook_id}")

    # Social Accounts

    def list_social_accounts(self) -> List[Dict]:
        """List connected social accounts."""
        response = self._request("GET", "/api/v1/social-accounts")
        return response["data"]

    def connect_social_account(self, platform: str, auth_code: str) -> Dict:
        """Connect a social account."""
        response = self._request(
            "POST",
            "/api/v1/social-accounts/connect",
            json={"platform": platform, "authCode": auth_code},
        )
        return response["data"]

    def disconnect_social_account(self, account_id: str) -> None:
        """Disconnect a social account."""
        self._request("DELETE", f"/api/v1/social-accounts/{account_id}")
