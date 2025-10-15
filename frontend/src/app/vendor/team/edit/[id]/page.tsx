'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import VendorForm, { VendorFormValues } from '@/app/(components)/vendors/components/VendorForm';
import {
  UpdateTeamWithMembersPayload,
  useGetVendorTeamById,
  useUpdateTeamWithMembers,
} from '@/services/api/vendors';
import { PageHeader } from '@/components/ui/pageHeader';

const EditTeam = () => {
  const { id: teamId } = useParams<{ id: string }>();
  const router = useRouter();
  console.log('TeamId passed to hook:', teamId);
  const { data, isLoading } = useGetVendorTeamById(teamId);
  const updateTeamMutation = useUpdateTeamWithMembers();

  const apiResponse = data;
  const teamData = apiResponse?.data;

  console.log('teamMembers from API:', teamData?.teamMembers);

  if (isLoading) return <div className="text-white">Loading...</div>;
  if (!data) return <div className="text-red-500">Team not found</div>;

  const defaultValues: VendorFormValues = {
    teams: [
      {
        name: data.data.name,
        description: data.data.description || '',
        members:
          Array.isArray(data.data.teamMembers) && data.data.teamMembers.length > 0
            ? data.data.teamMembers.map((member: any) => ({
                name: member.teamMember?.name || '',
                email: member.teamMember?.email || '',
              }))
            : [{ name: '', email: '' }],
      },
    ],
  };

  const handleEditSubmit = (formData: VendorFormValues) => {
    if (!teamId) return;

    const payload: UpdateTeamWithMembersPayload = {
      name: formData.teams[0].name,
      description: formData.teams[0].description,
      members: formData.teams[0].members.map((m) => ({
        name: m.name,
        email: m.email,
      })),
    };

    updateTeamMutation.mutate(
      { teamId, payload },
      {
        onSuccess: () => {
          router.back();
        },
      }
    );
  };
  if (isLoading) return <div className="text-white">Loading...</div>;
  if (!data) return <div className="text-red-500">Team not found</div>;

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="container mx-auto px-4">
        <PageHeader title="Edit Team" />
        <VendorForm
          key={JSON.stringify(defaultValues)}
          defaultValues={defaultValues}
          mode="edit"
          onSubmit={handleEditSubmit}
        />
      </div>
    </div>
  );
};

export default EditTeam;
