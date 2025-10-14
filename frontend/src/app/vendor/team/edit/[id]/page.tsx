'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import VendorForm, { VendorFormValues } from '@/app/(components)/vendors/components/VendorForm';
import {
  UpdateTeamWithMembersPayload,
  useGetVendorTeamById,
  useUpdateTeamWithMembers,
} from '@/services/api/vendors';

const EditTeam = () => {
  const { id: teamId } = useParams<{ id: string }>();
  const router = useRouter();
  console.log('TeamId passed to hook:', teamId);
  const { data, error, isLoading } = useGetVendorTeamById(teamId);
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
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-0 mb-6">
          <div className="flex w-full sm:w-10 justify-start">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center cursor-pointer bg-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </div>
          <div className="flex items-center justify-center w-full sm:w-auto">
            <h1 className="text-2xl text-gold font-bold text-center sm:text-left">Edit Team</h1>
          </div>
          <div className="none sm:block sm:w-10"></div>
        </div>
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
