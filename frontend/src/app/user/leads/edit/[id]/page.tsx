'use client';
import EditPage from '@/app/(components)/(leads)/edit/[id]/page';
import React from 'react';

interface EditLeadPageProps {
  params: Promise<{ id: string }>;
}

const AdminEditPage = ({ params }: EditLeadPageProps) => {
  return <EditPage params={params} />;
};

export default AdminEditPage;
