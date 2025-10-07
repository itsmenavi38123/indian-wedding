import React from 'react';

export default function PipelineLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full ">
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </div>
  );
}
