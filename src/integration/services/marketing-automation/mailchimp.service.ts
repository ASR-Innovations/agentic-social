import { Injectable, Logger } from '@nestjs/common';
import {
  BaseMarketingAutomationService,
  MarketingAutomationContact,
  MarketingAutomationList,
  MarketingAutomationCampaign,
  SyncResult,
  AudienceStats,
} from './base-marketing-automation.service';
import {
  SyncAudienceDto,
  CreateListDto,
  AddToListDto,
  UpdateContactDto,
  TrackEventDto,
} from '../../dto/marketing-automation.dto';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';

interface MailchimpConfig {
  apiKey: string;
  serverPrefix?: string; // e.g., 'us1', 'us2', etc.
}

@Injectable()
export class MailchimpService extends BaseMarketingAutomationService {
  private readonly logger = new Logger(MailchimpService.name);
  private client: AxiosInstance;
  private config: MailchimpConfig;

  constructor() {
    super();
  }

  /**
   * Initialize Mailchimp client with credentials
   */
  initialize(config: MailchimpConfig) {
    this.config = config;
    
    // Extract server prefix from API key (format: key-us1)
    const serverPrefix = config.serverPrefix || config.apiKey.split('-').pop();
    
    this.client = axios.create({
      baseURL: `https://${serverPrefix}.api.mailchimp.com/3.0`,
      auth: {
        username: 'anystring',
        password: config.apiKey,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/ping');
      return response.status === 200;
    } catch (error: any) {
      this.logger.error('Mailchimp connection test failed', error);
      return false;
    }
  }

  async syncContact(contact: SyncAudienceDto): Promise<SyncResult> {
    try {
      if (!contact.listId) {
        throw new Error('listId is required for Mailchimp sync');
      }

      const existing = await this.getContactByEmail(contact.email);

      if (existing) {
        return await this.updateContact(existing.id, contact);
      }

      // Create new contact
      const subscriberHash = this.getSubscriberHash(contact.email);
      const mailchimpContact = this.mapToMailchimpContact(contact);

      const response = await this.client.put(
        `/lists/${contact.listId}/members/${subscriberHash}`,
        mailchimpContact,
      );

      return {
        success: true,
        recordId: response.data.id,
        action: 'created',
      };
    } catch (error: any) {
      this.logger.error('Failed to sync contact to Mailchimp', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async getContactByEmail(email: string): Promise<MarketingAutomationContact | null> {
    try {
      // Search across all lists
      const response = await this.client.get('/search-members', {
        params: {
          query: email,
        },
      });

      if (!response.data.exact_matches || response.data.exact_matches.members.length === 0) {
        return null;
      }

      const member = response.data.exact_matches.members[0];
      return this.mapFromMailchimpContact(member);
    } catch (error: any) {
      this.logger.error('Failed to get contact from Mailchimp', error);
      return null;
    }
  }

  async updateContact(contactId: string, data: Partial<UpdateContactDto>): Promise<SyncResult> {
    try {
      // Extract list ID and subscriber hash from contact ID
      // Mailchimp contact ID format: listId:subscriberHash
      const [listId, subscriberHash] = contactId.split(':');

      const updateData: any = {};

      if (data.firstName || data.lastName) {
        updateData.merge_fields = {};
        if (data.firstName) updateData.merge_fields.FNAME = data.firstName;
        if (data.lastName) updateData.merge_fields.LNAME = data.lastName;
      }

      if (data.tags) {
        updateData.tags = data.tags.map(tag => ({ name: tag, status: 'active' }));
      }

      if (data.customFields) {
        updateData.merge_fields = {
          ...updateData.merge_fields,
          ...data.customFields,
        };
      }

      if (data.socialData) {
        updateData.merge_fields = {
          ...updateData.merge_fields,
          SOCIAL_PLATFORM: data.socialData.platform,
          SOCIAL_USERNAME: data.socialData.username,
          SOCIAL_FOLLOWERS: data.socialData.followers,
          SOCIAL_ENGAGEMENT: data.socialData.engagementRate,
        };
      }

      await this.client.patch(
        `/lists/${listId}/members/${subscriberHash}`,
        updateData,
      );

      return {
        success: true,
        recordId: contactId,
        action: 'updated',
      };
    } catch (error: any) {
      this.logger.error('Failed to update contact in Mailchimp', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async createList(list: CreateListDto): Promise<MarketingAutomationList> {
    try {
      const response = await this.client.post('/lists', {
        name: list.name,
        contact: {
          company: 'Social Media Platform',
          address1: '',
          city: '',
          state: '',
          zip: '',
          country: 'US',
        },
        permission_reminder: 'You signed up for updates from our social media platform.',
        campaign_defaults: {
          from_name: 'Social Media Platform',
          from_email: 'noreply@example.com',
          subject: '',
          language: 'en',
        },
        email_type_option: true,
        double_optin: list.doubleOptIn ?? false,
      });

      return {
        id: response.data.id,
        name: response.data.name,
        description: list.description,
        memberCount: 0,
        createdAt: new Date(response.data.date_created),
        updatedAt: new Date(response.data.date_created),
      };
    } catch (error: any) {
      this.logger.error('Failed to create list in Mailchimp', error);
      throw error;
    }
  }

  async getLists(): Promise<MarketingAutomationList[]> {
    try {
      const response = await this.client.get('/lists', {
        params: {
          count: 100,
        },
      });

      return response.data.lists.map((list: any) => ({
        id: list.id,
        name: list.name,
        description: list.description,
        memberCount: list.stats.member_count,
        createdAt: new Date(list.date_created),
        updatedAt: new Date(list.date_created),
      }));
    } catch (error: any) {
      this.logger.error('Failed to get lists from Mailchimp', error);
      return [];
    }
  }

  async addToList(data: AddToListDto): Promise<SyncResult[]> {
    try {
      const operations = data.contacts.map(contact => ({
        method: 'PUT',
        path: `/lists/${data.listId}/members/${this.getSubscriberHash(contact.email)}`,
        body: JSON.stringify(this.mapToMailchimpContact({ ...contact, listId: data.listId })),
      }));

      const response = await this.client.post('/batches', {
        operations,
      });

      // Return batch operation ID - actual results need to be polled
      return data.contacts.map(() => ({
        success: true,
        recordId: response.data.id,
        action: 'created' as const,
      }));
    } catch (error: any) {
      this.logger.error('Failed to add contacts to list in Mailchimp', error);
      // Fallback to sequential processing
      const results: SyncResult[] = [];
      for (const contact of data.contacts) {
        const result = await this.syncContact({ ...contact, listId: data.listId });
        results.push(result);
      }
      return results;
    }
  }

  async removeFromList(listId: string, email: string): Promise<SyncResult> {
    try {
      const subscriberHash = this.getSubscriberHash(email);
      
      await this.client.patch(
        `/lists/${listId}/members/${subscriberHash}`,
        { status: 'unsubscribed' },
      );

      return {
        success: true,
        recordId: `${listId}:${subscriberHash}`,
        action: 'updated',
      };
    } catch (error: any) {
      this.logger.error('Failed to remove contact from list in Mailchimp', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async trackEvent(event: TrackEventDto): Promise<SyncResult> {
    try {
      // Mailchimp uses "events" for tracking custom activities
      const contact = await this.getContactByEmail(event.email);
      
      if (!contact) {
        return {
          success: false,
          error: 'Contact not found',
          action: 'skipped',
        };
      }

      const [listId, subscriberHash] = contact.id.split(':');

      await this.client.post(
        `/lists/${listId}/members/${subscriberHash}/events`,
        {
          name: event.eventName,
          properties: event.eventData || {},
        },
      );

      return {
        success: true,
        recordId: contact.id,
        action: 'updated',
      };
    } catch (error: any) {
      this.logger.error('Failed to track event in Mailchimp', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async getAudienceStats(listId?: string): Promise<AudienceStats> {
    try {
      if (listId) {
        const response = await this.client.get(`/lists/${listId}`);
        const stats = response.data.stats;

        return {
          totalContacts: stats.member_count,
          activeContacts: stats.member_count - stats.unsubscribe_count,
          unsubscribed: stats.unsubscribe_count,
          bounced: stats.cleaned_count,
          avgEngagementRate: stats.open_rate,
        };
      }

      // Get stats across all lists
      const lists = await this.getLists();
      const totalStats = lists.reduce(
        (acc, list) => ({
          totalContacts: acc.totalContacts + list.memberCount,
          activeContacts: acc.activeContacts + list.memberCount,
          unsubscribed: acc.unsubscribed,
          bounced: acc.bounced,
        }),
        { totalContacts: 0, activeContacts: 0, unsubscribed: 0, bounced: 0 },
      );

      return totalStats;
    } catch (error: any) {
      this.logger.error('Failed to get audience stats from Mailchimp', error);
      return {
        totalContacts: 0,
        activeContacts: 0,
        unsubscribed: 0,
        bounced: 0,
      };
    }
  }

  async getCampaigns(): Promise<MarketingAutomationCampaign[]> {
    try {
      const response = await this.client.get('/campaigns', {
        params: {
          count: 100,
          status: 'sent',
        },
      });

      return response.data.campaigns.map((campaign: any) => ({
        id: campaign.id,
        name: campaign.settings.title,
        subject: campaign.settings.subject_line,
        status: campaign.status,
        sentCount: campaign.emails_sent,
        openRate: campaign.report_summary?.open_rate,
        clickRate: campaign.report_summary?.click_rate,
        createdAt: new Date(campaign.create_time),
      }));
    } catch (error: any) {
      this.logger.error('Failed to get campaigns from Mailchimp', error);
      return [];
    }
  }

  async batchSyncContacts(contacts: SyncAudienceDto[]): Promise<SyncResult[]> {
    // Group contacts by list
    const contactsByList = contacts.reduce((acc, contact) => {
      const listId = contact.listId || 'default';
      if (!acc[listId]) acc[listId] = [];
      acc[listId].push(contact);
      return acc;
    }, {} as Record<string, SyncAudienceDto[]>);

    const results: SyncResult[] = [];

    for (const [listId, listContacts] of Object.entries(contactsByList)) {
      const batchResults = await this.addToList({
        listId,
        contacts: listContacts,
        updateExisting: true,
      });
      results.push(...batchResults);
    }

    return results;
  }

  async addTags(email: string, tags: string[]): Promise<SyncResult> {
    try {
      const contact = await this.getContactByEmail(email);
      
      if (!contact) {
        return {
          success: false,
          error: 'Contact not found',
          action: 'skipped',
        };
      }

      const [listId, subscriberHash] = contact.id.split(':');

      await this.client.post(
        `/lists/${listId}/members/${subscriberHash}/tags`,
        {
          tags: tags.map(tag => ({ name: tag, status: 'active' })),
        },
      );

      return {
        success: true,
        recordId: contact.id,
        action: 'updated',
      };
    } catch (error: any) {
      this.logger.error('Failed to add tags in Mailchimp', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async removeTags(email: string, tags: string[]): Promise<SyncResult> {
    try {
      const contact = await this.getContactByEmail(email);
      
      if (!contact) {
        return {
          success: false,
          error: 'Contact not found',
          action: 'skipped',
        };
      }

      const [listId, subscriberHash] = contact.id.split(':');

      await this.client.post(
        `/lists/${listId}/members/${subscriberHash}/tags`,
        {
          tags: tags.map(tag => ({ name: tag, status: 'inactive' })),
        },
      );

      return {
        success: true,
        recordId: contact.id,
        action: 'updated',
      };
    } catch (error: any) {
      this.logger.error('Failed to remove tags in Mailchimp', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async subscribeToList(email: string, listId: string): Promise<SyncResult> {
    try {
      const subscriberHash = this.getSubscriberHash(email);

      await this.client.put(
        `/lists/${listId}/members/${subscriberHash}`,
        {
          email_address: email,
          status: 'subscribed',
        },
      );

      return {
        success: true,
        recordId: `${listId}:${subscriberHash}`,
        action: 'updated',
      };
    } catch (error: any) {
      this.logger.error('Failed to subscribe to list in Mailchimp', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async unsubscribeFromList(email: string, listId: string): Promise<SyncResult> {
    return this.removeFromList(listId, email);
  }

  /**
   * Helper method to generate subscriber hash (MD5 of lowercase email)
   */
  private getSubscriberHash(email: string): string {
    return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  }

  private mapToMailchimpContact(contact: SyncAudienceDto): any {
    const mailchimpContact: any = {
      email_address: contact.email,
      status: 'subscribed',
    };

    if (contact.firstName || contact.lastName) {
      mailchimpContact.merge_fields = {};
      if (contact.firstName) mailchimpContact.merge_fields.FNAME = contact.firstName;
      if (contact.lastName) mailchimpContact.merge_fields.LNAME = contact.lastName;
    }

    if (contact.phone) {
      mailchimpContact.merge_fields = {
        ...mailchimpContact.merge_fields,
        PHONE: contact.phone,
      };
    }

    if (contact.tags) {
      mailchimpContact.tags = contact.tags;
    }

    // Map social profiles to merge fields
    if (contact.socialProfiles) {
      mailchimpContact.merge_fields = mailchimpContact.merge_fields || {};
      contact.socialProfiles.forEach(profile => {
        const platform = profile.platform.toUpperCase();
        mailchimpContact.merge_fields[`${platform}_USER`] = profile.username;
        mailchimpContact.merge_fields[`${platform}_URL`] = profile.url;
        if (profile.followers) {
          mailchimpContact.merge_fields[`${platform}_FOLLOW`] = profile.followers;
        }
      });
    }

    // Map custom fields
    if (contact.customFields) {
      mailchimpContact.merge_fields = {
        ...mailchimpContact.merge_fields,
        ...contact.customFields,
      };
    }

    return mailchimpContact;
  }

  private mapFromMailchimpContact(member: any): MarketingAutomationContact {
    return {
      id: `${member.list_id}:${member.id}`,
      email: member.email_address,
      firstName: member.merge_fields?.FNAME,
      lastName: member.merge_fields?.LNAME,
      phone: member.merge_fields?.PHONE,
      tags: member.tags?.map((tag: any) => tag.name) || [],
      lists: [member.list_id],
      status: member.status,
      createdAt: new Date(member.timestamp_signup || member.timestamp_opt),
      updatedAt: new Date(member.last_changed),
    };
  }
}
