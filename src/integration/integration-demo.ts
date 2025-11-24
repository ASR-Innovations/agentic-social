/**
 * Integration Framework Demo
 * 
 * This file demonstrates the capabilities of the Integration Framework.
 * It shows how to use the various services for integrations, webhooks, and API keys.
 */

import { IntegrationService } from './services/integration.service';
import { WebhookService } from './services/webhook.service';
import { ApiKeyService } from './services/api-key.service';
import { OAuthService } from './services/oauth.service';
import { RateLimitService } from './services/rate-limit.service';

/**
 * Example 1: Creating an Integration
 * 
 * This example shows how to create a CRM integration with OAuth configuration.
 */
async function createIntegrationExample(integrationService: IntegrationService) {
  const integration = await integrationService.create(
    'workspace-123',
    'user-456',
    {
      name: 'Salesforce CRM',
      type: 'CRM' as any,
      provider: 'salesforce',
      description: 'Sync contacts and leads with Salesforce',
      scopes: ['read_contacts', 'write_leads', 'read_opportunities'],
      config: {
        authorizationUrl: 'https://login.salesforce.com/services/oauth2/authorize',
        tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
        clientId: 'your_salesforce_client_id',
        clientSecret: 'your_salesforce_client_secret',
        supportsPKCE: true,
      },
      rateLimitPerHour: 1000,
      rateLimitPerDay: 10000,
    }
  );

  console.log('Created integration:', integration.id);
  return integration;
}

/**
 * Example 2: Initiating OAuth Flow
 * 
 * This example shows how to start an OAuth flow for an integration.
 */
async function initiateOAuthExample(oauthService: OAuthService) {
  const oauthFlow = await oauthService.initiateOAuth(
    'integration-123',
    'workspace-123',
    'https://yourapp.com/oauth/callback'
  );

  console.log('OAuth Authorization URL:', oauthFlow.authorizationUrl);
  console.log('State token:', oauthFlow.state);
  
  // User would be redirected to authorizationUrl
  // After authorization, they return to callback with code and state
  
  return oauthFlow;
}

/**
 * Example 3: Handling OAuth Callback
 * 
 * This example shows how to handle the OAuth callback and exchange code for tokens.
 */
async function handleOAuthCallbackExample(oauthService: OAuthService) {
  const result = await oauthService.handleCallback(
    'authorization_code_from_provider',
    'state_token_from_initiate'
  );

  console.log('OAuth callback handled:', result);
  // Tokens are now encrypted and stored in the integration
  
  return result;
}

/**
 * Example 4: Creating a Webhook
 * 
 * This example shows how to create a webhook that triggers on specific events.
 */
async function createWebhookExample(webhookService: WebhookService) {
  const webhook = await webhookService.create(
    'workspace-123',
    'user-456',
    {
      name: 'Post Published Webhook',
      url: 'https://yourapp.com/webhooks/post-published',
      events: ['POST_PUBLISHED', 'POST_FAILED'] as any,
      headers: {
        'X-Custom-Header': 'custom-value',
        'X-API-Version': 'v1',
      },
      retryConfig: {
        maxRetries: 3,
        backoffMultiplier: 2,
      },
    }
  );

  console.log('Created webhook:', webhook.id);
  console.log('Webhook secret (save this!):', webhook.secret);
  
  return webhook;
}

/**
 * Example 5: Triggering a Webhook
 * 
 * This example shows how to trigger webhooks for a specific event.
 */
async function triggerWebhookExample(webhookService: WebhookService) {
  await webhookService.trigger(
    'POST_PUBLISHED' as any,
    'workspace-123',
    {
      event: 'POST_PUBLISHED',
      timestamp: new Date().toISOString(),
      workspaceId: 'workspace-123',
      data: {
        postId: 'post-789',
        platforms: ['INSTAGRAM', 'FACEBOOK'],
        content: 'Check out our new product!',
        publishedAt: new Date().toISOString(),
      },
    }
  );

  console.log('Webhooks triggered for POST_PUBLISHED event');
}

/**
 * Example 6: Verifying Webhook Signature
 * 
 * This example shows how to verify a webhook signature on the receiving end.
 */
function verifyWebhookSignature(payload: any, signature: string, secret: string): boolean {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  const expectedSignature = hmac.digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Example 7: Creating an API Key
 * 
 * This example shows how to create an API key for programmatic access.
 */
async function createApiKeyExample(apiKeyService: ApiKeyService) {
  const apiKey = await apiKeyService.create(
    'workspace-123',
    'user-456',
    {
      name: 'Production API Key',
      scopes: ['posts:read', 'posts:write', 'analytics:read'],
      rateLimitPerHour: 1000,
      rateLimitPerDay: 10000,
      expiresAt: '2025-12-31T23:59:59Z',
    }
  );

  console.log('Created API key:', apiKey.id);
  console.log('API key (save this, it will not be shown again!):', apiKey.key);
  
  return apiKey;
}

/**
 * Example 8: Verifying an API Key
 * 
 * This example shows how to verify an API key.
 */
async function verifyApiKeyExample(apiKeyService: ApiKeyService) {
  const verification = await apiKeyService.verify('sk_live_abc123...');
  
  if (verification) {
    console.log('API key is valid');
    console.log('Workspace ID:', verification.workspaceId);
    console.log('Scopes:', verification.scopes);
  } else {
    console.log('API key is invalid or expired');
  }
  
  return verification;
}

/**
 * Example 9: Checking Rate Limits
 * 
 * This example shows how to check rate limits for a resource.
 */
async function checkRateLimitExample(rateLimitService: RateLimitService) {
  const rateLimit = await rateLimitService.checkRateLimit(
    'api_key',
    'key-123',
    'workspace-123',
    1000, // hourly limit
    10000 // daily limit
  );

  if (rateLimit.allowed) {
    console.log('Request allowed');
    console.log('Remaining requests:', rateLimit.remaining);
    console.log('Reset at:', rateLimit.resetAt);
  } else {
    console.log('Rate limit exceeded');
    console.log('Try again at:', rateLimit.resetAt);
  }
  
  return rateLimit;
}

/**
 * Example 10: Getting Integration Marketplace
 * 
 * This example shows how to get public integrations from the marketplace.
 */
async function getMarketplaceExample(integrationService: IntegrationService) {
  const marketplace = await integrationService.getMarketplace();
  
  console.log('Available integrations in marketplace:');
  marketplace.forEach(integration => {
    console.log(`- ${integration.name} (${integration.provider})`);
    console.log(`  Type: ${integration.type}`);
    console.log(`  Description: ${integration.description}`);
  });
  
  return marketplace;
}

/**
 * Example 11: Using API Key in HTTP Request
 * 
 * This example shows how to use an API key in an HTTP request.
 */
async function useApiKeyInRequestExample() {
  const axios = require('axios');
  
  // Option 1: Using Authorization header
  const response1 = await axios.get('https://api.yourapp.com/posts', {
    headers: {
      'Authorization': 'Bearer sk_live_abc123...',
    },
  });
  
  // Option 2: Using X-API-Key header
  const response2 = await axios.get('https://api.yourapp.com/posts', {
    headers: {
      'X-API-Key': 'sk_live_abc123...',
    },
  });
  
  console.log('API request successful');
  console.log('Rate limit remaining:', response1.headers['x-ratelimit-remaining']);
  console.log('Rate limit reset:', response1.headers['x-ratelimit-reset']);
}

/**
 * Example 12: Webhook Receiver Implementation
 * 
 * This example shows how to implement a webhook receiver endpoint.
 */
function webhookReceiverExample() {
  const express = require('express');
  const app = express();
  
  app.post('/webhooks/post-published', express.json(), (req: any, res: any) => {
    const signature = req.headers['x-webhook-signature'];
    const payload = req.body;
    const secret = 'your_webhook_secret';
    
    // Verify signature
    if (!verifyWebhookSignature(payload, signature, secret)) {
      return res.status(401).send('Invalid signature');
    }
    
    // Process webhook
    console.log('Received event:', payload.event);
    console.log('Post ID:', payload.data.postId);
    console.log('Platforms:', payload.data.platforms);
    
    // Respond with 200 to acknowledge receipt
    res.status(200).send('OK');
  });
  
  app.listen(3000, () => {
    console.log('Webhook receiver listening on port 3000');
  });
}

/**
 * Example 13: Integration with Zapier
 * 
 * This example shows how the integration framework works with Zapier.
 */
async function zapierIntegrationExample() {
  // When a user connects your app to Zapier:
  // 1. Zapier initiates OAuth flow
  // 2. User authorizes the connection
  // 3. Zapier receives access token
  // 4. Zapier subscribes to triggers (webhooks)
  
  // When an event occurs in your app:
  // 1. Your app triggers the webhook
  // 2. Webhook service delivers payload to Zapier
  // 3. Zapier processes the trigger
  // 4. Zapier executes the user's Zap
  
  console.log('Zapier integration flow:');
  console.log('1. OAuth authorization');
  console.log('2. Webhook subscription');
  console.log('3. Event triggering');
  console.log('4. Zap execution');
}

/**
 * Example 14: Refreshing OAuth Token
 * 
 * This example shows how to refresh an expired OAuth token.
 */
async function refreshTokenExample(oauthService: OAuthService) {
  const result = await oauthService.refreshToken('integration-123');
  
  if (result.success) {
    console.log('Token refreshed successfully');
  } else {
    console.log('Token refresh failed');
  }
  
  return result;
}

/**
 * Example 15: Retrying Failed Webhook Delivery
 * 
 * This example shows how to manually retry a failed webhook delivery.
 */
async function retryWebhookDeliveryExample(webhookService: WebhookService) {
  await webhookService.retryDelivery('delivery-123', 'workspace-123');
  
  console.log('Webhook delivery retry initiated');
}

// Export all examples
export {
  createIntegrationExample,
  initiateOAuthExample,
  handleOAuthCallbackExample,
  createWebhookExample,
  triggerWebhookExample,
  verifyWebhookSignature,
  createApiKeyExample,
  verifyApiKeyExample,
  checkRateLimitExample,
  getMarketplaceExample,
  useApiKeyInRequestExample,
  webhookReceiverExample,
  zapierIntegrationExample,
  refreshTokenExample,
  retryWebhookDeliveryExample,
};
