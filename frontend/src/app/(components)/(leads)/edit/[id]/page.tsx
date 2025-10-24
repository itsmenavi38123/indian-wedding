'use client';
import React, { use } from 'react';
import LeadForm from '../../components/LeadForm';
import { useGetLead } from '@/services/api/leads';
import { Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/pageHeader';

interface EditLeadPageProps {
  params: Promise<{ id: string }>;
}

const EditPage = ({ params }: EditLeadPageProps) => {
  const { id } = use(params);
  const { data: lead, isLoading } = useGetLead(id);
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

  const defaultValues = {
    partner1Name: lead.data.partner1Name || '',
    partner2Name: lead.data.partner2Name || '',
    primaryContact:
      lead.data.primaryContact === lead.data.phoneNumber
        ? 'partner1'
        : ('partner2' as 'partner1' | 'partner2'),
    phoneNumber: lead.data.phoneNumber || '',
    whatsappNumber: lead.data.whatsappNumber || '',
    whatsappNumberSameAsPhoneNumber: lead.data.whatsappNumber === lead.data.phoneNumber,
    email: lead.data.email || '',
    weddingDate: lead.data.weddingDate
      ? new Date(lead.data.weddingDate).toISOString().split('T')[0]
      : '',
    flexibleDates: lead.data.flexibleDates ?? false,
    guestCount: [lead.data.guestCountMin ?? 0, lead.data.guestCountMax ?? 0] as [number, number],
    budget: [lead.data.budgetMin ?? 0, lead.data.budgetMax ?? 0] as [number, number],
    preferredLocations: lead.data.preferredLocations || [],
    leadSource: lead.data.leadSource || 'WEBSITE',
    saveStatus: lead.data.saveStatus || 'SUBMITTED',
    referralDetails: lead.data.referralDetails || '',
    initialNotes: lead.data.initialNotes || '',
    serviceTypes: lead.data.serviceTypes || '',
    createdById: lead.data.createdById || undefined,
    weddingPlan: {
      events:
        lead.data.weddingPlan?.events?.map((event: any) => ({
          id: event.id,
          name: event.name,
          // show date in yyyy-mm-dd format (HTML date input compatible)
          date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
          startTime: event.startTime || '',
          endTime: event.endTime || '',
        })) || [],
      services:
        lead.data.weddingPlan?.services?.map((service: any) => ({
          id: service.id,
          category: service.vendorService?.category || '',
          title: service.vendorService?.title || '',
          description: service.vendorService?.description || '',
          price: service.vendorService?.price || 0,
          vendorName: service.vendorService?.vendor?.name || '',
          thumbnailUrl: service.vendorService?.thumbnailUrl || '',
        })) || [],
    },
  };

  return (
    <div className="relative max-w-5xl mx-auto flex flex-col gap-4">
      <PageHeader title="Edit Lead" />
      <LeadForm defaultValues={defaultValues} type={'edit'} />
    </div>
  );
};

export default EditPage;
