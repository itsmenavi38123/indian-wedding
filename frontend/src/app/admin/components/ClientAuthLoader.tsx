'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/slices/auth';
import { usePathname, useRouter } from 'next/navigation';
import { useGetCurrentAdmin } from '@/services/api/auth';
import { excludePath } from '@/constants';

export default function ClientAuthLoader() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();

  const { data, isError, isLoading } = useGetCurrentAdmin(!excludePath.includes(pathname));

  useEffect(() => {
    if (excludePath.includes(pathname)) return;

    if (!isLoading) {
      if (data?.data?.data) {
        dispatch(setUser(data?.data?.data));
      } else {
        router.push('/admin/login');
      }
    }
  }, [data, isError, isLoading, pathname, dispatch, router]);

  return null;
}
