import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CONST_KEYS } from '@/constants/constant';
import { excludePath, excludeUserPath, excludeVendorPath } from './constants';
import { API_URLS } from './services/apiBaseUrl';
import { API_BASE_URL } from './lib/constant';

export async function fetchApi(accessToken?: string) {
  const url = `${API_BASE_URL}${API_URLS.auth.validateUser}`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken ?? ''}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`API validateUser failed (${res.status} ${res.statusText}): ${errorBody}`);
    }

    try {
      return await res.json();
    } catch {
      return await res.text();
    }
  } catch (err) {
    console.error('Error during validateUser fetch:', err);
    return err;
  }
}

// Helper function to check if hostname is an IP address
function isIPAddress(hostname: string): boolean {
  // Remove port if present
  const host = hostname.split(':')[0];
  // Check if it's an IPv4 address (e.g., 209.38.121.128)
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  return ipv4Pattern.test(host);
}

// Helper function to extract subdomain from hostname
function getSubdomain(hostname: string): string | null {
  // Remove port if present (e.g., "localhost:3002" -> "localhost")
  const host = hostname.split(':')[0];

  // Don't treat IP addresses as subdomains
  if (isIPAddress(hostname)) {
    return null;
  }

  // Split by dots
  const parts = host.split('.');

  // Handle different patterns:
  // - subdomain.localhost -> ["subdomain", "localhost"]
  // - subdomain.indianweddings.com -> ["subdomain", "indianweddings", "com"]
  // - localhost -> ["localhost"]
  // - indianweddings.com -> ["indianweddings", "com"]

  if (parts.length === 1) {
    // Just "localhost" - no subdomain
    return null;
  }

  if (parts.length === 2) {
    // Could be "subdomain.localhost" or "domain.com"
    if (parts[1] === 'localhost') {
      // "subdomain.localhost" - return subdomain
      return parts[0];
    }
    // "domain.com" - no subdomain
    return null;
  }

  // parts.length >= 3
  // Handle "subdomain.indianweddings.com" or "subdomain.domain.com"
  // Check if it's the main domain (indianweddings.com)
  if (parts[parts.length - 2] === 'indianweddings' && parts[parts.length - 1] === 'com') {
    // First part is the subdomain
    return parts[0];
  }

  // For other multi-part domains, assume first part is subdomain
  return parts[0];
}

// Reserved subdomains that should not be treated as wedding subdomains
const RESERVED_SUBDOMAINS = ['www', 'admin', 'api', 'app', 'mail', 'ftp', 'localhost'];

function isReservedSubdomain(subdomain: string): boolean {
  return RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase());
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get(CONST_KEYS.ACCESS_TOKEN)?.value;
  const refreshToken = req.cookies.get(CONST_KEYS.REFRESH_TOKEN)?.value;

  // ============================================
  // SUBDOMAIN ROUTING LOGIC
  // ============================================
  // Extract subdomain from hostname
  const hostname = req.headers.get('host') || '';
  const subdomain = getSubdomain(hostname);

  // If there's a valid subdomain (not reserved), rewrite to /wedding/[subdomain]
  if (subdomain && !isReservedSubdomain(subdomain)) {
    // Don't rewrite if already on /wedding path to avoid loops
    if (!pathname.startsWith('/wedding/')) {
      // Clone the URL and rewrite to /wedding/[subdomain]
      const url = req.nextUrl.clone();

      // Preserve the original pathname
      // Example: subdomain.localhost:3002/ -> /wedding/subdomain/
      // Example: subdomain.localhost:3002/rsvp -> /wedding/subdomain/rsvp
      url.pathname = `/wedding/${subdomain}${pathname}`;

      console.log(
        `[Middleware] Subdomain detected: ${subdomain}, rewriting ${pathname} -> ${url.pathname}`
      );

      return NextResponse.rewrite(url);
    }
  }
  // ============================================
  // END SUBDOMAIN ROUTING LOGIC
  // ============================================

  if (pathname.startsWith('/admin')) {
    if ((accessToken || refreshToken) && excludePath.includes(pathname)) {
      try {
        const data = await fetchApi(accessToken);
        if (data && data?.data?.userId) {
          return NextResponse.redirect(new URL('/admin/dashboard', req.url));
        } else {
          const res = NextResponse.redirect(new URL('/admin/login', req.url));
          res.cookies.delete(CONST_KEYS.ACCESS_TOKEN);
          res.cookies.delete(CONST_KEYS.REFRESH_TOKEN);
          return res;
        }
      } catch (err) {
        console.error('Middleware error:', err);
        const res = NextResponse.redirect(new URL('/admin/login', req.url));
        res.cookies.delete(CONST_KEYS.ACCESS_TOKEN);
        res.cookies.delete(CONST_KEYS.REFRESH_TOKEN);
        return res;
      }
    }
    if ((!accessToken || !refreshToken) && !excludePath.includes(pathname)) {
      const res = NextResponse.redirect(new URL('/admin/login', req.url));
      res.cookies.delete(CONST_KEYS.ACCESS_TOKEN);
      res.cookies.delete(CONST_KEYS.REFRESH_TOKEN);
      return res;
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/vendor')) {
    console.log(pathname, 'vendorvendorvendorvendorvendorvendorvendor');
    if ((accessToken || refreshToken) && excludeVendorPath.includes(pathname)) {
      try {
        const data = await fetchApi(accessToken);
        if (data && data?.data?.userId) {
          return NextResponse.redirect(new URL('/vendor/dashboard', req.url));
        } else {
          const res = NextResponse.redirect(new URL('/vendor/login', req.url));
          res.cookies.delete(CONST_KEYS.ACCESS_TOKEN);
          res.cookies.delete(CONST_KEYS.REFRESH_TOKEN);
          return res;
        }
      } catch (err) {
        console.error('Middleware error:', err);
        const res = NextResponse.redirect(new URL('/vendor/login', req.url));
        res.cookies.delete(CONST_KEYS.ACCESS_TOKEN);
        res.cookies.delete(CONST_KEYS.REFRESH_TOKEN);
        return res;
      }
    }

    if ((!accessToken || !refreshToken) && !excludeVendorPath.includes(pathname)) {
      const res = NextResponse.redirect(new URL('/vendor/login', req.url));
      res.cookies.delete(CONST_KEYS.ACCESS_TOKEN);
      res.cookies.delete(CONST_KEYS.REFRESH_TOKEN);
      return res;
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/user')) {
    console.log(pathname, 'useruseruseruseruseruseruseruseruser');
    if ((accessToken || refreshToken) && excludeUserPath.includes(pathname)) {
      try {
        const data = await fetchApi(accessToken);
        if (data && data?.data?.userId) {
          return NextResponse.redirect(new URL('/user/dashboard', req.url));
        } else {
          const res = NextResponse.redirect(new URL('/user/login', req.url));
          res.cookies.delete(CONST_KEYS.ACCESS_TOKEN);
          res.cookies.delete(CONST_KEYS.REFRESH_TOKEN);
          return res;
        }
      } catch (err) {
        console.error('Middleware error:', err);
        const res = NextResponse.redirect(new URL('/user/login', req.url));
        res.cookies.delete(CONST_KEYS.ACCESS_TOKEN);
        res.cookies.delete(CONST_KEYS.REFRESH_TOKEN);
        return res;
      }
    }

    if ((!accessToken || !refreshToken) && !excludeUserPath.includes(pathname)) {
      const res = NextResponse.redirect(new URL('/user/login', req.url));
      res.cookies.delete(CONST_KEYS.ACCESS_TOKEN);
      res.cookies.delete(CONST_KEYS.REFRESH_TOKEN);
      return res;
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  // Match all paths for subdomain detection, admin, vendor, and user authentication
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
