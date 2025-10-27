'use client';
import React from 'react';
import { PageHeader } from '@/components/ui/pageHeader';
import AdminFormPage from '../_components/AdminForm';

const AddTeam = () => {
  return (
    <div className="min-h-screen bg-black  py-8">
      <div className="container mx-auto px-4">
        <PageHeader title="Add Team" />
        <AdminFormPage />
      </div>
    </div>
  );
};

export default AddTeam;
