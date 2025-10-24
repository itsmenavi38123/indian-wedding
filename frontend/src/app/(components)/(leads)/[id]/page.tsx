'use client';

import { updateLeadStatus, useGetLead } from '@/services/api/leads';
import { useParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Phone,
  Mail,
  MessageCircle,
  ArrowLeft,
  Calendar,
  MapPin,
  ChevronDown,
  Loader2,
  Clock,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LEAD_STATUS_VALUES, LeadStatus } from '@/types/lead/Lead';
import { API_QUERY_KEYS } from '@/services/apiBaseUrl';
import { toast } from 'sonner';
import { AssignedVendorTeams } from '../components/AssignedVendorTeams';
import { RootState } from '@/store/store';
import { RoleType } from '@/components/common/Header/Header';
import { useSelector } from 'react-redux';
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key } from 'react';
import { getImageUrl } from '../../(gallerycomponents)/components/steps/Services';

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params?.id as string;
  const queryClient = useQueryClient();
  const auth = useSelector((state: RootState) => state.auth.user);
  const role = auth?.role as RoleType | null;

  const { data: lead, isLoading, isFetching } = useGetLead(leadId);
  const { isPending: updateLoading, mutate: updateStatusMutate } = useMutation({
    mutationFn: ({ status }: { status: LeadStatus }) => updateLeadStatus(leadId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEYS.lead.getSingleLead, leadId] });
    },
    onError: () => {
      toast.error('Failed to update lead status. Please try again later.');
    },
  });

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (!lead) return <p className="p-4">Lead not found</p>;

  const d = lead.data;
  const coupleTitle = `${d.partner1Name} & ${d.partner2Name}`;
  const daysToWedding = differenceInDays(new Date(d.weddingDate), new Date());

  return (
    <div className="">
      <div>
        <Button variant="ghost" className="bg-white" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2 cursor-pointer" /> Back
        </Button>
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-start xs:justify-between gap-3">
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-white">{coupleTitle}</h1>
            <span className="text-sm text-muted-foreground">
              Last Updated: {format(new Date(d.updatedAt), 'PPpp')}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 w-full xs:w-auto mb-2"
              >
                {updateLoading || isFetching ? (
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                ) : (
                  d.status
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.values(LEAD_STATUS_VALUES).map((status) => (
                <DropdownMenuItem
                  disabled={updateLoading || isFetching}
                  key={status}
                  onClick={() => updateStatusMutate({ status })}
                >
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-8 space-y-6">
          {/* Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-6">
                <div className="flex items-center justify-between gap-3">
                  <Avatar>
                    <AvatarFallback className="text-black">{d.partner1Name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{d.partner1Name}</p>
                  </div>
                </div>
                {/* Partner 2 */}
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="text-black">{d.partner2Name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{d.partner2Name}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4 text-black" />
                  </Button>
                  <p className="text-sm text-muted-foreground">{d.phoneNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="mt-2.5">
                    <MessageCircle className="h-4 w-4 text-black" />
                  </Button>
                  <p className="text-sm text-muted-foreground">{d.whatsappNumber}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{d.email}</span>
                <Button size="sm" variant="outline" className="text-black">
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
                <span>Budget: </span>
                <span>
                  ₹{d.budgetMin.toLocaleString()} - ₹{d.budgetMax.toLocaleString()}
                </span>
              </div>
              {/* Guest Count */}
              <div>
                Guests: {d.guestCountMin} - {d.guestCountMax}
              </div>

              {/* Locations */}
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>
                  {d.preferredLocations.length
                    ? d.preferredLocations.join(', ')
                    : 'No preferred locations'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Events */}
          {role === 'USER' && 'ADMIN' && (
            <Card>
              <CardHeader>
                <CardTitle>Events</CardTitle>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4" />
                {d.weddingPlan?.events?.length ? (
                  <div className="space-y-4">
                    {d.weddingPlan.events.map((event: any) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between border rounded-lg p-3"
                      >
                        <div>
                          <p className="font-semibold flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-white" /> {event.name}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(event.date), 'PPP')} &middot; {event.startTime} -{' '}
                            {event.endTime}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No events found for this wedding plan.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Services */}
          {role === 'USER' && 'ADMIN' && (
            <Card>
              <CardHeader>
                <CardTitle>Services</CardTitle>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4" />

                {d.weddingPlan?.services?.length ? (
                  <div className="space-y-4">
                    {d.weddingPlan.services.map((service: any) => {
                      const vs = service.vendorService;
                      const vendor = vs?.vendor;
                      return (
                        <div
                          key={service.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between border rounded-lg p-3 gap-2"
                        >
                          <div>
                            <p className="font-semibold flex items-center gap-2">
                              {vs?.category || 'Service'}{' '}
                            </p>

                            <p className="text-sm text-muted-foreground mt-1">
                              {vs?.title} — {vs?.description || 'No description'}
                            </p>

                            <p className="text-sm mt-1">
                              <span className="font-medium">Vendor:</span> {vendor?.name || 'N/A'} (
                              {vendor?.email || 'No email'})
                            </p>

                            <p className="text-sm mt-1">
                              <span className="font-medium">Location:</span>{' '}
                              {vs?.city || vs?.state || vs?.country || 'N/A'}
                            </p>

                            <p className="text-sm mt-1">
                              <span className="font-medium">Notes:</span>{' '}
                              {service.notes || 'No notes'}
                            </p>
                          </div>

                          {/* Right side - Price */}
                          <div className="text-right sm:text-left">
                            <p className="font-semibold text-white">
                              $ {vs?.price?.toLocaleString() || '—'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No services found for this wedding plan.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recommended Vendors */}
          {(role === 'USER' || role === 'ADMIN') && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recommended Vendors</CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {(() => {
                  const services = d.weddingPlan?.services || [];
                  const vendorsMap = new Map();

                  services.forEach((service: any) => {
                    const vs = service.vendorService;
                    const vendor = vs?.vendor;
                    if (!vendor) return;

                    console.log(vs, '🧩 full vendorService object');

                    const thumbnailUrl = vs.thumbnailUrl || vs.mediaUrls?.[0] || '';

                    console.log(thumbnailUrl, 'thumbnailUrl');

                    if (!vendorsMap.has(vendor.id)) {
                      vendorsMap.set(vendor.id, {
                        id: vendor.id,
                        name: vendor.name,
                        email: vendor.email,
                        contactNo: vendor.contactNo,
                        countryCode: vendor.countryCode,
                        services: [
                          {
                            category: vs?.category || 'Service',
                            title: vs?.title,
                            thumbnailUrl,
                          },
                        ],
                      });
                    } else {
                      const existing = vendorsMap.get(vendor.id);
                      existing.services.push({
                        category: vs?.category || 'Service',
                        title: vs?.title,
                        thumbnailUrl,
                      });
                      vendorsMap.set(vendor.id, existing);
                    }
                  });

                  const vendors = Array.from(vendorsMap.values());

                  if (!vendors.length) {
                    return (
                      <p className="text-center text-muted-foreground">
                        No recommended vendors yet.
                      </p>
                    );
                  }

                  return (
                    <div className="grid gap-4">
                      {vendors.map((vendor) => (
                        <div key={vendor.id} className="border rounded-lg p-4 flex flex-col gap-3">
                          {/* Vendor Info */}
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <div>
                              <p className="font-semibold text-white">{vendor.name}</p>
                              <p className="text-sm text-muted-foreground">{vendor.email}</p>

                              <div className="flex items-center gap-2 mt-1">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {vendor.countryCode} {vendor.contactNo}
                                </span>
                              </div>
                              <p className="text-sm mt-1">
                                <span className="font-medium">Services:</span>{' '}
                                {vendor.services
                                  .map((s: { category: string }) => s.category)
                                  .join(', ')}
                              </p>
                            </div>
                            {/* Contact Action */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`mailto:${vendor.email}`, '_blank')}
                              className="text-black mt-3 sm:mt-0"
                            >
                              Contact Vendor
                            </Button>
                          </div>
                          {/* Service Thumbnails */}
                          {vendor.services.some(
                            (s: { thumbnailUrl: string | null }) => s.thumbnailUrl
                          ) && (
                            <div className="flex flex-wrap gap-3 mt-2">
                              {vendor.services.map(
                                (
                                  service: {
                                    thumbnailUrl?: string | null;
                                    title?: string;
                                    category?: string;
                                  },
                                  idx: number
                                ) =>
                                  service.thumbnailUrl && (
                                    <div key={idx} className="relative">
                                      <img
                                        src={service.thumbnailUrl}
                                        alt={service.title || 'Service Image'}
                                        className="w-32 h-24 object-cover rounded-lg border"
                                      />
                                      <p className="text-xs text-center mt-1 text-muted-foreground truncate w-32">
                                        {service.category}
                                      </p>
                                    </div>
                                  )
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add note */}
              <form className="mb-4 flex gap-2">
                <Input placeholder="Add a note..." />
                <Button>Add</Button>
              </form>
              <Separator className="mb-4" />
              {/* {d.activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activities yet.</p>
              ) : (
                <div className="space-y-4">
                  {d.activities.map((a: any, idx: number) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">{a.user}</span> {a.action}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          <Clock className="inline h-3 w-3 mr-1" />
                          {format(new Date(a.timestamp), 'PPpp')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )} */}
            </CardContent>
          </Card>

          {/* Vendors */}
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>Vendors</CardTitle>
                <div className="flex gap-2"></div>
              </div>
            </CardHeader>
            {/* Vendor Teams  */}
            <CardContent className="space-y-6">
              {d.cards && d.cards.some((card: any) => !!card.vendor) ? (
                <AssignedVendorTeams
                  cards={d.cards
                    .filter((card: any) => !!card.vendor)
                    .map((card: any) => ({
                      id: card.id,
                      vendorId: card.vendor.id,
                      vendorName: card.vendor.name,
                      vendorEmail: card.vendor.email,
                      contactNo: card.vendor.contactNo,
                      countryCode: card.vendor.countryCode,
                      teams:
                        card.cardTeams?.map((ct: any) => ({
                          id: ct.team.id,
                          name: ct.team.name,
                          description: ct.team.description,
                          teamMembers:
                            ct.team.teamMembers?.map((memberOnTeam: any) => ({
                              id: memberOnTeam.teamMember.id,
                              name: memberOnTeam.teamMember.name,
                              email: memberOnTeam.teamMember.email,
                              phone: memberOnTeam.teamMember.phone,
                              role: memberOnTeam.teamMember.role,
                              avatar: memberOnTeam.teamMember.avatar,
                            })) || [],
                        })) || [],
                    }))}
                />
              ) : (
                <p className="text-center text-muted-foreground">No assigned vendor</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 md:col-span-4 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full text-black"
                variant="outline"
                onClick={() => router.push(`/admin/leads/${leadId}/proposal/create`)}
              >
                Create Proposal
              </Button>
              <Button className="w-full text-black" variant="outline">
                Schedule Meeting
              </Button>
              <Button className="w-full text-black" variant="outline">
                Send Email
              </Button>
              <Button className="w-full text-black" variant="outline">
                Add Task
              </Button>
            </CardContent>
          </Card>

          {/* Related Items */}
          <Card>
            <CardHeader>
              <CardTitle>Related Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div>Proposals: {d.proposals.length}</div>
              <div>Contracts: {d.contracts.length}</div>
              <div>Payments: {d.payments.length}</div>
            </CardContent>
          </Card>

          {/* Internal Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea placeholder="Private notes for team..." />
              <Button size="sm" className="mt-2">
                Save
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
