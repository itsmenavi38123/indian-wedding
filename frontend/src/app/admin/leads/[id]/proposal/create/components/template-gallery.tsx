'use client';

import { cn } from '@/lib/utils';
import {
  ProposalTemplate,
  useGetAllTemplates,
  useSeedTemplates,
} from '@/services/api/proposalTemplate';
import Image from 'next/image';

type Props = {
  value: string;
  onChange: (template: ProposalTemplate) => void;
};

function thumbnailFor(templateId: string) {
  switch (templateId) {
    case 'classic':
      return '/classic-elegant-proposal.png';
    case 'modern':
      return '/modern-minimal-proposal.png';
    case 'traditional':
      return '/traditional-indian-proposal.png';
    case 'scratch':
      return '/blank-template.png';
    default:
      return '/custom-template.png';
  }
}

export function TemplateGallery({ value, onChange }: Props) {
  const { data: templates = [], isLoading, error } = useGetAllTemplates();
  const seedMutation = useSeedTemplates();

  if (isLoading) {
    return <div className="text-center py-4">Loading templates...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4">
        {/* <p className="text-red-600">{error}</p> */}
        <button
          type="button"
          onClick={() => seedMutation.mutate()}
          disabled={seedMutation.isPending}
          className="mt-2 text-sm text-teal-600 hover:text-teal-700 disabled:opacity-50"
        >
          {seedMutation.isPending ? 'Initializing...' : 'Initialize default templates'}
        </button>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600">No templates available</p>
        <button
          type="button"
          onClick={() => seedMutation.mutate()}
          disabled={seedMutation.isPending}
          className="mt-2 text-sm text-teal-600 hover:text-teal-700 disabled:opacity-50"
        >
          {seedMutation.isPending ? 'Initializing...' : 'Initialize default templates'}
        </button>
      </div>
    );
  }

  return (
    <section aria-labelledby="template-heading" className="w-full">
      <div className="flex items-baseline justify-between">
        <h2 id="template-heading" className="text-lg font-semibold text-balance">
          Select a template
        </h2>
      </div>
      <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {templates.map((template) => {
          const selected = value === template.templateId;
          return (
            <li key={template.id}>
              <button
                type="button"
                onClick={() => onChange(template)}
                className={cn(
                  'w-full rounded-md border p-3 text-left transition-colors',
                  'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500',
                  selected ? 'border-teal-600 bg-teal-50' : 'border-gray-200 bg-white'
                )}
                aria-pressed={selected}
                aria-label={`Select ${template.name} template`}
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={thumbnailFor(template.templateId) || '/placeholder.svg'}
                    alt={`${template.name} thumbnail`}
                    className="h-16 w-16 rounded object-cover"
                  />
                  <div className="min-w-0">
                    <p className="font-medium">{template.name}</p>
                    <p className="text-sm text-gray-600">{template.description}</p>
                    {!template.isSystem && <span className="text-xs text-teal-600">Custom</span>}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
