'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/slices/auth';
import { usePathname, useRouter } from 'next/navigation';
import { excludeTeamMemberPath } from '@/constants';
import { useGetCurrentTeamMember } from '@/services/api/teamMemberAuth';

export default function ClientAuthLoader() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();

  const { data, isError, isLoading } = useGetCurrentTeamMember(
    !excludeTeamMemberPath.includes(pathname)
  );

  useEffect(() => {
    if (excludeTeamMemberPath.includes(pathname)) return;

    if (!isLoading) {
      if (data?.data?.data) {
        dispatch(setUser({ ...data?.data?.data, role: data?.data?.data?.roleLogin }));
      } else {
        router.push('/team-member/login');
      }
    }
  }, [data, isError, isLoading, pathname, dispatch, router]);

  return null;
}
