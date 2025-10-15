'use client';

import React from 'react';
import { useGetVendor } from '@/services/api/vendors';
import { Loader2 } from 'lucide-react';
import { VendorForm } from '../components/VendorForm';
import { AssignedVendorTeams } from '@/app/(components)/(leads)/components/AssignedVendorTeams';
import { PageHeader } from '@/components/ui/pageHeader';

interface ViewVendorPageProps {
  params: Promise<{ id: string }>;
}

const ViewVendorPage = ({ params }: ViewVendorPageProps) => {
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
      <PageHeader title="Vendor Details" />
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
