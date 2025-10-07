'use client';

import { useId } from 'react';

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export function TermsSection({ value, onChange }: Props) {
  const id = useId();
  return (
    <section aria-labelledby="terms-heading" className="w-full">
      <h2 id="terms-heading" className="text-lg font-semibold">
        Terms & Conditions
      </h2>
      <div className="mt-2">
        <label htmlFor={id} className="sr-only">
          Terms & Conditions
        </label>
        <textarea
          id={id}
          rows={6}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full rounded border border-gray-300 px-3 py-2 text-sm leading-relaxed"
          placeholder="Add terms here..."
        />
      </div>
    </section>
  );
}
