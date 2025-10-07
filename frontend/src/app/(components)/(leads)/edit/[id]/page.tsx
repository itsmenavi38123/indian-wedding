'use client';
import React, { use } from 'react';
import LeadForm from '../../components/LeadForm';
import { useGetLead } from '@/services/api/leads';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface EditLeadPageProps {
  params: Promise<{ id: string }>;
}

const EditPage = ({ params }: EditLeadPageProps) => {
  const { id } = use(params);
  const router = useRouter();
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
  };

  return (
    <div className="relative max-w-5xl mx-auto flex flex-col gap-4">
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-0">
        <div className="flex w-full sm:w-10 justify-start">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center cursor-pointer bg-gold text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
        <div className="flex items-center justify-center w-full sm:w-auto">
          <h1 className="text-2xl font-bold text-center sm:text-left text-white">Edit Lead</h1>
        </div>
        <div className="none sm:block sm:w-10"></div>
      </div>
      <LeadForm defaultValues={defaultValues} type={'edit'} />
    </div>
  );
};

export default EditPage;
