'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/slices/auth';
import { usePathname, useRouter } from 'next/navigation';
import { excludeUserPath } from '@/constants';
import { useGetCurrentUser } from '@/services/api/userAuth';

export default function ClientUserLoader() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const { data, isError, isLoading } = useGetCurrentUser(!excludeUserPath.includes(pathname));

  useEffect(() => {
    if (excludeUserPath.includes(pathname)) return;
    if (!isLoading) {
      if (data?.data?.data) {
        dispatch(setUser(data?.data?.data));
      } else {
        router.push('/user/login');
      }
    }
  }, [data, isError, isLoading, pathname, dispatch, router]);
  return null;
}
