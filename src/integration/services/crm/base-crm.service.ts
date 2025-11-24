import { SyncContactDto, SyncLeadDto } from '../../dto/crm-sync.dto';

export interface CRMContact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  socialProfiles?: {
    platform: string;
    username: string;
    url: string;
    followers?: number;
    engagement?: number;
  }[];
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CRMLead {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  source: string;
  status?: string;
  socialContext?: {
    platform: string;
    conversationId: string;
    sentiment: string;
    engagementScore: number;
  };
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CRMSyncResult {
  success: boolean;
  recordId?: string;
  error?: string;
  action: 'created' | 'updated' | 'skipped';
}

export abstract class BaseCRMService {
  /**
   * Test connection to CRM
   */
  abstract testConnection(): Promise<boolean>;

  /**
   * Sync contact to CRM
   */
  abstract syncContact(contact: SyncContactDto): Promise<CRMSyncResult>;

  /**
   * Sync lead to CRM
   */
  abstract syncLead(lead: SyncLeadDto): Promise<CRMSyncResult>;

  /**
   * Get contact from CRM by email
   */
  abstract getContactByEmail(email: string): Promise<CRMContact | null>;

  /**
   * Get lead from CRM by email
   */
  abstract getLeadByEmail(email: string): Promise<CRMLead | null>;

  /**
   * Update contact in CRM
   */
  abstract updateContact(contactId: string, data: Partial<SyncContactDto>): Promise<CRMSyncResult>;

  /**
   * Update lead in CRM
   */
  abstract updateLead(leadId: string, data: Partial<SyncLeadDto>): Promise<CRMSyncResult>;

  /**
   * Enrich contact with social data
   */
  abstract enrichContact(contactId: string, socialData: any): Promise<CRMSyncResult>;

  /**
   * Track lead attribution
   */
  abstract trackLeadAttribution(leadId: string, attribution: any): Promise<CRMSyncResult>;

  /**
   * Batch sync contacts
   */
  abstract batchSyncContacts(contacts: SyncContactDto[]): Promise<CRMSyncResult[]>;

  /**
   * Batch sync leads
   */
  abstract batchSyncLeads(leads: SyncLeadDto[]): Promise<CRMSyncResult[]>;
}
