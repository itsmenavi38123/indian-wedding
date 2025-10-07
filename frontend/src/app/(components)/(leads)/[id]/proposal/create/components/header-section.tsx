'use client';

import { useId } from 'react';

export type ClientDetails = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
};

type Props = {
  companyName: string;
  logoUrl?: string;
  title: string;
  dateISO: string;
  reference: string;
  client: ClientDetails;
  onChange: (patch: Partial<Props>) => void;
};

export function HeaderSection(props: Props) {
  const ids = {
    company: useId(),
    title: useId(),
    date: useId(),
    ref: useId(),
    clientName: useId(),
    clientEmail: useId(),
    clientPhone: useId(),
    clientAddr: useId(),
    logoUrl: useId(),
  };

  return (
    <section aria-labelledby="header-heading" className="w-full">
      <h2 id="header-heading" className="text-lg font-semibold text-balance">
        Header
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <label htmlFor={ids.company} className="text-sm text-gray-700">
              Company name
            </label>
            <input
              id={ids.company}
              value={props.companyName}
              onChange={(e) => props.onChange({ companyName: e.target.value })}
              className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
              placeholder="Company Pvt Ltd"
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor={ids.logoUrl} className="text-sm text-gray-700">
              Logo URL (optional)
            </label>
            <input
              id={ids.logoUrl}
              value={props.logoUrl || ''}
              onChange={(e) => props.onChange({ logoUrl: e.target.value })}
              className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="grid gap-1">
            <label htmlFor={ids.title} className="text-sm text-gray-700">
              Proposal title
            </label>
            <input
              id={ids.title}
              value={props.title}
              onChange={(e) => props.onChange({ title: e.target.value })}
              className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
              placeholder="Wedding Photography Proposal"
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor={ids.date} className="text-sm text-gray-700">
              Date
            </label>
            <input
              id={ids.date}
              type="date"
              value={props.dateISO}
              onChange={(e) => props.onChange({ dateISO: e.target.value })}
              className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor={ids.ref} className="text-sm text-gray-700">
              Reference #
            </label>
            <input
              id={ids.ref}
              value={props.reference}
              onChange={(e) => props.onChange({ reference: e.target.value })}
              className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
              placeholder="PRO-2025-001"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <p className="text-sm font-medium">Client details</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-1">
              <label htmlFor={ids.clientName} className="text-sm text-gray-700">
                Name
              </label>
              <input
                id={ids.clientName}
                value={props.client.name}
                onChange={(e) =>
                  props.onChange({ client: { ...props.client, name: e.target.value } })
                }
                className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                placeholder="A & B"
              />
            </div>
            <div className="grid gap-1">
              <label htmlFor={ids.clientEmail} className="text-sm text-gray-700">
                Email
              </label>
              <input
                id={ids.clientEmail}
                type="email"
                value={props.client.email || ''}
                onChange={(e) =>
                  props.onChange({ client: { ...props.client, email: e.target.value } })
                }
                className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                placeholder="client@example.com"
              />
            </div>
            <div className="grid gap-1">
              <label htmlFor={ids.clientPhone} className="text-sm text-gray-700">
                Phone
              </label>
              <input
                id={ids.clientPhone}
                value={props.client.phone || ''}
                onChange={(e) =>
                  props.onChange({ client: { ...props.client, phone: e.target.value } })
                }
                className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="grid gap-1 sm:col-span-2">
              <label htmlFor={ids.clientAddr} className="text-sm text-gray-700">
                Address
              </label>
              <textarea
                id={ids.clientAddr}
                rows={2}
                value={props.client.address || ''}
                onChange={(e) =>
                  props.onChange({ client: { ...props.client, address: e.target.value } })
                }
                className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                placeholder="Street, City, PIN"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
