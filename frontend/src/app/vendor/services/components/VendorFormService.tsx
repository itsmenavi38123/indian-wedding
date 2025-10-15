'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, MapPin, Upload } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { AppDispatch } from '@/store/store';
import { setLoading } from '@/store/slices/vendor';
import { Button } from '@/components/ui/button';
import { FormFieldWrapper } from './FormFieldWrapper';
import { VendorServiceFormData, vendorServiceSchema } from '@/types/vendor/Vendor';
import { createVendorService, updateVendorService } from '@/services/api/vendorServices';
import { BASE_URL } from '@/lib/constant';

interface MediaItem {
  id?: string;
  file?: File;
  url: string;
  isExisting?: boolean;
}

interface VendorServiceFormProps {
  defaultValues?: VendorServiceFormData;
  vendorServiceId?: string;
  type?: 'add' | 'edit';
}

const SERVICE_CATEGORIES = [
  { value: 'photography', label: 'Photography' },
  { value: 'videography', label: 'Videography' },
  { value: 'catering', label: 'Catering' },
  { value: 'decoration', label: 'Decoration' },
  { value: 'venue', label: 'Venue' },
  { value: 'music', label: 'Music & Entertainment' },
  { value: 'makeup', label: 'Makeup & Hair' },
  { value: 'planning', label: 'Event Planning' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'other', label: 'Other' },
];

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

const mapContainerStyle = { width: '100%', height: '400px' };
const defaultCenter = { lat: 30.7333, lng: 76.7794 };

export const VendorServiceForm: React.FC<VendorServiceFormProps> = ({
  defaultValues,
  vendorServiceId,
  type = 'add',
}) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [thumbnailPreview, setThumbnailPreview] = useState<{
    file?: File;
    url: string;
    isExisting?: boolean;
  } | null>(null);
  const [mediaPreviews, setMediaPreviews] = useState<MediaItem[]>([]);
  const [removedMediaIds, setRemovedMediaIds] = useState<string[]>([]);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);

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
      removeMediaIds: [],
    },
  });

  // -------------------- LOAD DEFAULT VALUES --------------------
  useEffect(() => {
    if (!defaultValues) return;

    form.reset(defaultValues);

    // Thumbnail
    if (defaultValues.thumbnail) {
      if (typeof defaultValues.thumbnail === 'string') {
        setThumbnailPreview({ url: defaultValues.thumbnail, isExisting: true });
      } else if (defaultValues.thumbnail instanceof File) {
        setThumbnailPreview({
          file: defaultValues.thumbnail,
          url: URL.createObjectURL(defaultValues.thumbnail),
          isExisting: false,
        });
      }
    }

    // Media - Filter out thumbnail URL if present
    if (defaultValues.media && Array.isArray(defaultValues.media)) {
      const thumbnailUrl =
        typeof defaultValues.thumbnail === 'string' ? defaultValues.thumbnail : null;

      const mediaItems: MediaItem[] = [];

      for (const m of defaultValues.media) {
        if (typeof m === 'object' && m !== null && 'url' in m && 'id' in m) {
          // Skip if this is the thumbnail URL
          if (thumbnailUrl && m.url === thumbnailUrl) continue;

          mediaItems.push({
            id: m.id as string,
            url: m.url as string,
            isExisting: true,
          });
        } else if (typeof m === 'string') {
          // Skip if this is the thumbnail URL
          if (thumbnailUrl && m === thumbnailUrl) continue;

          mediaItems.push({
            url: m,
            isExisting: true,
          });
        } else if (m instanceof File) {
          mediaItems.push({
            file: m,
            url: URL.createObjectURL(m),
            isExisting: false,
          });
        }
      }

      setMediaPreviews(mediaItems);
    }

    // Map location
    if (defaultValues.latitude && defaultValues.longitude) {
      const position = { lat: defaultValues.latitude, lng: defaultValues.longitude };
      setMarkerPosition(position);
      setMapCenter(position);
    }
  }, [defaultValues, form]);

  // -------------------- MAP HANDLERS --------------------
  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarkerPosition({ lat, lng });
        form.setValue('latitude', lat);
        form.setValue('longitude', lng);
      }
    },
    [form]
  );

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMarkerPosition({ lat, lng });
        setMapCenter({ lat, lng });
        form.setValue('latitude', lat);
        form.setValue('longitude', lng);
        toast.success('Location set to your current position');
      },
      () => toast.error('Unable to get your location')
    );
  };

  // -------------------- SUBMIT HANDLER --------------------
  const onSubmit: SubmitHandler<VendorServiceFormData> = async (data) => {
    const formData = new FormData();

    // -------------------- BASIC FIELDS --------------------
    Object.entries({
      title: data.title,
      description: data.description,
      category: data.category,
      price: String(data.price),
      country: data.country,
      state: data.state,
      city: data.city,
      name: data.name,
      latitude: String(data.latitude),
      longitude: String(data.longitude),
    }).forEach(([key, value]) => formData.append(key, value));

    // -------------------- THUMBNAIL --------------------
    if (thumbnailPreview?.file) {
      // New thumbnail
      formData.append('thumbnail', thumbnailPreview.file);
    } else if (!thumbnailPreview?.isExisting) {
      // Thumbnail removed
      formData.append('removeThumbnail', 'true');
    }

    // -------------------- MEDIA --------------------
    // Append new media files
    mediaPreviews
      .filter((item) => item.file && !item.isExisting)
      .forEach((item) => formData.append('media', item.file!));

    // Append removed media IDs as comma-separated string
    if (removedMediaIds.length > 0) {
      removedMediaIds.forEach((url) => {
        formData.append('removeMediaIds', url);
      });
    }

    console.log('------ FormData Preview ------');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) console.log(key, '->', value.name);
      else console.log(key, '->', value);
    }
    console.log('------ FormData Preview End ------');
    // -------------------- SUBMIT --------------------
    dispatch(setLoading(true));

    try {
      if (type === 'edit' && vendorServiceId) {
        // Edit service
        await updateVendorService(vendorServiceId, formData);
        toast.success('Service updated successfully');
      } else {
        // Add new service
        await createVendorService(formData);
        toast.success('Service created successfully');
      }

      router.push('/vendor/services');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Submission failed');
    } finally {
      dispatch(setLoading(false));
    }
  };
  // -------------------- THUMBNAIL --------------------
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Thumbnail max 5MB');

    // Revoke old preview URL if exists
    if (thumbnailPreview?.url && !thumbnailPreview.isExisting) {
      URL.revokeObjectURL(thumbnailPreview.url);
    }

    const url = URL.createObjectURL(file);
    setThumbnailPreview({ file, url, isExisting: false });
    form.setValue('thumbnail', file);
  };

  const removeThumbnail = () => {
    if (thumbnailPreview?.url && !thumbnailPreview.isExisting) {
      URL.revokeObjectURL(thumbnailPreview.url);
    }
    setThumbnailPreview(null);
    form.setValue('thumbnail', null);
  };

  // -------------------- MEDIA --------------------
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate file sizes
    const invalidFiles = files.filter((f) => f.size > 5 * 1024 * 1024);
    if (invalidFiles.length) {
      toast.error('Some files exceed 5MB');
      return;
    }

    // Check total count
    if (mediaPreviews.length + files.length > 20) {
      toast.error('Max 20 media files allowed');
      return;
    }

    // Create new media items
    const newMediaItems: MediaItem[] = files.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
      isExisting: false,
    }));

    // Update state
    const updatedPreviews = [...mediaPreviews, ...newMediaItems];
    setMediaPreviews(updatedPreviews);

    // Update form - only set new files
    const allNewFiles = updatedPreviews.filter((m) => m.file && !m.isExisting).map((m) => m.file!);
    form.setValue('media', allNewFiles);

    // Clear the input so the same file can be selected again
    e.target.value = '';
  };

  const removeMedia = (index: number) => {
    const removed = mediaPreviews[index];
    if (removed.isExisting && removed.url) {
      setRemovedMediaIds((prev) => [...prev, removed.url]);
    }
    if (removed.url && !removed.isExisting) {
      URL.revokeObjectURL(removed.url);
    }
    const newPreviews = mediaPreviews.filter((_, i) => i !== index);
    setMediaPreviews(newPreviews);
    const newFiles = newPreviews.filter((m) => m.file && !m.isExisting).map((m) => m.file!);
    form.setValue('media', newFiles);
  };

  // -------------------- HELPER --------------------
  const getImageUrl = (url: string, isExisting: boolean) => {
    if (!isExisting) return url;
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    return `${BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Revoke all blob URLs on unmount
      if (thumbnailPreview?.url && !thumbnailPreview.isExisting) {
        URL.revokeObjectURL(thumbnailPreview.url);
      }
      mediaPreviews.forEach((item) => {
        if (item.url && !item.isExisting) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, [thumbnailPreview, mediaPreviews]);
  // -------------------- RENDER --------------------
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 p-8 rounded-xl bg-gradient-to-br from-gray-900 to-black text-white shadow-2xl"
      >
        {/* Header */}
        <div className="border-b border-gray-700 pb-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {type === 'edit' ? 'Edit Vendor Service' : 'Add New Vendor Service'}
          </h2>
          <p className="text-gray-400 mt-2">
            {type === 'edit'
              ? 'Update service details'
              : 'Fill in the details to create a new service'}
          </p>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-blue-400 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-400 rounded" />
            Basic Information
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <FormFieldWrapper
              name="title"
              label="Service Title"
              placeholder="e.g., Premium Wedding Photography"
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Category</label>
              <select
                {...form.register('category')}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">Select a category</option>
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {form.formState.errors.category && (
                <p className="text-red-400 text-sm">{form.formState.errors.category.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Price</label>
              <div className="flex items-center gap-2">
                <span className="text-2xl text-green-400">$</span>
                <input
                  type="number"
                  {...form.register('price', { valueAsNumber: true })}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              {form.formState.errors.price && (
                <p className="text-red-400 text-sm">{form.formState.errors.price.message}</p>
              )}
            </div>
            <FormFieldWrapper
              name="name"
              label="Vendor Business Name"
              placeholder="Your business name"
            />
          </div>
          <FormFieldWrapper
            name="description"
            label="Service Description"
            type="textarea"
            placeholder="Describe your service..."
          />
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-purple-400 flex items-center gap-2">
            <div className="w-1 h-6 bg-purple-400 rounded" />
            Location Details
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <FormFieldWrapper name="country" label="Country" placeholder="e.g., USA" />
            <FormFieldWrapper name="state" label="State" placeholder="e.g., California" />
            <FormFieldWrapper name="city" label="City" placeholder="e.g., Los Angeles" />
          </div>
        </div>

        {/* Map */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-green-400 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Service Location
            </h3>
            <Button
              type="button"
              onClick={getCurrentLocation}
              variant="outline"
              className="bg-green-600 hover:bg-green-700 text-white border-none"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Use Current Location
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-4">
            <FormFieldWrapper
              name="latitude"
              label="Latitude"
              type="number"
              placeholder="Click on map or enter manually"
            />
            <FormFieldWrapper
              name="longitude"
              label="Longitude"
              type="number"
              placeholder="Click on map or enter manually"
            />
          </div>
          <div className="rounded-lg overflow-hidden border-2 border-gray-700 shadow-xl">
            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={12}
                onClick={handleMapClick}
                options={{
                  styles: [
                    { elementType: 'geometry', stylers: [{ color: '#212121' }] },
                    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
                    { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
                    { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
                  ],
                }}
              >
                {markerPosition && <Marker position={markerPosition} />}
              </GoogleMap>
            </LoadScript>
          </div>
          <p className="text-sm text-gray-400 text-center">
            Click anywhere on the map to set location
          </p>
        </div>

        {/* Thumbnail */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-yellow-400 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Thumbnail Image
          </h3>
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 hover:border-yellow-400 transition">
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
              id="thumbnail-upload"
            />
            <label
              htmlFor="thumbnail-upload"
              className="cursor-pointer flex flex-col items-center justify-center gap-3"
            >
              <Upload className="w-12 h-12 text-yellow-400" />
              <span className="text-gray-300">Click to upload thumbnail (Max 5MB)</span>
            </label>
          </div>
          {thumbnailPreview && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={getImageUrl(thumbnailPreview.url, thumbnailPreview.isExisting || false)}
                alt="Thumbnail"
                fill
                className="object-cover"
              />
              <button
                type="button"
                className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 p-2 rounded-full shadow-lg"
                onClick={removeThumbnail}
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Media Gallery */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-pink-400 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Gallery Images (Max 20)
          </h3>
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 hover:border-pink-400 transition">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleMediaChange}
              className="hidden"
              id="media-upload"
            />
            <label
              htmlFor="media-upload"
              className="cursor-pointer flex flex-col items-center justify-center gap-3"
            >
              <Upload className="w-12 h-12 text-pink-400" />
              <span className="text-gray-300">Click to upload images (Max 5MB each)</span>
              <span className="text-sm text-gray-500">
                {mediaPreviews.length}/20 images uploaded
              </span>
            </label>
          </div>
          {mediaPreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mediaPreviews.map((item, index) => (
                <div
                  key={item.id || index}
                  className="relative group aspect-square rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition"
                >
                  <Image
                    src={getImageUrl(item.url, item.isExisting || false)}
                    alt={`Media ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeMedia(index)}
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs text-center rounded-b-lg">
                    Click X to remove
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            onClick={() => router.push('/vendor/services')}
            variant="outline"
            className="px-6 py-3 text-black"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Saving...' : 'Save Service'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
