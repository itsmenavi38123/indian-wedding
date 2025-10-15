'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Loader2, MapPin, Calendar, ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGetVendorServiceById } from '@/services/api/vendorServices';
import { format } from 'date-fns';
import Image from 'next/image';
import { PageHeader } from '@/components/ui/pageHeader';

const ViewVendorServicePage = () => {
  const params = useParams();
  const serviceId = params?.id as string;

  const { data: service, isLoading } = useGetVendorServiceById(serviceId);

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

  const d = service.data;

  return (
    <div className="relative max-w-5xl mx-auto flex flex-col gap-4">
      {/* Header */}
      <PageHeader title="Service Details" />
      {/* Main Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{d.title}</span>
            <Badge variant="secondary" className="capitalize">
              {d.category || 'N/A'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-6">
          {/* Thumbnail */}
          <div className="md:w-1/3 w-full">
            {d.thumbnail?.url ? (
              <Image
                src={d.thumbnail.url}
                alt={d.title}
                width={400}
                height={250}
                className="rounded-lg object-cover w-full h-56"
              />
            ) : (
              <div className="w-full h-56 bg-gray-100 flex items-center justify-center rounded-lg">
                <ImageIcon className="h-10 w-10 text-gray-400" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="md:w-2/3 space-y-3">
            <p className="text-gray-700">
              <strong>Description:</strong> {d.description || 'No description available.'}
            </p>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <p>
                <strong>Price:</strong> ${d.price || 'N/A'}
              </p>
              <p className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {d.city}, {d.state}, {d.country}
              </p>
              <p>
                <strong>Latitude:</strong> {d.latitude || '—'}
              </p>
              <p>
                <strong>Longitude:</strong> {d.longitude || '—'}
              </p>
              {d.createdAt && (
                <p className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Created: {format(new Date(d.createdAt), 'PPP')}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Section */}
      {d.media?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {d.media.map((m: any, i: number) => (
              <Image
                key={i}
                src={m.url}
                alt={`Media ${i + 1}`}
                width={300}
                height={200}
                className="rounded-md object-cover w-full h-40"
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ViewVendorServicePage;
