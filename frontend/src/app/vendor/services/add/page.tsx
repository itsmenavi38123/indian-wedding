'use client';

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { setLoading } from '@/store/slices/vendor';
import { VendorServiceForm } from '../components/VendorFormService';
import { PageHeader } from '@/components/ui/pageHeader';

const AddVendor = () => {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(setLoading(false));
  }, [dispatch]);

  const defaultValues = {
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
  };
  return (
    <div className="relative max-w-5xl mx-auto flex flex-col gap-4">
      {/* Header */}
      <PageHeader title="Add New Service" />
      {/* Vendor Form */}
      <VendorServiceForm type="add" defaultValues={defaultValues} />
    </div>
  );
};

export default AddVendor;
