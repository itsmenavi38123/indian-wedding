'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/slices/auth';
import { usePathname, useRouter } from 'next/navigation';
import { excludeVendorPath } from '@/constants';
import { useGetCurrentVendor } from '@/services/api/vendorAuth';

export default function ClientVendorLoader() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const { data, isError, isLoading } = useGetCurrentVendor(!excludeVendorPath.includes(pathname));

  useEffect(() => {
    if (excludeVendorPath.includes(pathname)) return;
    if (!isLoading) {
      if (data?.data?.data) {
        dispatch(setUser(data?.data?.data));
      } else {
        router.push('/vendor/login');
      }
    }
  }, [data, isError, isLoading, pathname, dispatch, router]);
  return null;
}
