import { SyncAudienceDto, CreateListDto, AddToListDto, UpdateContactDto, TrackEventDto } from '../../dto/marketing-automation.dto';

export interface MarketingAutomationContact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  tags?: string[];
  lists?: string[];
  customFields?: Record<string, any>;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketingAutomationList {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketingAutomationCampaign {
  id: string;
  name: string;
  subject?: string;
  status: string;
  sentCount?: number;
  openRate?: number;
  clickRate?: number;
  createdAt: Date;
}

export interface SyncResult {
  success: boolean;
  recordId?: string;
  action: 'created' | 'updated' | 'skipped';
  error?: string;
}

export interface AudienceStats {
  totalContacts: number;
  activeContacts: number;
  unsubscribed: number;
  bounced: number;
  avgEngagementRate?: number;
  topTags?: { tag: string; count: number }[];
  growthRate?: number;
}

export abstract class BaseMarketingAutomationService {
  /**
   * Test connection to marketing automation platform
   */
  abstract testConnection(): Promise<boolean>;

  /**
   * Sync contact to marketing automation platform
   */
  abstract syncContact(contact: SyncAudienceDto): Promise<SyncResult>;

  /**
   * Get contact by email
   */
  abstract getContactByEmail(email: string): Promise<MarketingAutomationContact | null>;

  /**
   * Update contact information
   */
  abstract updateContact(contactId: string, data: Partial<UpdateContactDto>): Promise<SyncResult>;

  /**
   * Create a new list/audience
   */
  abstract createList(list: CreateListDto): Promise<MarketingAutomationList>;

  /**
   * Get all lists
   */
  abstract getLists(): Promise<MarketingAutomationList[]>;

  /**
   * Add contacts to a list
   */
  abstract addToList(data: AddToListDto): Promise<SyncResult[]>;

  /**
   * Remove contact from list
   */
  abstract removeFromList(listId: string, email: string): Promise<SyncResult>;

  /**
   * Track custom event for contact
   */
  abstract trackEvent(event: TrackEventDto): Promise<SyncResult>;

  /**
   * Get audience statistics
   */
  abstract getAudienceStats(listId?: string): Promise<AudienceStats>;

  /**
   * Get campaigns
   */
  abstract getCampaigns(): Promise<MarketingAutomationCampaign[]>;

  /**
   * Batch sync contacts
   */
  abstract batchSyncContacts(contacts: SyncAudienceDto[]): Promise<SyncResult[]>;

  /**
   * Add tags to contact
   */
  abstract addTags(email: string, tags: string[]): Promise<SyncResult>;

  /**
   * Remove tags from contact
   */
  abstract removeTags(email: string, tags: string[]): Promise<SyncResult>;

  /**
   * Subscribe contact to list
   */
  abstract subscribeToList(email: string, listId: string): Promise<SyncResult>;

  /**
   * Unsubscribe contact from list
   */
  abstract unsubscribeFromList(email: string, listId: string): Promise<SyncResult>;
}
