'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LoginSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoginSelectModal: React.FC<LoginSelectModalProps> = ({ open, onOpenChange }) => {
  const router = useRouter();

  const handleSelect = (type: 'vendor' | 'couple') => {
    onOpenChange(false);
    if (type === 'vendor') router.push('/vendor/login');
    else router.push('/user/login');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] text-center">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">Login As</DialogTitle>
          <DialogDescription className="text-gray-500 mt-2">
            Please choose how you’d like to log in.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-6">
          <Button
            className="bg-gold text-white text-lg py-4 rounded-lg shadow-md transition-all duration-300 hover:bg-white hover:text-gold hover:scale-105 hover:shadow-lg"
            onClick={() => handleSelect('vendor')}
          >
            Vendor
          </Button>
          <Button
            className="bg-white text-gold border border-gold text-lg py-4 rounded-lg shadow-md transition-all duration-300 hover:bg-gold hover:text-white hover:scale-105 hover:shadow-lg"
            onClick={() => handleSelect('couple')}
          >
            Couple
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginSelectModal;
