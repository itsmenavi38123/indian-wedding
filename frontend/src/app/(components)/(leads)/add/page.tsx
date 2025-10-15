'use client';
import React from 'react';
import LeadForm from '../components/LeadForm';
import { PageHeader } from '@/components/ui/pageHeader';

const AddLead = () => {
  return (
    <div className="relative max-w-5xl mx-auto flex flex-col gap-4">
      <PageHeader title="Add New Lead" />
      <LeadForm />
    </div>
  );
};

export default AddLead;
