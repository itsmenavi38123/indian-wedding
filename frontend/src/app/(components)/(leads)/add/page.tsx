'use client';
import React from 'react';
import LeadForm from '../components/LeadForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const AddLead = () => {
  const router = useRouter();

  return (
    <div className="relative max-w-5xl mx-auto flex flex-col gap-4">
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
          <h1 className="text-2xl font-bold text-center sm:text-left">Add New Lead</h1>
        </div>
        <div className="none sm:block sm:w-10"></div>
      </div>
      <LeadForm />
    </div>
  );
};

export default AddLead;
