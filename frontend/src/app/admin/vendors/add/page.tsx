'use client';

import React, { useEffect } from 'react';
import { VendorForm } from '../components/VendorForm';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { setLoading } from '@/store/slices/vendor';
import { PageHeader } from '@/components/ui/pageHeader';

const AddVendor = () => {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(setLoading(false));
  }, [dispatch]);

  const defaultValues = {
    name: '',
    email: '',
    password: '',
    contactNo: '',
    countryCode: '+91',
    serviceTypes: '',
    minimumAmount: 0,
    maximumAmount: 0,
    isActive: true,
    teams: [],
  };
  return (
    <div className="relative max-w-5xl mx-auto flex flex-col gap-4">
      {/* Header */}
      <PageHeader title="Add New Vendor" />
      {/* Vendor Form */}
      <VendorForm type="add" defaultValues={defaultValues} />
    </div>
  );
};

export default AddVendor;
