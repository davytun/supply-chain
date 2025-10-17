// Supply Chain Event Types
export interface SupplyChainEvent {
  id: string;
  batchId: string;
  eventType: EventType;
  timestamp: string;
  location: Location;
  description: string;
  participantId: string;
  participantType: ParticipantType;
  certifications?: Certification[];
  metadata?: Record<string, unknown>;
  hederaTransactionId?: string;
  hederaTopicId?: string;
  sequenceNumber?: number;
  previousEventId?: string;
  anomalyScore?: number;
  isAnomaly?: boolean;
}

export enum EventType {
  HARVEST = 'harvest',
  PROCESSING = 'processing',
  PACKAGING = 'packaging',
  SHIPPING = 'shipping',
  QUALITY_CHECK = 'quality_check',
  STORAGE = 'storage',
  RETAIL_ARRIVAL = 'retail_arrival',
  SALE = 'sale',
  CERTIFICATION = 'certification',
  INSPECTION = 'inspection'
}

export enum ParticipantType {
  FARMER = 'farmer',
  PROCESSOR = 'processor',
  DISTRIBUTOR = 'distributor',
  RETAILER = 'retailer',
  CERTIFIER = 'certifier',
  INSPECTOR = 'inspector',
  CONSUMER = 'consumer'
}

export interface Location {
  country: string;
  region: string;
  city: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Certification {
  type: CertificationType;
  issuedBy: string;
  issuedDate: string;
  expiryDate?: string;
  certificateId: string;
  isValid: boolean;
}

export enum CertificationType {
  ORGANIC = 'organic',
  FAIR_TRADE = 'fair_trade',
  RAINFOREST_ALLIANCE = 'rainforest_alliance',
  UTZ = 'utz',
  BIRD_FRIENDLY = 'bird_friendly',
  DIRECT_TRADE = 'direct_trade',
  KOSHER = 'kosher',
  HALAL = 'halal'
}

// Product Batch Types
export interface ProductBatch {
  id: string;
  productName: string;
  productType: ProductType;
  quantity: number;
  unit: string;
  createdAt: string;
  originLocation: Location;
  currentStatus: BatchStatus;
  qrCode: string;
  hederaTokenId?: string;
  events: SupplyChainEvent[];
  certifications: Certification[];
  expectedPath?: string[];
  anomalies?: AnomalyAlert[];
}

export enum ProductType {
  COFFEE = 'coffee',
  COCOA = 'cocoa',
  TEA = 'tea',
  COTTON = 'cotton',
  ELECTRONICS = 'electronics',
  CLOTHING = 'clothing',
  WINE = 'wine',
  SEAFOOD = 'seafood',
  BEEF = 'beef',
  FRUITS = 'fruits',
  VEGETABLES = 'vegetables'
}

export enum BatchStatus {
  IN_PRODUCTION = 'in_production',
  IN_TRANSIT = 'in_transit',
  PROCESSING = 'processing',
  QUALITY_TESTING = 'quality_testing',
  READY_FOR_SHIPMENT = 'ready_for_shipment',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  SOLD = 'sold',
  COMPLETED = 'completed'
}

// Hedera Integration Types
export interface HederaConfig {
  accountId: string;
  privateKey: string;
  network: 'testnet' | 'mainnet';
  topicId?: string;
  mirrorNodeUrl: string;
}

export interface HederaTransaction {
  transactionId: string;
  topicId: string;
  sequenceNumber: number;
  timestamp: string;
  message: string;
  consensusTimestamp: string;
}

export interface HederaTokenInfo {
  tokenId: string;
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
  treasuryAccountId: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Dashboard Types
export interface DashboardStats {
  totalBatches: number;
  activeBatches: number;
  completedBatches: number;
  totalEvents: number;
  anomaliesDetected: number;
  participantsCount: number;
  countriesCount: number;
  certificationsCount: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    fill?: boolean;
  }[];
}

// Anomaly Detection Types
export interface AnomalyAlert {
  id: string;
  batchId: string;
  eventId: string;
  type: AnomalyType;
  severity: AlertSeverity;
  description: string;
  detectedAt: string;
  score: number;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  metadata?: Record<string, unknown>;
}

export enum AnomalyType {
  TIME_INCONSISTENCY = 'time_inconsistency',
  LOCATION_JUMP = 'location_jump',
  UNEXPECTED_PARTICIPANT = 'unexpected_participant',
  CERTIFICATION_MISMATCH = 'certification_mismatch',
  SUSPICIOUS_PATTERN = 'suspicious_pattern',
  QUALITY_DEVIATION = 'quality_deviation',
  QUANTITY_MISMATCH = 'quantity_mismatch'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// User and Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  participantType: ParticipantType;
  location: Location;
  createdAt: string;
  isActive: boolean;
  permissions: Permission[];
}

export enum UserRole {
  ADMIN = 'admin',
  PARTICIPANT = 'participant',
  CONSUMER = 'consumer',
  AUDITOR = 'auditor'
}

export enum Permission {
  CREATE_BATCH = 'create_batch',
  LOG_EVENT = 'log_event',
  VIEW_ALL_BATCHES = 'view_all_batches',
  MANAGE_USERS = 'manage_users',
  RESOLVE_ANOMALIES = 'resolve_anomalies',
  EXPORT_DATA = 'export_data',
  MANAGE_CERTIFICATIONS = 'manage_certifications'
}

// Form Types
export interface EventFormData {
  batchId: string;
  eventType: EventType;
  location: Location;
  description: string;
  certifications?: Certification[];
  metadata?: Record<string, unknown>;
}

export interface BatchFormData {
  productName: string;
  productType: ProductType;
  quantity: number;
  unit: string;
  originLocation: Location;
  certifications: Certification[];
}

// Search and Filter Types
export interface SearchFilters {
  productType?: ProductType;
  eventType?: EventType;
  participantType?: ParticipantType;
  dateRange?: {
    start: string;
    end: string;
  };
  location?: {
    country?: string;
    region?: string;
  };
  certifications?: CertificationType[];
  hasAnomalies?: boolean;
}

export interface TrackingQuery {
  batchId?: string;
  qrCode?: string;
  transactionId?: string;
}

// Export types
export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: SearchFilters;
  includeMetadata?: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export enum NotificationType {
  ANOMALY_DETECTED = 'anomaly_detected',
  BATCH_COMPLETED = 'batch_completed',
  CERTIFICATION_EXPIRING = 'certification_expiring',
  NEW_EVENT_LOGGED = 'new_event_logged',
  SYSTEM_UPDATE = 'system_update'
}