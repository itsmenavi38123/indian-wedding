'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, User } from 'lucide-react';
import { useGetVendorTeamById } from '@/services/api/vendors';
import { PageHeader } from '@/components/ui/pageHeader';

const ViewVendorTeamPage = () => {
  const { id: teamId } = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetVendorTeamById(teamId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data?.data) {
    return <p className="text-center text-red-500 mt-10">Team not found</p>;
  }

  const team = data.data;
  const members = team?.teamMembers || [];

  return (
    <div className="min-h-screen py-8 px-4 md:px-10">
      {/* Header */}
      <PageHeader title="Team Details" />

      {/* Team Info */}
      <Card className="mb-6 shadow-sm border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl font-semibold flex justify-between items-center">
            <span>{team.name}</span>
            <Badge variant="secondary" className="text-sm">
              Team
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            <strong>Description:</strong>{' '}
            {team.description ? team.description : 'No description provided.'}
          </p>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm text-muted-foreground">
            <p>
              <strong>ID:</strong> {team.id}
            </p>
            <p>
              <strong>Created:</strong>{' '}
              {new Date(team.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
            <p>
              <strong>Updated:</strong>{' '}
              {new Date(team.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Members Section */}
      <Card className="shadow-sm border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl font-semibold flex items-center gap-2">
            Team Members
            <Badge variant="outline">{members.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member: any, index: number) => (
                <div
                  key={index}
                  className="border rounded-xl p-4 flex flex-col gap-2 bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium text-base">{member.teamMember?.name || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <p>{member.teamMember?.email || 'No email provided'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No members added to this team yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewVendorTeamPage;
