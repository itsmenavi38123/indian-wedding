'use client';

import React from 'react';
import { useGetVendor } from '@/services/api/vendors';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { VendorForm } from '../../components/VendorForm';
interface EditVendorPageProps {
  params: { id: string };
}

const EditVendorPage = ({ params }: EditVendorPageProps) => {
  const router = useRouter();

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
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-0">
        <div className="flex w-full sm:w-10 justify-start">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
        <div className="flex items-center justify-center w-full sm:w-auto">
          <h1 className="text-2xl font-bold text-center sm:text-left">Edit Vendor</h1>
        </div>
        <div className="none sm:block sm:w-10"></div>
      </div>
      <VendorForm defaultValues={defaultValues} type="edit" vendorId={id} />
    </div>
  );
};

export default EditVendorPage;
