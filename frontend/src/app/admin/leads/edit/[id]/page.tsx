'use client';
import React from 'react';
import EditPage from '@/app/(components)/(leads)/edit/[id]/page';
interface EditLeadPageProps {
  params: Promise<{ id: string }>;
}

const AdminEditPage = ({ params }: EditLeadPageProps) => {
  return <EditPage params={params} />;
};

export default AdminEditPage;
