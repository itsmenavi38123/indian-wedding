'use client';

import React from 'react';
import { useGetVendor } from '@/services/api/vendors';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { VendorForm } from '../components/VendorForm';
import { AssignedVendorTeams } from '@/app/(components)/(leads)/components/AssignedVendorTeams';

interface ViewVendorPageProps {
  params: Promise<{ id: string }>;
}

const ViewVendorPage = ({ params }: ViewVendorPageProps) => {
  const router = useRouter();

  // Unwrap params promise
  const unwrappedParams = React.use(params);
  const { id } = unwrappedParams;

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
    name: vendor.data.name ?? '',
    email: vendor.data.email ?? '',
    vendorId: vendor.data.id,
    contactNo: vendor.data.contactNo || '',
    countryCode: vendor.data.countryCode || '+91',
    serviceTypes: vendor.data.serviceTypes || '',
    minimumAmount: vendor.data.minimumAmount ?? 0,
    maximumAmount: vendor.data.maximumAmount ?? 0,
    isActive: vendor.data.isActive ?? true,
  };

  const cards = [
    {
      id: vendor.data.id,
      vendorId: vendor.data.id,
      vendorName: vendor.data.name,
      vendorEmail: vendor.data.email,
      contactNo: vendor.data.contactNo,
      countryCode: vendor.data.countryCode,
      teams:
        vendor.data.teams?.map((team: any) => ({
          id: team.id,
          name: team.name,
          description: team.description,
          teamMembers:
            team.teamMembers?.map((memberOnTeam: any) => ({
              id: memberOnTeam.teamMember.id,
              name: memberOnTeam.teamMember.name,
              email: memberOnTeam.teamMember.email,
              phone: memberOnTeam.teamMember.phone,
              role: memberOnTeam.teamMember.role,
              avatar: memberOnTeam.teamMember.avatar,
            })) || [],
        })) || [],
    },
  ];

  return (
    <div className="relative max-w-5xl mx-auto flex flex-col gap-8">
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
          <h1 className="text-2xl font-bold text-center sm:text-left">Vendor Details</h1>
        </div>
        <div className="none sm:block sm:w-10"></div>
      </div>

      <VendorForm defaultValues={defaultValues} type="view" readOnly />

      {/* Show teams using AssignedVendorTeams */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Assigned Teams</h2>
        <AssignedVendorTeams cards={cards} readOnly />
      </div>
    </div>
  );
};

export default ViewVendorPage;
