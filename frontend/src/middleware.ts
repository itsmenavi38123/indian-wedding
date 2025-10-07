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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get(CONST_KEYS.ACCESS_TOKEN)?.value;
  const refreshToken = req.cookies.get(CONST_KEYS.REFRESH_TOKEN)?.value;

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
  matcher: ['/admin/:path*', '/vendor/:path*'],
};
