'use client';

import type { Service } from './services-section';
import { formatINR, parseNumber, formatINRWithCommas, formatPercentage } from '@/lib/format';
import { useMemo, useEffect } from 'react';

export type PricingLine = {
  id: string;
  label: string;
  unitPrice: number;
  quantity: number;
};

type Props = {
  services: Service[];
  taxesPercent: number; // e.g., 18
  discount: number; // absolute amount
  paymentTerms: string;
  onChange: (patch: Partial<Omit<Props, 'onChange'>>) => void;
};

export function PricingTable({ services, taxesPercent, discount, paymentTerms, onChange }: Props) {
  const syncedLines = useMemo(() => {
    // Convert services directly to pricing lines
    return services.map((s) => ({
      id: s.id,
      label: s.name,
      unitPrice: s.price,
      quantity: 1,
    }));
  }, [services]);

  const amounts = useMemo(() => {
    const subtotal = syncedLines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
    const taxable = Math.max(0, subtotal - discount);
    const tax = taxable * (taxesPercent / 100);
    const total = Math.max(0, taxable + tax);
    return { subtotal, tax, total, taxable };
  }, [syncedLines, taxesPercent, discount]);

  // Auto-calculate totals whenever inputs change
  useEffect(() => {}, [amounts]);

  function editService(id: string, patch: Partial<Pick<Service, 'price'>>) {
    const nextServices = services.map((s) => (s.id === id ? { ...s, ...patch } : s));
    // Call onChange to update services in parent
    onChange({ services: nextServices });
  }

  // Services cannot be removed from pricing table
  // They should be removed from the services section

  return (
    <section aria-labelledby="pricing-heading" className="w-full">
      <div className="flex items-center justify-between">
        <h2 id="pricing-heading" className="text-lg font-semibold">
          Pricing
        </h2>
        {/* Custom lines removed - only services are shown */}
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="whitespace-nowrap border-b p-2 text-left font-medium">Service</th>
              <th className="whitespace-nowrap border-b p-2 text-right font-medium">Unit Price</th>
              <th className="whitespace-nowrap border-b p-2 text-right font-medium">Qty</th>
              <th className="whitespace-nowrap border-b p-2 text-right font-medium">Amount</th>
              <th className="whitespace-nowrap border-b p-2"></th>
            </tr>
          </thead>
          <tbody>
            {syncedLines.map((l) => {
              const amt = l.unitPrice * l.quantity;
              const isCustom = !services.find((s) => s.id === l.id);
              return (
                <tr key={l.id}>
                  <td className="border-b p-2">
                    <div className="font-medium">{l.label}</div>
                  </td>
                  <td className="border-b p-2 text-right">
                    <input
                      value={l.unitPrice.toString()}
                      onChange={(e) => editService(l.id, { price: parseNumber(e.target.value) })}
                      className="w-28 rounded border border-gray-300 px-2 py-1 text-right"
                      inputMode="decimal"
                      aria-label="Unit price"
                      onBlur={(e) => {
                        // Format on blur for better UX
                        const val = parseNumber(e.target.value);
                        editService(l.id, { price: val });
                      }}
                    />
                    <div className="text-xs text-gray-600">{formatINR(l.unitPrice)}</div>
                  </td>
                  <td className="border-b p-2 text-right">
                    <div className="text-center">1</div>
                  </td>
                  <td className="border-b p-2 text-right">{formatINR(amt)}</td>
                  <td className="border-b p-2 text-right">
                    <div className="text-xs text-gray-500">Service</div>
                  </td>
                </tr>
              );
            })}
            {syncedLines.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-600">
                  No items yet. Add services or a custom line.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td className="p-2 text-right font-medium" colSpan={3}>
                Subtotal
              </td>
              <td className="p-2 text-right" colSpan={2}>
                {formatINR(amounts.subtotal)}
              </td>
            </tr>
            <tr>
              <td className="p-2 text-right font-medium" colSpan={3}>
                Discount
              </td>
              <td className="p-2 text-right" colSpan={2}>
                <input
                  value={discount.toString()}
                  onChange={(e) => onChange({ discount: Math.max(0, parseNumber(e.target.value)) })}
                  className="w-28 rounded border border-gray-300 px-2 py-1 text-right"
                  inputMode="decimal"
                  aria-label="Discount amount"
                />
              </td>
            </tr>
            <tr>
              <td className="p-2 text-right font-medium" colSpan={3}>
                <div className="flex items-center justify-end gap-2">
                  <span>Taxes (GST</span>
                  <input
                    value={taxesPercent.toString()}
                    onChange={(e) =>
                      onChange({
                        taxesPercent: Math.min(100, Math.max(0, parseNumber(e.target.value))),
                      })
                    }
                    className="w-16 rounded border border-gray-300 px-2 py-1 text-right"
                    inputMode="decimal"
                    aria-label="Tax percentage"
                  />
                  <span>%)</span>
                </div>
              </td>
              <td className="p-2 text-right" colSpan={2}>
                {formatINR(amounts.tax)}
                <div className="text-xs text-gray-600">on {formatINR(amounts.taxable)}</div>
              </td>
            </tr>
            <tr className="bg-amber-50">
              <td className="p-2 text-right font-semibold" colSpan={3}>
                Grand Total
              </td>
              <td className="p-2 text-right font-semibold" colSpan={2}>
                {formatINR(amounts.total)}
              </td>
            </tr>
            <tr>
              <td className="p-2 text-right font-medium" colSpan={3}>
                Payment Terms
              </td>
              <td className="p-2 text-right" colSpan={2}>
                <select
                  value={paymentTerms}
                  onChange={(e) => onChange({ paymentTerms: e.target.value })}
                  className="w-full rounded border border-gray-300 px-2 py-1"
                  aria-label="Payment terms"
                >
                  <option>50% to book, 50% before event</option>
                  <option>50/30/20 (book/mid/delivery)</option>
                  <option>Net 7</option>
                  <option>Net 15</option>
                  <option>Net 30</option>
                </select>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
