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

interface ActiveCampaignConfig {
  apiKey: string;
  apiUrl: string; // e.g., 'https://youraccountname.api-us1.com'
}

@Injectable()
export class ActiveCampaignService extends BaseMarketingAutomationService {
  private readonly logger = new Logger(ActiveCampaignService.name);
  private client: AxiosInstance;
  private config: ActiveCampaignConfig;

  constructor() {
    super();
  }

  /**
   * Initialize ActiveCampaign client with credentials
   */
  initialize(config: ActiveCampaignConfig) {
    this.config = config;
    
    this.client = axios.create({
      baseURL: `${config.apiUrl}/api/3`,
      headers: {
        'Api-Token': config.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/users/me');
      return response.status === 200;
    } catch (error: any) {
      this.logger.error('ActiveCampaign connection test failed', error);
      return false;
    }
  }

  async syncContact(contact: SyncAudienceDto): Promise<SyncResult> {
    try {
      const existing = await this.getContactByEmail(contact.email);

      if (existing) {
        return await this.updateContact(existing.id, contact);
      }

      // Create new contact
      const acContact = this.mapToActiveCampaignContact(contact);
      const response = await this.client.post('/contacts', {
        contact: acContact,
      });

      // Add to list if specified
      if (contact.listId) {
        await this.subscribeToList(contact.email, contact.listId);
      }

      return {
        success: true,
        recordId: response.data.contact.id,
        action: 'created',
      };
    } catch (error: any) {
      this.logger.error('Failed to sync contact to ActiveCampaign', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async getContactByEmail(email: string): Promise<MarketingAutomationContact | null> {
    try {
      const response = await this.client.get('/contacts', {
        params: {
          email,
        },
      });

      if (!response.data.contacts || response.data.contacts.length === 0) {
        return null;
      }

      const contact = response.data.contacts[0];
      return this.mapFromActiveCampaignContact(contact);
    } catch (error: any) {
      this.logger.error('Failed to get contact from ActiveCampaign', error);
      return null;
    }
  }

  async updateContact(contactId: string, data: Partial<UpdateContactDto>): Promise<SyncResult> {
    try {
      const updateData: any = {};

      if (data.firstName) updateData.firstName = data.firstName;
      if (data.lastName) updateData.lastName = data.lastName;
      if (data.email) updateData.email = data.email;
      if ((data as any).phone) updateData.phone = (data as any).phone;

      // Update custom fields
      const fieldValues: any[] = [];
      
      if (data.customFields) {
        for (const [key, value] of Object.entries(data.customFields)) {
          fieldValues.push({
            field: key,
            value: String(value),
          });
        }
      }

      if (data.socialData) {
        fieldValues.push(
          { field: 'social_platform', value: data.socialData.platform },
          { field: 'social_username', value: data.socialData.username },
          { field: 'social_followers', value: String(data.socialData.followers) },
          { field: 'social_engagement', value: String(data.socialData.engagementRate) },
        );
      }

      await this.client.put(`/contacts/${contactId}`, {
        contact: updateData,
      });

      // Update field values separately if any
      if (fieldValues.length > 0) {
        for (const fieldValue of fieldValues) {
          await this.client.post('/fieldValues', {
            fieldValue: {
              contact: contactId,
              ...fieldValue,
            },
          });
        }
      }

      // Update tags
      if (data.tags) {
        await this.updateContactTags(contactId, data.tags);
      }

      return {
        success: true,
        recordId: contactId,
        action: 'updated',
      };
    } catch (error: any) {
      this.logger.error('Failed to update contact in ActiveCampaign', error);
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
        list: {
          name: list.name,
          stringid: list.name.toLowerCase().replace(/\s+/g, '-'),
          sender_url: 'https://example.com',
          sender_reminder: 'You signed up for updates from our social media platform.',
        },
      });

      return {
        id: response.data.list.id,
        name: response.data.list.name,
        description: list.description,
        memberCount: 0,
        createdAt: new Date(response.data.list.cdate),
        updatedAt: new Date(response.data.list.udate),
      };
    } catch (error: any) {
      this.logger.error('Failed to create list in ActiveCampaign', error);
      throw error;
    }
  }

  async getLists(): Promise<MarketingAutomationList[]> {
    try {
      const response = await this.client.get('/lists', {
        params: {
          limit: 100,
        },
      });

      return response.data.lists.map((list: any) => ({
        id: list.id,
        name: list.name,
        description: list.stringid,
        memberCount: parseInt(list.subscriber_count || '0'),
        createdAt: new Date(list.cdate),
        updatedAt: new Date(list.udate),
      }));
    } catch (error: any) {
      this.logger.error('Failed to get lists from ActiveCampaign', error);
      return [];
    }
  }

  async addToList(data: AddToListDto): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    for (const contact of data.contacts) {
      try {
        // Sync contact first
        const syncResult = await this.syncContact({ ...contact, listId: data.listId });
        
        if (syncResult.success && syncResult.recordId) {
          // Subscribe to list
          await this.subscribeToList(contact.email, data.listId);
        }
        
        results.push(syncResult);
      } catch (error: any) {
        results.push({
          success: false,
          error: error.message,
          action: 'skipped',
        });
      }
    }

    return results;
  }

  async removeFromList(listId: string, email: string): Promise<SyncResult> {
    try {
      const contact = await this.getContactByEmail(email);
      
      if (!contact) {
        return {
          success: false,
          error: 'Contact not found',
          action: 'skipped',
        };
      }

      // Find the contact list relationship
      const response = await this.client.get('/contactLists', {
        params: {
          'filters[contact]': contact.id,
          'filters[list]': listId,
        },
      });

      if (response.data.contactLists && response.data.contactLists.length > 0) {
        const contactListId = response.data.contactLists[0].id;
        
        // Update status to unsubscribed
        await this.client.put(`/contactLists/${contactListId}`, {
          contactList: {
            status: 2, // 2 = unsubscribed
          },
        });
      }

      return {
        success: true,
        recordId: contact.id,
        action: 'updated',
      };
    } catch (error: any) {
      this.logger.error('Failed to remove contact from list in ActiveCampaign', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async trackEvent(event: TrackEventDto): Promise<SyncResult> {
    try {
      const contact = await this.getContactByEmail(event.email);
      
      if (!contact) {
        return {
          success: false,
          error: 'Contact not found',
          action: 'skipped',
        };
      }

      await this.client.post('/trackingLogs', {
        trackingLog: {
          email: event.email,
          actid: '0', // Account ID
          key: event.eventName,
          value: event.eventValue || '',
          tstamp: new Date().toISOString(),
        },
      });

      return {
        success: true,
        recordId: contact.id,
        action: 'updated',
      };
    } catch (error: any) {
      this.logger.error('Failed to track event in ActiveCampaign', error);
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
        const list = response.data.list;

        return {
          totalContacts: parseInt(list.subscriber_count || '0'),
          activeContacts: parseInt(list.subscriber_count || '0'),
          unsubscribed: 0,
          bounced: 0,
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
      this.logger.error('Failed to get audience stats from ActiveCampaign', error);
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
          limit: 100,
        },
      });

      return response.data.campaigns.map((campaign: any) => ({
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        status: campaign.status,
        sentCount: parseInt(campaign.total_sent || '0'),
        openRate: parseFloat(campaign.opens_percent || '0'),
        clickRate: parseFloat(campaign.clicks_percent || '0'),
        createdAt: new Date(campaign.cdate),
      }));
    } catch (error: any) {
      this.logger.error('Failed to get campaigns from ActiveCampaign', error);
      return [];
    }
  }

  async batchSyncContacts(contacts: SyncAudienceDto[]): Promise<SyncResult[]> {
    // ActiveCampaign doesn't have a native batch API, process sequentially
    const results: SyncResult[] = [];
    
    for (const contact of contacts) {
      const result = await this.syncContact(contact);
      results.push(result);
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

      // Get or create tags
      for (const tagName of tags) {
        const tagResponse = await this.getOrCreateTag(tagName);
        
        // Add tag to contact
        await this.client.post('/contactTags', {
          contactTag: {
            contact: contact.id,
            tag: tagResponse.id,
          },
        });
      }

      return {
        success: true,
        recordId: contact.id,
        action: 'updated',
      };
    } catch (error: any) {
      this.logger.error('Failed to add tags in ActiveCampaign', error);
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

      // Get contact tags
      const response = await this.client.get('/contactTags', {
        params: {
          'filters[contact]': contact.id,
        },
      });

      // Remove specified tags
      for (const contactTag of response.data.contactTags || []) {
        const tagResponse = await this.client.get(`/tags/${contactTag.tag}`);
        const tagName = tagResponse.data.tag.tag;
        
        if (tags.includes(tagName)) {
          await this.client.delete(`/contactTags/${contactTag.id}`);
        }
      }

      return {
        success: true,
        recordId: contact.id,
        action: 'updated',
      };
    } catch (error: any) {
      this.logger.error('Failed to remove tags in ActiveCampaign', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async subscribeToList(email: string, listId: string): Promise<SyncResult> {
    try {
      const contact = await this.getContactByEmail(email);
      
      if (!contact) {
        return {
          success: false,
          error: 'Contact not found',
          action: 'skipped',
        };
      }

      await this.client.post('/contactLists', {
        contactList: {
          list: listId,
          contact: contact.id,
          status: 1, // 1 = subscribed
        },
      });

      return {
        success: true,
        recordId: contact.id,
        action: 'updated',
      };
    } catch (error: any) {
      this.logger.error('Failed to subscribe to list in ActiveCampaign', error);
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

  private async getOrCreateTag(tagName: string): Promise<{ id: string; tag: string }> {
    try {
      // Search for existing tag
      const response = await this.client.get('/tags', {
        params: {
          search: tagName,
        },
      });

      if (response.data.tags && response.data.tags.length > 0) {
        const existingTag = response.data.tags.find((t: any) => t.tag === tagName);
        if (existingTag) {
          return { id: existingTag.id, tag: existingTag.tag };
        }
      }

      // Create new tag
      const createResponse = await this.client.post('/tags', {
        tag: {
          tag: tagName,
          tagType: 'contact',
        },
      });

      return { id: createResponse.data.tag.id, tag: createResponse.data.tag.tag };
    } catch (error: any) {
      this.logger.error('Failed to get or create tag in ActiveCampaign', error);
      throw error;
    }
  }

  private async updateContactTags(contactId: string, tags: string[]): Promise<void> {
    // Get current tags
    const response = await this.client.get('/contactTags', {
      params: {
        'filters[contact]': contactId,
      },
    });

    const currentTags = response.data.contactTags || [];

    // Add new tags
    for (const tagName of tags) {
      const tagResponse = await this.getOrCreateTag(tagName);
      
      // Check if tag already exists for contact
      const hasTag = currentTags.some((ct: any) => ct.tag === tagResponse.id);
      
      if (!hasTag) {
        await this.client.post('/contactTags', {
          contactTag: {
            contact: contactId,
            tag: tagResponse.id,
          },
        });
      }
    }
  }

  private mapToActiveCampaignContact(contact: SyncAudienceDto): any {
    const acContact: any = {
      email: contact.email,
    };

    if (contact.firstName) acContact.firstName = contact.firstName;
    if (contact.lastName) acContact.lastName = contact.lastName;
    if (contact.phone) acContact.phone = contact.phone;

    // Custom fields will be added separately via fieldValues API

    return acContact;
  }

  private mapFromActiveCampaignContact(contact: any): MarketingAutomationContact {
    return {
      id: contact.id,
      email: contact.email,
      firstName: contact.firstName,
      lastName: contact.lastName,
      phone: contact.phone,
      tags: [], // Tags need to be fetched separately
      lists: [], // Lists need to be fetched separately
      status: contact.deleted === '0' ? 'active' : 'deleted',
      createdAt: new Date(contact.cdate),
      updatedAt: new Date(contact.udate),
    };
  }
}
