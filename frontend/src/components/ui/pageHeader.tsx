'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  showBackButton = true,
  className = '',
}) => {
  const router = useRouter();

  return (
    <div
      className={`flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-0 mb-6 ${className}`}
    >
      {/* Back Button (optional) */}
      <div className="flex w-full sm:w-10 justify-start">
        {showBackButton && (
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center cursor-pointer bg-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        )}
      </div>

      {/* Title */}
      <div className="flex items-center justify-center w-full sm:w-auto">
        <h1 className="text-2xl font-bold text-center sm:text-left text-white">{title}</h1>
      </div>

      {/* Spacer for symmetry */}
      <div className="none sm:block sm:w-10"></div>
    </div>
  );
};
