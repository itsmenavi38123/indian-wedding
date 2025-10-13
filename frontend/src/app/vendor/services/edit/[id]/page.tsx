'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetVendorServiceById } from '@/services/api/vendorServices';
import { VendorServiceForm } from '@/app/vendor/services/components/VendorFormService';

interface EditVendorServicePageProps {
  params: Promise<{ id: string }>;
}

const EditVendorServicePage = ({ params }: EditVendorServicePageProps) => {
  const router = useRouter();
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
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-0">
        <div className="flex w-full sm:w-10 justify-start">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
        <div className="flex items-center justify-center w-full sm:w-auto">
          <h1 className="text-2xl font-bold text-center sm:text-left">Edit Vendor Service</h1>
        </div>
        <div className="none sm:block sm:w-10"></div>
      </div>

      {/* Vendor Service Form */}
      <VendorServiceForm defaultValues={defaultValues} vendorServiceId={serviceId} type="edit" />
    </div>
  );
};

export default EditVendorServicePage;
