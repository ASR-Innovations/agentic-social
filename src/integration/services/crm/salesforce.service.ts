import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { BaseCRMService, CRMContact, CRMLead, CRMSyncResult } from './base-crm.service';
import { SyncContactDto, SyncLeadDto } from '../../dto/crm-sync.dto';
import axios, { AxiosInstance } from 'axios';

interface SalesforceConfig {
  instanceUrl: string;
  accessToken: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
}

@Injectable()
export class SalesforceService extends BaseCRMService {
  private readonly logger = new Logger(SalesforceService.name);
  private client: AxiosInstance;
  private config: SalesforceConfig;

  constructor() {
    super();
  }

  /**
   * Initialize Salesforce client with credentials
   */
  initialize(config: SalesforceConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: `${config.instanceUrl}/services/data/v58.0`,
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && this.config.refreshToken) {
          await this.refreshAccessToken();
          error.config.headers['Authorization'] = `Bearer ${this.config.accessToken}`;
          return axios.request(error.config);
        }
        return Promise.reject(error);
      },
    );
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/sobjects');
      return response.status === 200;
    } catch (error) {
      this.logger.error('Salesforce connection test failed', error);
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
      const salesforceContact = this.mapToSalesforceContact(contact);
      const response = await this.client.post('/sobjects/Contact', salesforceContact);

      return {
        success: response.data.success,
        recordId: response.data.id,
        action: 'created',
      };
    } catch (error: any) {
      this.logger.error('Failed to sync contact to Salesforce', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async syncLead(lead: SyncLeadDto): Promise<CRMSyncResult> {
    try {
      // Check if lead exists
      const existing = await this.getLeadByEmail(lead.email);

      if (existing) {
        // Update existing lead
        return await this.updateLead(existing.id, lead);
      }

      // Create new lead
      const salesforceLead = this.mapToSalesforceLead(lead);
      const response = await this.client.post('/sobjects/Lead', salesforceLead);

      return {
        success: response.data.success,
        recordId: response.data.id,
        action: 'created',
      };
    } catch (error: any) {
      this.logger.error('Failed to sync lead to Salesforce', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async getContactByEmail(email: string): Promise<CRMContact | null> {
    try {
      const query = `SELECT Id, Email, FirstName, LastName, AccountId, Account.Name, Phone, CreatedDate, LastModifiedDate FROM Contact WHERE Email = '${email}' LIMIT 1`;
      const response = await this.client.get(`/query?q=${encodeURIComponent(query)}`);

      if (response.data.totalSize === 0) {
        return null;
      }

      const record = response.data.records[0];
      return this.mapFromSalesforceContact(record);
    } catch (error) {
      this.logger.error('Failed to get contact from Salesforce', error);
      return null;
    }
  }

  async getLeadByEmail(email: string): Promise<CRMLead | null> {
    try {
      const query = `SELECT Id, Email, FirstName, LastName, Company, Status, LeadSource, CreatedDate, LastModifiedDate FROM Lead WHERE Email = '${email}' LIMIT 1`;
      const response = await this.client.get(`/query?q=${encodeURIComponent(query)}`);

      if (response.data.totalSize === 0) {
        return null;
      }

      const record = response.data.records[0];
      return this.mapFromSalesforceLead(record);
    } catch (error) {
      this.logger.error('Failed to get lead from Salesforce', error);
      return null;
    }
  }

  async updateContact(contactId: string, data: Partial<SyncContactDto>): Promise<CRMSyncResult> {
    try {
      const salesforceContact = this.mapToSalesforceContact(data as SyncContactDto);
      await this.client.patch(`/sobjects/Contact/${contactId}`, salesforceContact);

      return {
        success: true,
        recordId: contactId,
        action: 'updated',
      };
    } catch (error: any) {
      this.logger.error('Failed to update contact in Salesforce', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async updateLead(leadId: string, data: Partial<SyncLeadDto>): Promise<CRMSyncResult> {
    try {
      const salesforceLead = this.mapToSalesforceLead(data as SyncLeadDto);
      await this.client.patch(`/sobjects/Lead/${leadId}`, salesforceLead);

      return {
        success: true,
        recordId: leadId,
        action: 'updated',
      };
    } catch (error: any) {
      this.logger.error('Failed to update lead in Salesforce', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async enrichContact(contactId: string, socialData: any): Promise<CRMSyncResult> {
    try {
      // Create custom fields for social data
      const enrichmentData: any = {};

      if (socialData.socialProfiles) {
        // Map social profiles to custom fields
        socialData.socialProfiles.forEach((profile: any) => {
          const platform = profile.platform.toLowerCase();
          enrichmentData[`${platform}_username__c`] = profile.username;
          enrichmentData[`${platform}_url__c`] = profile.url;
          if (profile.followers) {
            enrichmentData[`${platform}_followers__c`] = profile.followers;
          }
        });
      }

      if (socialData.engagementScore) {
        enrichmentData['social_engagement_score__c'] = socialData.engagementScore;
      }

      await this.client.patch(`/sobjects/Contact/${contactId}`, enrichmentData);

      return {
        success: true,
        recordId: contactId,
        action: 'updated',
      };
    } catch (error: any) {
      this.logger.error('Failed to enrich contact in Salesforce', error);
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
        LeadSource: attribution.source,
      };

      if (attribution.campaign) {
        attributionData['Campaign__c'] = attribution.campaign;
      }

      if (attribution.touchpoints) {
        // Store touchpoints as JSON in a custom field
        attributionData['social_touchpoints__c'] = JSON.stringify(attribution.touchpoints);
      }

      await this.client.patch(`/sobjects/Lead/${leadId}`, attributionData);

      return {
        success: true,
        recordId: leadId,
        action: 'updated',
      };
    } catch (error: any) {
      this.logger.error('Failed to track lead attribution in Salesforce', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async batchSyncContacts(contacts: SyncContactDto[]): Promise<CRMSyncResult[]> {
    const results: CRMSyncResult[] = [];

    // Salesforce supports batch operations, but for simplicity, we'll process sequentially
    for (const contact of contacts) {
      const result = await this.syncContact(contact);
      results.push(result);
    }

    return results;
  }

  async batchSyncLeads(leads: SyncLeadDto[]): Promise<CRMSyncResult[]> {
    const results: CRMSyncResult[] = [];

    for (const lead of leads) {
      const result = await this.syncLead(lead);
      results.push(result);
    }

    return results;
  }

  private async refreshAccessToken(): Promise<void> {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', this.config.refreshToken || '');
      params.append('client_id', this.config.clientId || '');
      params.append('client_secret', this.config.clientSecret || '');

      const response = await axios.post(
        `${this.config.instanceUrl}/services/oauth2/token`,
        params,
      );

      this.config.accessToken = response.data.access_token;
      this.client.defaults.headers['Authorization'] = `Bearer ${this.config.accessToken}`;
    } catch (error) {
      this.logger.error('Failed to refresh Salesforce access token', error);
      throw new BadRequestException('Failed to refresh Salesforce access token');
    }
  }

  private mapToSalesforceContact(contact: SyncContactDto): any {
    const salesforceContact: any = {
      Email: contact.email,
    };

    if (contact.firstName) salesforceContact.FirstName = contact.firstName;
    if (contact.lastName) salesforceContact.LastName = contact.lastName;
    if (contact.phone) salesforceContact.Phone = contact.phone;

    // Map social profiles to custom fields
    if (contact.socialProfiles) {
      contact.socialProfiles.forEach((profile) => {
        const platform = profile.platform.toLowerCase();
        salesforceContact[`${platform}_username__c`] = profile.username;
        salesforceContact[`${platform}_url__c`] = profile.url;
        if (profile.followers) {
          salesforceContact[`${platform}_followers__c`] = profile.followers;
        }
      });
    }

    // Map custom fields
    if (contact.customFields) {
      Object.entries(contact.customFields).forEach(([key, value]) => {
        salesforceContact[`${key}__c`] = value;
      });
    }

    return salesforceContact;
  }

  private mapToSalesforceLead(lead: SyncLeadDto): any {
    const salesforceLead: any = {
      Email: lead.email,
      Company: lead.company || 'Unknown',
      LastName: lead.lastName || lead.email.split('@')[0],
    };

    if (lead.firstName) salesforceLead.FirstName = lead.firstName;
    if (lead.source) salesforceLead.LeadSource = lead.source;
    if (lead.status) salesforceLead.Status = lead.status;

    // Map social context to custom fields
    if (lead.socialContext) {
      salesforceLead['social_platform__c'] = lead.socialContext.platform;
      salesforceLead['social_sentiment__c'] = lead.socialContext.sentiment;
      salesforceLead['social_engagement_score__c'] = lead.socialContext.engagementScore;
    }

    // Map custom fields
    if (lead.customFields) {
      Object.entries(lead.customFields).forEach(([key, value]) => {
        salesforceLead[`${key}__c`] = value;
      });
    }

    return salesforceLead;
  }

  private mapFromSalesforceContact(record: any): CRMContact {
    return {
      id: record.Id,
      email: record.Email,
      firstName: record.FirstName,
      lastName: record.LastName,
      company: record.Account?.Name,
      phone: record.Phone,
      createdAt: new Date(record.CreatedDate),
      updatedAt: new Date(record.LastModifiedDate),
    };
  }

  private mapFromSalesforceLead(record: any): CRMLead {
    return {
      id: record.Id,
      email: record.Email,
      firstName: record.FirstName,
      lastName: record.LastName,
      company: record.Company,
      source: record.LeadSource,
      status: record.Status,
      createdAt: new Date(record.CreatedDate),
      updatedAt: new Date(record.LastModifiedDate),
    };
  }
}
