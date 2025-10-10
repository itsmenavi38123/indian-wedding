'use client';

import React, { useEffect, useState } from 'react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FormFieldWrapper } from './FormFieldWrapper';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { setLoading } from '@/store/slices/vendor';
import Image from 'next/image';
import { X } from 'lucide-react';

import { VendorServiceFormData, vendorServiceSchema } from '@/types/vendor/Vendor';
import { createVendorService, updateVendorService } from '@/services/api/vendorServices';

export const VendorServiceForm = ({
  defaultValues,

  vendorServiceId,
  type = 'add',
}: {
  defaultValues?: Partial<VendorServiceFormData>;
  vendorId?: string;
  vendorServiceId?: string; // needed for editing
  type?: 'add' | 'edit';
}) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);

  const form = useForm<VendorServiceFormData>({
    resolver: zodResolver(vendorServiceSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      price: 0,
      country: '',
      state: '',
      city: '',
      name: '',
      latitude: 0,
      longitude: 0,
      thumbnail: null,
      media: [],
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        title: defaultValues.title || '',
        description: defaultValues.description || '',
        category: defaultValues.category || '',
        price: defaultValues.price || 0,
        country: defaultValues.country || '',
        state: defaultValues.state || '',
        city: defaultValues.city || '',
        name: defaultValues.name || '',
        latitude: defaultValues.latitude || 0,
        longitude: defaultValues.longitude || 0,
        thumbnail: defaultValues.thumbnail || null,
        media: defaultValues.media || [],
      });

      if (defaultValues.thumbnail) {
        setThumbnailPreview(defaultValues.thumbnail as string);
      }
      if (defaultValues.media) {
        setMediaPreviews(defaultValues.media as string[]);
      }
    }
  }, [defaultValues, form]);

  const onSubmit: SubmitHandler<VendorServiceFormData> = async (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('price', String(data.price));
    formData.append('country', data.country);
    formData.append('state', data.state);
    formData.append('city', data.city);
    formData.append('name', data.name);
    formData.append('latitude', String(data.latitude));
    formData.append('longitude', String(data.longitude));

    if (data.thumbnail instanceof File) {
      formData.append('thumbnail', data.thumbnail);
    }

    (data.media || []).forEach((file) => {
      if (file instanceof File) {
        formData.append('media', file);
      }
    });

    dispatch(setLoading(true));
    try {
      if (type === 'edit' && vendorServiceId) {
        await updateVendorService(vendorServiceId, formData);
        toast.success('Vendor Service updated successfully');
      } else {
        await createVendorService(formData);
        toast.success('Vendor Service created successfully');
      }
      router.push(`/vendor/services`);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${type === 'edit' ? 'update' : 'create'} vendor service`);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('thumbnail', file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    form.setValue('media', files);
    setMediaPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 p-6 rounded-lg bg-black text-white"
      >
        <h2 className="text-2xl font-bold mb-4">
          {type === 'edit' ? 'Edit Vendor Service' : 'Add Vendor Service'}
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <FormFieldWrapper name="title" label="Title" />
          <FormFieldWrapper name="description" label="Description" type="textarea" />
          <FormFieldWrapper name="category" label="Category" />
          <FormFieldWrapper name="price" label="Price" type="number" />
          <FormFieldWrapper name="country" label="Country" />
          <FormFieldWrapper name="state" label="State" />
          <FormFieldWrapper name="city" label="City" />
          <FormFieldWrapper name="name" label="Vendor Name" />
          <FormFieldWrapper name="latitude" label="Latitude" type="number" />
          <FormFieldWrapper name="longitude" label="Longitude" type="number" />
        </div>

        {/* Thumbnail */}
        <div className="space-y-2">
          <label className="font-semibold text-sm">Thumbnail Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-white file:text-black hover:file:bg-gray-100"
          />
          {thumbnailPreview && (
            <div className="relative w-32 h-32 mt-2">
              <Image
                src={thumbnailPreview}
                alt="Thumbnail Preview"
                fill
                className="rounded-md object-cover"
              />
              <button
                type="button"
                className="absolute top-1 right-1 bg-red-600 p-1 rounded-full"
                onClick={() => {
                  form.setValue('thumbnail', null);
                  setThumbnailPreview(null);
                }}
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Media */}
        <div className="space-y-2">
          <label className="font-semibold text-sm">Gallery Images (Multiple)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleMediaChange}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-white file:text-black hover:file:bg-gray-100"
          />
          {mediaPreviews.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {mediaPreviews.map((src, index) => (
                <div key={index} className="relative w-24 h-24">
                  <Image
                    src={src}
                    alt={`Media ${index}`}
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <Button type="submit" variant="ghost" className="bg-white text-black">
            {type === 'edit' ? 'Update Service' : 'Create Service'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
