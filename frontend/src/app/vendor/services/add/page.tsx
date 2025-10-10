'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { setLoading } from '@/store/slices/vendor';
import { VendorServiceForm } from '../components/VendorFormService';

const AddVendor = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  // const { loading } = useSelector((state: RootState) => state.vendor);

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
          <h1 className="text-2xl font-bold text-center sm:text-left">Add New Vendor</h1>
        </div>
        <div className="none sm:block sm:w-10"></div>
      </div>

      {/* Vendor Form */}
      <VendorServiceForm type="add" defaultValues={defaultValues} />
    </div>
  );
};

export default AddVendor;
