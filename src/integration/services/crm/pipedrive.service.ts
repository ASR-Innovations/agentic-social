import { Injectable, Logger } from '@nestjs/common';
import { BaseCRMService, CRMContact, CRMLead, CRMSyncResult } from './base-crm.service';
import { SyncContactDto, SyncLeadDto } from '../../dto/crm-sync.dto';
import axios, { AxiosInstance } from 'axios';

interface PipedriveConfig {
  apiToken: string;
  companyDomain: string;
}

@Injectable()
export class PipedriveService extends BaseCRMService {
  private readonly logger = new Logger(PipedriveService.name);
  private client: AxiosInstance;
  private config: PipedriveConfig;

  constructor() {
    super();
  }

  /**
   * Initialize Pipedrive client with credentials
   */
  initialize(config: PipedriveConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: `https://${config.companyDomain}.pipedrive.com/api/v1`,
      params: {
        api_token: config.apiToken,
      },
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/users/me');
      return response.data.success === true;
    } catch (error: any) {
      this.logger.error('Pipedrive connection test failed', error);
      return false;
    }
  }

  async syncContact(contact: SyncContactDto): Promise<CRMSyncResult> {
    try {
      // In Pipedrive, contacts are "persons"
      const existing = await this.getContactByEmail(contact.email);

      if (existing) {
        return await this.updateContact(existing.id, contact);
      }

      // Create new person
      const pipedrivePerson = this.mapToPipedrivePerson(contact);
      const response = await this.client.post('/persons', pipedrivePerson);

      return {
        success: response.data.success,
        recordId: response.data.data.id.toString(),
        action: 'created',
      };
    } catch (error: any) {
      this.logger.error('Failed to sync contact to Pipedrive', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async syncLead(lead: SyncLeadDto): Promise<CRMSyncResult> {
    try {
      // In Pipedrive, leads are separate from persons
      const existing = await this.getLeadByEmail(lead.email);

      if (existing) {
        return await this.updateLead(existing.id, lead);
      }

      // Create person first
      const personResult = await this.syncContact({
        email: lead.email,
        firstName: lead.firstName,
        lastName: lead.lastName,
        company: lead.company,
      });

      if (!personResult.success) {
        return personResult;
      }

      // Create lead
      const pipedriveLead = this.mapToPipedriveLead(lead, personResult.recordId);
      const response = await this.client.post('/leads', pipedriveLead);

      return {
        success: response.data.success,
        recordId: response.data.data.id,
        action: 'created',
      };
    } catch (error: any) {
      this.logger.error('Failed to sync lead to Pipedrive', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async getContactByEmail(email: string): Promise<CRMContact | null> {
    try {
      const response = await this.client.get('/persons/search', {
        params: {
          term: email,
          fields: 'email',
          exact_match: true,
        },
      });

      if (!response.data.success || !response.data.data?.items?.length) {
        return null;
      }

      const person = response.data.data.items[0].item;
      return this.mapFromPipedrivePerson(person);
    } catch (error: any) {
      this.logger.error('Failed to get contact from Pipedrive', error);
      return null;
    }
  }

  async getLeadByEmail(email: string): Promise<CRMLead | null> {
    try {
      // First find the person
      const person = await this.getContactByEmail(email);
      if (!person) {
        return null;
      }

      // Then find leads associated with this person
      const response = await this.client.get('/leads', {
        params: {
          person_id: person.id,
        },
      });

      if (!response.data.success || !response.data.data?.length) {
        return null;
      }

      const lead = response.data.data[0];
      return this.mapFromPipedriveLead(lead, person);
    } catch (error: any) {
      this.logger.error('Failed to get lead from Pipedrive', error);
      return null;
    }
  }

  async updateContact(contactId: string, data: Partial<SyncContactDto>): Promise<CRMSyncResult> {
    try {
      const pipedrivePerson = this.mapToPipedrivePerson(data as SyncContactDto);
      const response = await this.client.put(`/persons/${contactId}`, pipedrivePerson);

      return {
        success: response.data.success,
        recordId: contactId,
        action: 'updated',
      };
    } catch (error: any) {
      this.logger.error('Failed to update contact in Pipedrive', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async updateLead(leadId: string, data: Partial<SyncLeadDto>): Promise<CRMSyncResult> {
    try {
      const pipedriveLead: any = {};

      if (data.status) {
        pipedriveLead.label_ids = [data.status];
      }

      const response = await this.client.patch(`/leads/${leadId}`, pipedriveLead);

      return {
        success: response.data.success,
        recordId: leadId,
        action: 'updated',
      };
    } catch (error: any) {
      this.logger.error('Failed to update lead in Pipedrive', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async enrichContact(contactId: string, socialData: any): Promise<CRMSyncResult> {
    try {
      // Pipedrive doesn't have built-in social fields, so we'll use custom fields
      // First, we need to get or create custom fields for social data
      const enrichmentData: any = {};

      if (socialData.socialProfiles) {
        // Store social profiles as notes or custom fields
        const socialProfilesText = socialData.socialProfiles
          .map((p: any) => `${p.platform}: ${p.url} (${p.followers || 0} followers)`)
          .join('\n');

        // Add as a note
        await this.client.post('/notes', {
          person_id: parseInt(contactId),
          content: `Social Media Profiles:\n${socialProfilesText}`,
        });
      }

      if (socialData.engagementScore) {
        // Store engagement score in a custom field (would need to be created first)
        enrichmentData['social_engagement_score'] = socialData.engagementScore;
      }

      if (Object.keys(enrichmentData).length > 0) {
        await this.client.put(`/persons/${contactId}`, enrichmentData);
      }

      return {
        success: true,
        recordId: contactId,
        action: 'updated',
      };
    } catch (error: any) {
      this.logger.error('Failed to enrich contact in Pipedrive', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async trackLeadAttribution(leadId: string, attribution: any): Promise<CRMSyncResult> {
    try {
      // Add attribution data as a note on the lead
      const attributionText = `
Lead Attribution:
Source: ${attribution.source}
Campaign: ${attribution.campaign || 'N/A'}
Touchpoints: ${attribution.touchpoints?.length || 0}
      `.trim();

      await this.client.post('/notes', {
        lead_id: leadId,
        content: attributionText,
      });

      return {
        success: true,
        recordId: leadId,
        action: 'updated',
      };
    } catch (error: any) {
      this.logger.error('Failed to track lead attribution in Pipedrive', error);
      return {
        success: false,
        error: error.message,
        action: 'skipped',
      };
    }
  }

  async batchSyncContacts(contacts: SyncContactDto[]): Promise<CRMSyncResult[]> {
    const results: CRMSyncResult[] = [];

    // Pipedrive doesn't have native batch operations, process sequentially
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

  private mapToPipedrivePerson(contact: SyncContactDto): any {
    const pipedrivePerson: any = {
      email: [{ value: contact.email, primary: true }],
    };

    if (contact.firstName || contact.lastName) {
      pipedrivePerson.name = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
    }

    if (contact.phone) {
      pipedrivePerson.phone = [{ value: contact.phone, primary: true }];
    }

    // Map custom fields
    if (contact.customFields) {
      Object.entries(contact.customFields).forEach(([key, value]) => {
        pipedrivePerson[key] = value;
      });
    }

    return pipedrivePerson;
  }

  private mapToPipedriveLead(lead: SyncLeadDto, personId?: string): any {
    const pipedriveLead: any = {
      title: `Lead from ${lead.source}`,
    };

    if (personId) {
      pipedriveLead.person_id = parseInt(personId);
    }

    if (lead.company) {
      pipedriveLead.organization_id = null; // Would need to create/find organization
    }

    // Map custom fields
    if (lead.customFields) {
      Object.entries(lead.customFields).forEach(([key, value]) => {
        pipedriveLead[key] = value;
      });
    }

    return pipedriveLead;
  }

  private mapFromPipedrivePerson(person: any): CRMContact {
    const primaryEmail = person.email?.find((e: any) => e.primary)?.value || person.email?.[0]?.value;
    const primaryPhone = person.phone?.find((p: any) => p.primary)?.value || person.phone?.[0]?.value;

    return {
      id: person.id.toString(),
      email: primaryEmail,
      firstName: person.first_name,
      lastName: person.last_name,
      company: person.org_name,
      phone: primaryPhone,
      createdAt: new Date(person.add_time),
      updatedAt: new Date(person.update_time),
    };
  }

  private mapFromPipedriveLead(lead: any, person: CRMContact): CRMLead {
    return {
      id: lead.id,
      email: person.email,
      firstName: person.firstName,
      lastName: person.lastName,
      company: person.company,
      source: lead.source_name || 'social',
      status: lead.label_ids?.[0],
      createdAt: new Date(lead.add_time),
      updatedAt: new Date(lead.update_time),
    };
  }
}
