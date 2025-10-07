'use client';
import React, { use, useState } from 'react';
import { updateLeadTeamAssignments, useGetVendorsByLeadId } from '@/services/api/leads';
import {
  ArrowLeft,
  Loader2,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { format, differenceInDays } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

interface AssignVendorsLeadPageProps {
  params: Promise<{ id: string }>;
}

const AssignVendorsPage = ({ params }: AssignVendorsLeadPageProps) => {
  const { id } = use(params);
  const router = useRouter();
  const { data: lead, isLoading } = useGetVendorsByLeadId(id);

  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<Record<string, string[]>>({});

  const { mutate: assignVendorsMutate, isPending: assigning } = useMutation({
    mutationFn: ({
      leadId,
      teamIdsByVendor,
    }: {
      leadId: string;
      teamIdsByVendor: Record<string, string[]>;
    }) => updateLeadTeamAssignments(leadId, { teamIdsByVendor }),

    onSuccess: () => {
      toast.success('Vendors assigned successfully!');
      router.back();
    },

    onError: (error: any) => {
      console.error('Error assigning vendors:', error);
      toast.error(error.response?.data?.message || 'Failed to assign vendors. Please try again.');
    },
  });

  React.useEffect(() => {
    if (!lead?.data) return;

    const cards = lead.data.cards || [];

    const vendorIds = cards.map((card: any) => card.vendorId);

    const teamsByVendor: Record<string, string[]> = {};
    cards.forEach((card: any) => {
      teamsByVendor[card.vendorId] = card.cardTeams?.map((ct: any) => ct.teamId) || [];
    });

    setSelectedVendors(vendorIds);
    setSelectedTeams(teamsByVendor);
  }, [lead]);

  const toggleVendor = (id: string) => {
    setSelectedVendors((prev) => {
      if (prev.includes(id)) {
        setSelectedTeams((prevTeams) => {
          const newTeams = { ...prevTeams };
          delete newTeams[id];
          return newTeams;
        });
        return prev.filter((v) => v !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const toggleTeam = (vendorId: string, teamId: string) => {
    setSelectedTeams((prev) => {
      const currentTeams = prev[vendorId] || [];
      const updatedTeams = currentTeams.includes(teamId)
        ? currentTeams.filter((t) => t !== teamId)
        : [...currentTeams, teamId];
      return { ...prev, [vendorId]: updatedTeams };
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!lead?.data) {
    return <p className="text-center text-red-500">Lead not found</p>;
  }

  const d = lead?.data;
  const coupleTitle = `${d?.partner1Name} & ${d?.partner2Name}`;
  const daysToWedding = differenceInDays(new Date(d.weddingDate), new Date());
  const matchedVendors = d.matchedVendors?.filter((vendor: any) => vendor.teams?.length > 0) || [];
  const assignedFromCards = (d.cards || []).map((card: any) => ({
    id: card.vendorId,
    name: card.vendor?.name || 'Unnamed Vendor',
    teams: (card.cardTeams || []).map((ct: any) => ({
      id: ct.teamId,
      name: ct.team?.name || 'Unnamed Team',
    })),
  }));

  // Merge matched and assigned vendors (avoid duplicates by ID)
  const vendorMap = new Map();

  matchedVendors.forEach((vendor: any) => {
    vendorMap.set(vendor.id, {
      id: vendor.id,
      name: vendor.name,
      teams: vendor.teams || [],
    });
  });

  assignedFromCards.forEach((vendor: { id: any; teams: any[]; name: any }) => {
    const existing = vendorMap.get(vendor.id);
    const combinedTeams = [
      ...(existing?.teams || []),
      ...vendor.teams.filter(
        (t: any) => !(existing?.teams || []).some((et: any) => et.id === t.id)
      ),
    ];
    vendorMap.set(vendor.id, {
      id: vendor.id,
      name: vendor.name,
      teams: combinedTeams,
    });
  });

  const allVendors = Array.from(vendorMap.values());

  return (
    <div className="relative max-w-5xl mx-auto flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-2xl font-bold text-center">Assign Vendors to Lead</h1>
        </div>
      </div>

      {/* Couple Details */}
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-start xs:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{coupleTitle}</h1>
          <span className="text-sm text-muted-foreground">
            Last Updated: {format(new Date(d.updatedAt), 'PPpp')}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 w-full xs:w-auto mb-2"
        >
          {d.status}
        </Button>
      </div>

      {/* Contact Details */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            {/* Partners */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{d.partner1Name?.[0]}</AvatarFallback>
                </Avatar>
                <p className="font-medium">{d.partner1Name}</p>
              </div>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{d.partner2Name?.[0]}</AvatarFallback>
                </Avatar>
                <p className="font-medium">{d.partner2Name}</p>
              </div>
            </div>

            {/* Phone & WhatsApp */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Phone className="h-4 w-4" />
                </Button>
                <p className="text-sm text-muted-foreground">{d.phoneNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <p className="text-sm text-muted-foreground">{d.whatsappNumber}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2 sm:col-span-2">
              <Mail className="h-4 w-4" />
              <span>{d.email}</span>
              <Button size="sm" variant="outline">
                Send Email
              </Button>
            </div>

            {/* Wedding Date */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(d.weddingDate), 'PPP')}</span>
              <Badge variant="secondary">{daysToWedding} days to go</Badge>
            </div>

            {/* Budget */}
            <div className="flex items-center gap-2">
              <span>Budget:</span>
              <span>
                ₹{d.budgetMin.toLocaleString()} - ₹{d.budgetMax.toLocaleString()}
              </span>
            </div>

            {/* Guests */}
            <div className="flex items-center gap-2">
              Guests: {d.guestCountMin} - {d.guestCountMax}
            </div>

            {/* Locations */}
            <div className="flex items-center gap-2 ">
              <MapPin className="h-4 w-4" />
              <span>
                {d.preferredLocations.length
                  ? d.preferredLocations.join(', ')
                  : 'No preferred locations'}
              </span>
            </div>

            {/* Service Types */}
            <div className="flex items-center gap-2">
              <span>Service Types:</span>
              <span>{d.serviceTypes ? d.serviceTypes.split(',').join(', ') : 'N/A'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Assignment */}
      <div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Assign Vendors</CardTitle>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                if (!id) {
                  return toast.error('Invalid lead ID.');
                }

                if (selectedVendors.length === 0) {
                  return toast.error('Please select at least one vendor.');
                }

                // Check if each selected vendor has at least one team selected
                const vendorsWithoutTeams = selectedVendors.filter(
                  (vendorId) => !selectedTeams[vendorId] || selectedTeams[vendorId].length === 0
                );

                if (vendorsWithoutTeams.length > 0) {
                  return toast.error('Please select at least one team for each selected vendor.');
                }

                assignVendorsMutate({
                  leadId: id,
                  teamIdsByVendor: selectedTeams,
                });
              }}
            >
              {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Vendors'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {allVendors.length === 0 ? (
              <div className="p-2 text-center text-sm text-muted-foreground">No vendors found</div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedVendors.length > 0
                      ? `${selectedVendors.length} Vendor(s) Selected`
                      : 'Select Vendors'}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[var(--radix-dropdown-menu-trigger-width)]"
                >
                  {allVendors.map((vendor: any) => (
                    <DropdownMenuCheckboxItem
                      key={vendor.id}
                      checked={selectedVendors.includes(vendor.id)}
                      onCheckedChange={() => toggleVendor(vendor.id)}
                    >
                      {vendor.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {/* Teams per selected vendor */}
            {selectedVendors.map((vendorId) => {
              const vendor = allVendors.find((v: any) => v.id === vendorId);
              if (!vendor || !vendor.teams?.length) return null;
              return (
                <div key={vendorId} className="space-y-2">
                  <h3 className="font-medium text-sm">{vendor.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {vendor.teams.map((team: any) => (
                      <Button
                        key={team.id}
                        variant={selectedTeams[vendorId]?.includes(team.id) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleTeam(vendorId, team.id)}
                      >
                        {team.name}
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssignVendorsPage;
