import { SUBDOMAIN_CONFIG } from './constant';

/**
 * Wedding URL Utility
 * Single source of truth for all wedding URL generation and formatting
 */

/**
 * Generate full wedding URL from subdomain
 */
export function getWeddingUrl(subdomain: string): string {
  const shouldIncludePort = SUBDOMAIN_CONFIG.port !== '80' && SUBDOMAIN_CONFIG.port !== '443';
  const portPart = shouldIncludePort ? `:${SUBDOMAIN_CONFIG.port}` : '';
  return `${SUBDOMAIN_CONFIG.protocol}://${subdomain}.${SUBDOMAIN_CONFIG.baseDomain}${portPart}`;
}

/**
 * Generate subdomain from couple names
 */
export function generateSubdomain(person1Name: string, person2Name: string): string {
  const sanitizedName1 = person1Name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const sanitizedName2 = person2Name.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${sanitizedName1}${sanitizedName2}`;
}

/**
 * Generate full wedding URL from couple names
 */
export function getWeddingUrlFromNames(person1Name: string, person2Name: string): string {
  const subdomain = generateSubdomain(person1Name, person2Name);
  return getWeddingUrl(subdomain);
}

/**
 * Get display URL (without protocol, cleaner format)
 * Example: naveensanjna.209.38.121.128.nip.io:3000
 */
export function getDisplayUrl(subdomain: string): string {
  const shouldIncludePort = SUBDOMAIN_CONFIG.port !== '80' && SUBDOMAIN_CONFIG.port !== '443';
  const portPart = shouldIncludePort ? `:${SUBDOMAIN_CONFIG.port}` : '';
  return `${subdomain}.${SUBDOMAIN_CONFIG.baseDomain}${portPart}`;
}

/**
 * Get short display URL (domain only, no port)
 * Example: naveensanjna.209.38.121.128.nip.io
 */
export function getShortDisplayUrl(subdomain: string): string {
  return `${subdomain}.${SUBDOMAIN_CONFIG.baseDomain}`;
}

/**
 * Check if URL should include port
 */
export function shouldShowPort(): boolean {
  return SUBDOMAIN_CONFIG.port !== '80' && SUBDOMAIN_CONFIG.port !== '443';
}
