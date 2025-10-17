import { ProductBatch, SupplyChainEvent, Location } from '@/types';

/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format a date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(dateString);
  }
}

/**
 * Calculate distance between two locations using Haversine formula
 */
export function calculateDistance(loc1: Location, loc2: Location): number {
  if (!loc1.coordinates || !loc2.coordinates) return 0;

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(loc2.coordinates.latitude - loc1.coordinates.latitude);
  const dLon = toRadians(loc2.coordinates.longitude - loc1.coordinates.longitude);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(loc1.coordinates.latitude)) * 
    Math.cos(toRadians(loc2.coordinates.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Generate a random batch ID
 */
export function generateBatchId(productType: string, originCountry: string): string {
  const typeCode = productType.substring(0, 3).toUpperCase();
  const countryCode = originCountry.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  
  return `${typeCode}-${countryCode}-${timestamp}${random}`;
}

/**
 * Validate batch ID format
 */
export function isValidBatchId(batchId: string): boolean {
  // Basic validation for batch ID format: XXX-XXX-XXXXXXXXXX
  const pattern = /^[A-Z]{3}-[A-Z]{3}-[A-Za-z0-9]{10,}$/;
  return pattern.test(batchId);
}

/**
 * Extract country code from batch ID
 */
export function extractCountryFromBatchId(batchId: string): string | null {
  const parts = batchId.split('-');
  return parts.length >= 2 ? parts[1] : null;
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Debounce function to limit API calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

/**
 * Generate a random color for charts/visualizations
 */
export function generateRandomColor(): string {
  const colors = [
    '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Convert camelCase to Title Case
 */
export function camelToTitle(camelCase: string): string {
  return camelCase
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        (clonedObj as Record<string, unknown>)[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Calculate supply chain efficiency score
 */
export function calculateEfficiencyScore(events: SupplyChainEvent[]): number {
  if (events.length === 0) return 0;
  
  let score = 100;
  
  // Deduct points for anomalies
  const anomalies = events.filter(e => e.isAnomaly);
  score -= anomalies.length * 10;
  
  // Deduct points for missing certifications in key events
  const keyEvents = events.filter(e => 
    ['harvest', 'processing', 'quality_check'].includes(e.eventType)
  );
  const eventsWithoutCerts = keyEvents.filter(e => 
    !e.certifications || e.certifications.length === 0
  );
  score -= eventsWithoutCerts.length * 5;
  
  // Bonus points for complete documentation
  const eventsWithMetadata = events.filter(e => 
    e.metadata && Object.keys(e.metadata).length > 0
  );
  score += (eventsWithMetadata.length / events.length) * 10;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Get supply chain completion percentage
 */
export function getCompletionPercentage(batch: ProductBatch): number {
  const totalSteps = 8; // Expected number of supply chain steps
  const completedSteps = batch.events.length;
  return Math.min(100, (completedSteps / totalSteps) * 100);
}

/**
 * Format blockchain transaction ID for display
 */
export function formatTransactionId(transactionId: string): string {
  if (transactionId.length <= 16) return transactionId;
  return `${transactionId.substring(0, 8)}...${transactionId.substring(transactionId.length - 8)}`;
}

/**
 * Validate Hedera account ID format
 */
export function isValidHederaAccountId(accountId: string): boolean {
  const pattern = /^\d+\.\d+\.\d+$/;
  return pattern.test(accountId);
}

/**
 * Generate QR code tracking URL
 */
export function generateTrackingUrl(batchId: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${base}/track/${batchId}`;
}