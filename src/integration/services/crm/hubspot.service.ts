import { Injectable, Logger } from '@nestjs/common';
import { BaseCRMService, CRMContact, CRMLead, CRMSyncResult } from './base-crm.service';
import { SyncContactDto, SyncLeadDto } from '../../dto/crm-sync.dto';
import axios, { AxiosInstance } from 'axios';

interface HubSpotConfig {
  accessToken: string;
  portalId?: string;
}

@Injectable()
export class HubSpotService extends BaseCRMService {
  private readonly logger = new Logger(HubSpotService.name);
  private client: AxiosInstance;
  private config: HubSpotConfig;

  constructor() {
    super();
  }

  /**
   * Initialize HubSpot client with credentials
   */
  initialize(config: HubSpotConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: 'https://api.hubapi.com',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/crm/v3/objects/contacts?limit=1');
      return response.status === 200;
    } catch (error: any) {
      this.logger.error('HubSpot connection test failed', error);
      return false;
    }
  }

  async syncContact(contact: SyncContactDto): Promise<CRMSyncResult> {
    try {
      // Check if contact exists
      const existing = await this.getContactByEmail(contact.email);

      if (existing) {
        // Update existing contact
        return await this.updateContact(existing.id, contact);
      }

      // Create new contact
      const hubspotContact = this.mapToHubSpotContact(contact);
      const response = await this.client.post('/crm/v3/objects/contacts', {
        properties: hubspotContact,
      });

      return {
        success: true,
        recordId: response.data.id,
        action: 'created',
      };
    } catch (error: any) {
      this.logger.error('Failed to sync contact to HubSpot', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async syncLead(lead: SyncLeadDto): Promise<CRMSyncResult> {
    try {
      // In HubSpot, leads are contacts with a specific lifecycle stage
      const existing = await this.getContactByEmail(lead.email);

      const hubspotLead = this.mapToHubSpotLead(lead);

      if (existing) {
        // Update existing contact
        const response = await this.client.patch(
          `/crm/v3/objects/contacts/${existing.id}`,
          { properties: hubspotLead },
        );

        return {
          success: true,
          recordId: response.data.id,
          action: 'updated',
        };
      }

      // Create new contact as lead
      const response = await this.client.post('/crm/v3/objects/contacts', {
        properties: hubspotLead,
      });

      return {
        success: true,
        recordId: response.data.id,
        action: 'created',
      };
    } catch (error: any) {
      this.logger.error('Failed to sync lead to HubSpot', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async getContactByEmail(email: string): Promise<CRMContact | null> {
    try {
      const response = await this.client.post('/crm/v3/objects/contacts/search', {
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'EQ',
                value: email,
              },
            ],
          },
        ],
        properties: [
          'email',
          'firstname',
          'lastname',
          'company',
          'phone',
          'createdate',
          'lastmodifieddate',
        ],
        limit: 1,
      });

      if (response.data.total === 0) {
        return null;
      }

      const record = response.data.results[0];
      return this.mapFromHubSpotContact(record);
    } catch (error: any) {
      this.logger.error('Failed to get contact from HubSpot', error);
      return null;
    }
  }

  async getLeadByEmail(email: string): Promise<CRMLead | null> {
    try {
      const response = await this.client.post('/crm/v3/objects/contacts/search', {
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'EQ',
                value: email,
              },
              {
                propertyName: 'lifecyclestage',
                operator: 'EQ',
                value: 'lead',
              },
            ],
          },
        ],
        properties: [
          'email',
          'firstname',
          'lastname',
          'company',
          'hs_lead_status',
          'hs_analytics_source',
          'createdate',
          'lastmodifieddate',
        ],
        limit: 1,
      });

      if (response.data.total === 0) {
        return null;
      }

      const record = response.data.results[0];
      return this.mapFromHubSpotLead(record);
    } catch (error: any) {
      this.logger.error('Failed to get lead from HubSpot', error);
      return null;
    }
  }

  async updateContact(contactId: string, data: Partial<SyncContactDto>): Promise<CRMSyncResult> {
    try {
      const hubspotContact = this.mapToHubSpotContact(data as SyncContactDto);
      await this.client.patch(`/crm/v3/objects/contacts/${contactId}`, {
        properties: hubspotContact,
      });

      return {
        success: true,
        recordId: contactId,
        action: 'updated',
      };
    } catch (error: any) {
      this.logger.error('Failed to update contact in HubSpot', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async updateLead(leadId: string, data: Partial<SyncLeadDto>): Promise<CRMSyncResult> {
    try {
      const hubspotLead = this.mapToHubSpotLead(data as SyncLeadDto);
      await this.client.patch(`/crm/v3/objects/contacts/${leadId}`, {
        properties: hubspotLead,
      });

      return {
        success: true,
        recordId: leadId,
        action: 'updated',
      };
    } catch (error: any) {
      this.logger.error('Failed to update lead in HubSpot', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async enrichContact(contactId: string, socialData: any): Promise<CRMSyncResult> {
    try {
      const enrichmentData: any = {};

      if (socialData.socialProfiles) {
        socialData.socialProfiles.forEach((profile: any) => {
          const platform = profile.platform.toLowerCase();
          enrichmentData[`${platform}_username`] = profile.username;
          enrichmentData[`${platform}_url`] = profile.url;
          if (profile.followers) {
            enrichmentData[`${platform}_followers`] = profile.followers;
          }
        });
      }

      if (socialData.engagementScore) {
        enrichmentData['social_engagement_score'] = socialData.engagementScore;
      }

      await this.client.patch(`/crm/v3/objects/contacts/${contactId}`, {
        properties: enrichmentData,
      });

      return {
        success: true,
        recordId: contactId,
        action: 'updated',
      };
    } catch (error: any) {
      this.logger.error('Failed to enrich contact in HubSpot', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async trackLeadAttribution(leadId: string, attribution: any): Promise<CRMSyncResult> {
    try {
      const attributionData: any = {
        hs_analytics_source: attribution.source,
      };

      if (attribution.campaign) {
        attributionData['hs_analytics_source_data_1'] = attribution.campaign;
      }

      if (attribution.touchpoints) {
        // Store touchpoints as JSON in a custom property
        attributionData['social_touchpoints'] = JSON.stringify(attribution.touchpoints);
      }

      await this.client.patch(`/crm/v3/objects/contacts/${leadId}`, {
        properties: attributionData,
      });

      return {
        success: true,
        recordId: leadId,
        action: 'updated',
      };
    } catch (error: any) {
      this.logger.error('Failed to track lead attribution in HubSpot', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async batchSyncContacts(contacts: SyncContactDto[]): Promise<CRMSyncResult[]> {
    try {
      // HubSpot supports batch operations
      const inputs = contacts.map((contact) => ({
        properties: this.mapToHubSpotContact(contact),
      }));

      const response = await this.client.post('/crm/v3/objects/contacts/batch/create', {
        inputs,
      });

      return response.data.results.map((result: any) => ({
        success: true,
        recordId: result.id,
        action: 'created' as const,
      }));
    } catch (error: any) {
      this.logger.error('Failed to batch sync contacts to HubSpot', error);
      // Fallback to sequential processing
      const results: CRMSyncResult[] = [];
      for (const contact of contacts) {
        const result = await this.syncContact(contact);
        results.push(result);
      }
      return results;
    }
  }

  async batchSyncLeads(leads: SyncLeadDto[]): Promise<CRMSyncResult[]> {
    try {
      const inputs = leads.map((lead) => ({
        properties: this.mapToHubSpotLead(lead),
      }));

      const response = await this.client.post('/crm/v3/objects/contacts/batch/create', {
        inputs,
      });

      return response.data.results.map((result: any) => ({
        success: true,
        recordId: result.id,
        action: 'created' as const,
      }));
    } catch (error: any) {
      this.logger.error('Failed to batch sync leads to HubSpot', error);
      // Fallback to sequential processing
      const results: CRMSyncResult[] = [];
      for (const lead of leads) {
        const result = await this.syncLead(lead);
        results.push(result);
      }
      return results;
    }
  }

  private mapToHubSpotContact(contact: SyncContactDto): any {
    const hubspotContact: any = {
      email: contact.email,
    };

    if (contact.firstName) hubspotContact.firstname = contact.firstName;
    if (contact.lastName) hubspotContact.lastname = contact.lastName;
    if (contact.company) hubspotContact.company = contact.company;
    if (contact.phone) hubspotContact.phone = contact.phone;

    // Map social profiles to custom properties
    if (contact.socialProfiles) {
      contact.socialProfiles.forEach((profile) => {
        const platform = profile.platform.toLowerCase();
        hubspotContact[`${platform}_username`] = profile.username;
        hubspotContact[`${platform}_url`] = profile.url;
        if (profile.followers) {
          hubspotContact[`${platform}_followers`] = profile.followers;
        }
      });
    }

    // Map custom fields
    if (contact.customFields) {
      Object.entries(contact.customFields).forEach(([key, value]) => {
        hubspotContact[key] = value;
      });
    }

    return hubspotContact;
  }

  private mapToHubSpotLead(lead: SyncLeadDto): any {
    const hubspotLead: any = {
      email: lead.email,
      lifecyclestage: 'lead',
    };

    if (lead.firstName) hubspotLead.firstname = lead.firstName;
    if (lead.lastName) hubspotLead.lastname = lead.lastName;
    if (lead.company) hubspotLead.company = lead.company;
    if (lead.source) hubspotLead.hs_analytics_source = lead.source;
    if (lead.status) hubspotLead.hs_lead_status = lead.status;

    // Map social context to custom properties
    if (lead.socialContext) {
      hubspotLead.social_platform = lead.socialContext.platform;
      hubspotLead.social_sentiment = lead.socialContext.sentiment;
      hubspotLead.social_engagement_score = lead.socialContext.engagementScore;
    }

    // Map custom fields
    if (lead.customFields) {
      Object.entries(lead.customFields).forEach(([key, value]) => {
        hubspotLead[key] = value;
      });
    }

    return hubspotLead;
  }

  private mapFromHubSpotContact(record: any): CRMContact {
    return {
      id: record.id,
      email: record.properties.email,
      firstName: record.properties.firstname,
      lastName: record.properties.lastname,
      company: record.properties.company,
      phone: record.properties.phone,
      createdAt: new Date(record.properties.createdate),
      updatedAt: new Date(record.properties.lastmodifieddate),
    };
  }

  private mapFromHubSpotLead(record: any): CRMLead {
    return {
      id: record.id,
      email: record.properties.email,
      firstName: record.properties.firstname,
      lastName: record.properties.lastname,
      company: record.properties.company,
      source: record.properties.hs_analytics_source,
      status: record.properties.hs_lead_status,
      createdAt: new Date(record.properties.createdate),
      updatedAt: new Date(record.properties.lastmodifieddate),
    };
  }
}
