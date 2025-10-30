'use client';

import Image from 'next/image';
import { applyTemplateVariables, formatINR } from '@/lib/format';
import { getTemplateStyle } from '@/utils/templateStyles';
import { Send, Eye, CheckCircle, XCircle } from 'lucide-react';

export default function ProposalDocument({ proposal, zoomLevel = 100 }: any) {
  if (!proposal) return null;

  const style = getTemplateStyle(proposal?.template);

  const templateVars = {
    couple_names: proposal?.clientName ?? '',
    wedding_date: proposal?.dateISO ?? '',
    client_name: proposal?.clientName ?? '',
    company_name: proposal?.companyName ?? '',
    reference: proposal?.reference ?? '',
  };

  // Totals
  const subtotal = proposal.services.reduce((sum: number, s: any) => sum + s.price * s.quantity, 0);
  const taxable = Math.max(0, subtotal - (proposal.discount || 0));
  const tax = taxable * ((proposal.taxesPercent || 0) / 100);
  const grandTotal = taxable + tax;
  const services = proposal?.services || [];

  // Vendors
  const acceptedVendors = services.reduce((acc: any, s: any) => {
    const vendor = s.vendor;
    const category = s.category || s.name || 'Other';
    if (s.status === 'ACCEPTED' && vendor) acc.push({ category, vendor });
    return acc;
  }, []);

  const adminAssignedVendors = services.reduce((acc: any, s: any) => {
    const vendor = s.vendor;
    const category = s.category || s.name || 'Other';
    if (s.status === 'ASSIGNED' && vendor) acc.push({ category, vendor });
    return acc;
  }, []);
  const vendorsToShow = acceptedVendors.length > 0 ? acceptedVendors : adminAssignedVendors;
  return (
    <div className={`${style.background} ${style.font}`}>
      <div className="mx-auto" style={{ maxWidth: '850px' }}>
        <div
          id="document"
          className={`shadow-lg mx-auto ${style.background} ${style.font}`}
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '20mm',
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease-in-out',
          }}
        >
          {/* Header */}
          <div className={`p-6 ${style.header}`}>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{proposal.companyName}</h1>
                <p className={`${style.accent}`}>{proposal.title}</p>
              </div>
              {proposal.logoUrl && (
                <Image
                  src={proposal.logoUrl}
                  alt={`${proposal.companyName} logo`}
                  className="h-16 w-auto object-contain"
                  width={200}
                  height={64}
                />
              )}
            </div>
          </div>

          <div className={`my-6 ${style.divider}`} />

          {/* Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Proposal Date
              </h4>
              <p className="text-gray-900">
                {new Date(proposal.dateISO).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Client Details
              </h4>
              <p className={`${style.accent}`}>{proposal.clientName}</p>
              {proposal.clientEmail && (
                <p className="text-gray-600 text-sm">{proposal.clientEmail}</p>
              )}
              {proposal.clientPhone && (
                <p className="text-gray-600 text-sm">{proposal.clientPhone}</p>
              )}
              {proposal.clientAddress && (
                <p className="text-gray-600 text-sm">{proposal.clientAddress}</p>
              )}
            </div>
          </div>

          {/* Introduction */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Introduction</h4>
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{
                __html: applyTemplateVariables(proposal.introHTML, templateVars),
              }}
            />
          </div>

          {/* Services */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Services Included</h4>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Service
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Qty</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Unit Price
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {proposal.services.map((s: any, i: number) => (
                  <tr key={s.id || i} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{s.name}</p>
                      {s.description && (
                        <p className="text-sm text-gray-600 mt-1">{s.description}</p>
                      )}
                    </td>
                    <td className="text-center py-3 px-4">{s.quantity}</td>
                    <td className="text-right py-3 px-4">{formatINR(s.price)}</td>
                    <td className="text-right py-3 px-4 font-medium">
                      {formatINR(s.price * s.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Events */}
          {proposal.events && Array.isArray(proposal.events) && proposal.events.length > 0 && (
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Events</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Event Name
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        Start Time
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        End Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposal.events.map((event: any, index: number) => (
                      <tr
                        key={index}
                        className="border-t border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="py-3 px-4 text-gray-900 font-medium">{event.name}</td>
                        <td className="text-center py-3 px-4 text-gray-700">
                          {event.dateISO
                            ? new Date(event.dateISO).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '-'}
                        </td>
                        <td className="text-center py-3 px-4 text-gray-700">
                          {event.startTime || '-'}
                        </td>
                        <td className="text-center py-3 px-4 text-gray-700">
                          {event.endTime || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Vendors */}
          {vendorsToShow.length > 0 && (
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Vendors</h3>
              <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Vendor
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Contact
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vendorsToShow.map((v: any, i: number) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-900">{v.category}</td>
                      <td className="py-3 px-4 text-gray-700">{v.vendor?.name || '-'}</td>
                      <td className="py-3 px-4 text-gray-700">{v.vendor?.email || '-'}</td>
                      <td className="py-3 px-4 text-gray-700">{v.vendor?.contactNo || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pricing */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Pricing Summary</h4>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {proposal.discount > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Discount</span>
                    <span className="text-red-600">-{formatINR(proposal.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>GST ({proposal.taxesPercent}%)</span>
                  <span>{formatINR(tax)}</span>
                </div>
                <div className="pt-3 border-t border-gray-300 flex justify-between text-lg font-bold text-gray-900">
                  <span>Grand Total</span>
                  <span>{formatINR(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h4>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 whitespace-pre-line">
                {applyTemplateVariables(proposal.termsText, templateVars)}
              </p>
            </div>
          </div>

          {/* Activity */}
          {(proposal.sentAt || proposal.viewedAt || proposal.acceptedAt || proposal.rejectedAt) && (
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h4>
              <div className="space-y-2 text-sm text-gray-600">
                {proposal.sentAt && (
                  <div className="flex items-center gap-3">
                    <Send className="h-4 w-4 text-blue-600" />
                    Sent on {new Date(proposal.sentAt).toLocaleString('en-IN')}
                  </div>
                )}
                {proposal.viewedAt && (
                  <div className="flex items-center gap-3">
                    <Eye className="h-4 w-4 text-yellow-600" />
                    Viewed on {new Date(proposal.viewedAt).toLocaleString('en-IN')}
                  </div>
                )}
                {proposal.acceptedAt && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Accepted on {new Date(proposal.acceptedAt).toLocaleString('en-IN')}
                  </div>
                )}
                {proposal.rejectedAt && (
                  <div className="flex items-center gap-3">
                    <XCircle className="h-4 w-4 text-red-600" />
                    Rejected on {new Date(proposal.rejectedAt).toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
