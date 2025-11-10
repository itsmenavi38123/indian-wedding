export const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1`;
export const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

// Frontend Configuration
export const FRONTEND_PORT = process.env.NEXT_PUBLIC_FRONTEND_PORT || '3002';
export const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost';
export const PROTOCOL = process.env.NEXT_PUBLIC_PROTOCOL || 'http';

// Subdomain Configuration
export const SUBDOMAIN_CONFIG = {
  port: FRONTEND_PORT,
  baseDomain: BASE_DOMAIN,
  protocol: PROTOCOL,

  /**
   * Generates a subdomain URL based on provided names
   * @param person1Name - First person's name
   * @param person2Name - Second person's name
   * @returns Complete subdomain URL
   */
  generateSubdomainUrl: (person1Name: string, person2Name: string): string => {
    const sanitizedName1 = person1Name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const sanitizedName2 = person2Name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${PROTOCOL}://${sanitizedName1}${sanitizedName2}.${BASE_DOMAIN}:${FRONTEND_PORT}`;
  },

  /**
   * Gets the base URL format
   * @returns Base URL with protocol, base domain, and port
   */
  getBaseUrl: (): string => {
    return `${PROTOCOL}://${BASE_DOMAIN}:${FRONTEND_PORT}`;
  },
};
