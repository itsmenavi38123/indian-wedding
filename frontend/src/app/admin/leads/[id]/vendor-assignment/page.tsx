'use client';

import { useRouter, useSearchParams, useParams } from 'next/navigation';
import VendorAssignmentView from '@/app/(components)/(leads)/components/VendorAssignmentView';
import { useGetAllVendorsForLead } from '@/services/api/leads'; // adjust to your hook path
import { useAssignVendorsToProposal } from '@/services/api/proposal';

export default function VendorAssignmentPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const leadId = params.id;
  const searchParams = useSearchParams();

  const proposalId = searchParams.get('proposalId') || undefined;
  const serviceId = searchParams.get('serviceId') || undefined;
  const selectedService = searchParams.get('service') || undefined;

  const { data: availableVendors, isLoading: isVendorsLoading } = useGetAllVendorsForLead(leadId, {
    serviceType: selectedService,
  });

  const assignVendorsMutation = useAssignVendorsToProposal();

  const handleAssignVendor = async (vendorId: string) => {
    if (!proposalId || !serviceId) {
      console.error('Missing proposalId or serviceId');
      return;
    }

    try {
      await assignVendorsMutation.mutateAsync({
        proposalId: proposalId,
        assignments: [
          {
            serviceId: serviceId,
            vendorId,
          },
        ],
      });

      console.log(`Vendor ${vendorId} assigned to service ${serviceId}`);
      router.back();
    } catch (error) {
      console.error('Error assigning vendor:', error);
    }
  };

  return (
    <VendorAssignmentView
      selectedService={selectedService}
      availableVendors={availableVendors}
      isVendorsLoading={isVendorsLoading}
      handleAssignVendor={handleAssignVendor}
      onClose={() => router.back()}
      leadId={leadId}
    />
  );
}
