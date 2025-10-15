'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useGetVendorServiceById } from '@/services/api/vendorServices';
import { VendorServiceForm } from '@/app/vendor/services/components/VendorFormService';
import { PageHeader } from '@/components/ui/pageHeader';

interface EditVendorServicePageProps {
  params: Promise<{ id: string }>;
}

const EditVendorServicePage = ({ params }: EditVendorServicePageProps) => {
  const { id: serviceId } = React.use(params);
  console.log('serviceId', serviceId);
  const { data: service, isLoading } = useGetVendorServiceById(serviceId);
  console.log('service data', service);
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!service?.data) {
    return <p className="text-center text-red-500">Service not found</p>;
  }

  // Prepare default values for the form
  const defaultValues = {
    title: service.data.title,
    description: service.data.description,
    category: service.data.category,
    price: service.data.price,
    country: service.data.country,
    state: service.data.state,
    city: service.data.city,
    name: service.data.name,
    latitude: service.data.latitude,
    longitude: service.data.longitude,
    thumbnail: service.data.thumbnail?.url || null,
    media: service.data.media?.map((m: any) => m.url) || [],
  };

  return (
    <div className="relative max-w-5xl mx-auto flex flex-col gap-4">
      {/* Header */}
      <PageHeader title="Edit Vendor Service" />
      {/* Vendor Service Form */}
      <VendorServiceForm defaultValues={defaultValues} vendorServiceId={serviceId} type="edit" />
    </div>
  );
};

export default EditVendorServicePage;
