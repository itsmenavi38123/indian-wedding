'use client';

import React from 'react';
import { useGetVendor } from '@/services/api/vendors';
import { Loader2 } from 'lucide-react';
import { VendorForm } from '../../components/VendorForm';
import { PageHeader } from '@/components/ui/pageHeader';
interface EditVendorPageProps {
  params: { id: string };
}

const EditVendorPage = ({ params }: EditVendorPageProps) => {
  const { id } = params;
  const { data: vendor, isLoading } = useGetVendor(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!vendor?.data) {
    return <p className="text-center text-red-500">Vendor not found</p>;
  }

  const defaultValues = {
    name: vendor.data.name || '',
    email: vendor.data.email || '',
    password: vendor.data?.password || '',
    contactNo: vendor.data.contactNo || '',
    countryCode: vendor.data.countryCode || '+91',
    serviceTypes: vendor.data.serviceTypes || '',
    minimumAmount: vendor.data.minimumAmount ?? 0,
    maximumAmount: vendor.data.maximumAmount ?? 0,
    isActive: vendor.data.isActive ?? true,
    teams: vendor.data.teams || [],
  };

  return (
    <div className="relative max-w-5xl mx-auto flex flex-col gap-4">
      <PageHeader title="Edit Vendor" />
      <VendorForm defaultValues={defaultValues} type="edit" vendorId={id} />
    </div>
  );
};

export default EditVendorPage;
