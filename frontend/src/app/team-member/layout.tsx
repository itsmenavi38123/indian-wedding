import React from 'react';
import ClientAuthLoader from './components/ClientAuthLoader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClientAuthLoader />
      {children}
    </>
  );
}
