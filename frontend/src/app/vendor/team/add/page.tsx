'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import VendorForm from '@/app/(components)/vendors/components/VendorForm';

const AddTeam = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-black  py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-0 mb-6">
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
                        <h1 className="text-2xl font-bold text-center sm:text-left">Add Team</h1>
                    </div>
                    <div className="none sm:block sm:w-10"></div>
                </div>
                <VendorForm />
            </div>
        </div>
    );

};

export default AddTeam;