import React from 'react';

export default function PlanningLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {' '}
      <div className="mt-9">{children}</div>
    </>
  );
}
