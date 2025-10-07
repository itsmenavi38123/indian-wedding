'use client';
import React from 'react';
import AssignVendorsPage from '@/app/(components)/(leads)/assign/vendors/[id]/page';
interface AssignVendorsLeadPageProps {
  params: Promise<{ id: string }>;
}
const AdminAssignVendorsPage = ({ params }: AssignVendorsLeadPageProps) => {
  return <AssignVendorsPage params={params} />;
};

export default AdminAssignVendorsPage;
