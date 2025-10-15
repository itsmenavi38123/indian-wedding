'use client';
import React from 'react';
import VendorForm from '@/app/(components)/vendors/components/VendorForm';
import { PageHeader } from '@/components/ui/pageHeader';

const AddTeam = () => {
  return (
    <div className="min-h-screen bg-black  py-8">
      <div className="container mx-auto px-4">
        <PageHeader title="Add Team" />
        <VendorForm />
      </div>
    </div>
  );
};

export default AddTeam;
