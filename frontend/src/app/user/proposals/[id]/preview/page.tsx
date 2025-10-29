'use client';

import { useParams, useRouter } from 'next/navigation';
import { useGetProposalById, useUpdateProposalStatus } from '@/services/api/proposal';
import { formatINR, applyTemplateVariables } from '@/lib/format';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Send,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function UserProposalPreview() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const proposalId = params?.id || '';
  const documentRef = useRef<HTMLDivElement>(null);

  const [zoomLevel, setZoomLevel] = useState(100);

  const { data: proposalResponse, isLoading, error } = useGetProposalById(proposalId);
  const proposal = proposalResponse;

  const { mutate: updateProposalStatus } = useUpdateProposalStatus();

  useEffect(() => {
    if (proposalId && proposal?.status === 'SENT') {
      updateProposalStatus({ proposalId, viewerRole: 'user', action: 'view' });
    }
  }, [proposalId, proposal?.status, updateProposalStatus]);

  const handleAccept = () => {
    updateProposalStatus({ proposalId, viewerRole: 'user', action: 'accept' });
  };

  const handleReject = () => {
    updateProposalStatus({ proposalId, viewerRole: 'user', action: 'reject' });
  };

  const templateVars: Record<string, string> = useMemo(() => {
    return {
      couple_names: proposal?.clientName ?? '',
      wedding_date: proposal?.dateISO ?? '',
      client_name: proposal?.clientName ?? '',
      company_name: proposal?.companyName ?? '',
      reference: proposal?.reference ?? '',
    };
  }, [proposal]);

  // Zoom Controls
  const handleZoom = (action: 'in' | 'out' | 'reset' | 'fit') => {
    switch (action) {
      case 'in':
        setZoomLevel((prev) => Math.min(prev + 25, 200));
        break;
      case 'out':
        setZoomLevel((prev) => Math.max(prev - 25, 50));
        break;
      case 'reset':
        setZoomLevel(100);
        break;
      case 'fit':
        setZoomLevel(75);
        break;
    }
  };

  const handleDownloadPDF = () => window.print();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { icon: Clock, text: 'Draft', className: 'bg-gray-100 text-gray-700' },
      SENT: { icon: Eye, text: 'Sent', className: 'bg-blue-100 text-blue-700' },
      VIEWED: { icon: Eye, text: 'Viewed', className: 'bg-yellow-100 text-yellow-700' },
      ACCEPTED: { icon: CheckCircle, text: 'Accepted', className: 'bg-green-100 text-green-700' },
      REJECTED: { icon: XCircle, text: 'Rejected', className: 'bg-red-100 text-red-700' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    const Icon = config.icon;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.className}`}
      >
        <Icon className="h-4 w-4" />
        {config.text}
      </span>
    );
  };

  if (isLoading) {
    return (
      <main className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading proposal...</p>
      </main>
    );
  }

  if (error || !proposal) {
    return (
      <main className="flex items-center justify-center h-screen flex-col gap-4">
        <p className="text-red-600">Proposal not found</p>
        <Button onClick={() => router.push('/user/dashboard')}>Back to Dashboard</Button>
      </main>
    );
  }

  const subtotal = proposal.services.reduce(
    (sum, service) => sum + service.price * service.quantity,
    0
  );
  const taxable = Math.max(0, subtotal - proposal.discount);
  const tax = taxable * (proposal.taxesPercent / 100);
  const grandTotal = taxable + tax;

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">Proposal Preview</h1>
            <p className="text-sm text-gray-600">{proposal.reference}</p>
          </div>
          {getStatusBadge(proposal.status)}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleZoom('out')}
              className="p-1.5 hover:bg-white rounded"
              disabled={zoomLevel <= 50}
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <select
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              className="px-2 py-1 rounded text-sm focus:outline-none"
            >
              <option value={50}>50%</option>
              <option value={75}>75%</option>
              <option value={100}>100%</option>
              <option value={125}>125%</option>
              <option value={150}>150%</option>
            </select>
            <button
              onClick={() => handleZoom('in')}
              className="p-1.5 hover:bg-white rounded"
              disabled={zoomLevel >= 200}
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button onClick={() => handleZoom('fit')} className="p-1.5 hover:bg-white rounded">
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>

          <Button onClick={handleDownloadPDF} variant="outline" className="ml-2">
            <Download className="h-4 w-4 mr-2" /> Download PDF
          </Button>

          {proposal.status !== 'ACCEPTED' && proposal.status !== 'REJECTED' && (
            <div className="flex gap-3 ml-auto">
              <Button
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                onClick={handleAccept}
              >
                Accept
              </Button>

              <Button
                variant="destructive"
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
                onClick={handleReject}
              >
                Decline
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Document */}
      <div className="flex-1 overflow-auto bg-gray-100 p-8">
        <div className="mx-auto" style={{ maxWidth: '850px' }}>
          <div
            id="document"
            ref={documentRef}
            className="bg-white shadow-lg mx-auto"
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
            <div className="-mx-8 -mt-8 mb-8 px-8 py-6 bg-gradient-to-r from-teal-50 to-blue-50 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{proposal.companyName}</h2>
                  <h3 className="text-xl text-gray-700 mt-2">{proposal.title}</h3>
                </div>
                {proposal.logoUrl && (
                  <Image
                    src={proposal.logoUrl}
                    alt={`${proposal.companyName} logo`}
                    className="h-16 w-auto object-contain"
                    width={64}
                    height={64}
                  />
                )}
              </div>
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">
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
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Client Details
                </h4>
                <p className="text-gray-900 font-medium">{proposal.clientName}</p>
                {proposal.clientEmail && (
                  <p className="text-gray-600 text-sm">{proposal.clientEmail}</p>
                )}
              </div>
            </div>

            {/* Intro */}
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
                    <th className="text-left py-2 px-4 text-sm text-gray-700">Service</th>
                    <th className="text-center py-2 px-4 text-sm text-gray-700">Qty</th>
                    <th className="text-right py-2 px-4 text-sm text-gray-700">Price</th>
                    <th className="text-right py-2 px-4 text-sm text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {proposal.services.map((s: any, i: number) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2 px-4">{s.name}</td>
                      <td className="text-center py-2 px-4">{s.quantity}</td>
                      <td className="text-right py-2 px-4">{formatINR(s.price)}</td>
                      <td className="text-right py-2 px-4">{formatINR(s.price * s.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Events */}
            {Array.isArray(proposal.events) && proposal.events.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Events</h4>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-4 text-sm text-gray-700">Event Name</th>
                      <th className="text-left py-2 px-4 text-sm text-gray-700">Date</th>
                      <th className="text-center py-2 px-4 text-sm text-gray-700">Start Time</th>
                      <th className="text-center py-2 px-4 text-sm text-gray-700">End Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(proposal.events as any[]).map((event, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-2 px-4">{event.name}</td>
                        <td className="py-2 px-4">
                          {event.dateISO
                            ? new Date(event.dateISO).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '-'}
                        </td>
                        <td className="text-center py-2 px-4">{event.startTime || '-'}</td>
                        <td className="text-center py-2 px-4">{event.endTime || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totals */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {proposal.discount > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Discount</span>
                    <span>-{formatINR(proposal.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>GST ({proposal.taxesPercent}%)</span>
                  <span>{formatINR(tax)}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatINR(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h4>
              <p className="text-gray-700 whitespace-pre-line">
                {applyTemplateVariables(proposal.termsText, templateVars)}
              </p>
            </div>

            {/* Status Timeline */}
            {(proposal.sentAt || proposal.acceptedAt || proposal.rejectedAt) && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h4>
                <div className="space-y-2">
                  {proposal.sentAt && (
                    <div className="flex items-center gap-3 text-sm">
                      <Send className="h-4 w-4 text-blue-600" />
                      <span className="text-gray-600">
                        Received on {new Date(proposal.sentAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  {proposal.acceptedAt && (
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-600">
                        Accepted on {new Date(proposal.acceptedAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  {proposal.rejectedAt && (
                    <div className="flex items-center gap-3 text-sm">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-gray-600">
                        Rejected on {new Date(proposal.rejectedAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #document,
          #document * {
            visibility: visible;
          }
          #document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          header {
            display: none !important;
          }
          .bg-gradient-to-r {
            background: #f0f9ff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
