'use client';

import { useParams, useRouter } from 'next/navigation';
import { useGetProposalById } from '@/services/api/proposal';
import { formatINR, applyTemplateVariables } from '@/lib/format';
import { useMemo, useState, useRef } from 'react';
import {
  ArrowLeft,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Edit,
  Copy,
  Check,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import Image from 'next/image';

export default function ProposalPreviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const proposalId = params?.id || '';
  const documentRef = useRef<HTMLDivElement>(null);

  // State for UI controls
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Email form state
  const [emailForm, setEmailForm] = useState({
    to: '',
    cc: '',
    subject: '',
    message: '',
    attachPdf: true,
  });

  const { data: proposalResponse, isLoading, error } = useGetProposalById(proposalId);
  const proposal = proposalResponse;

  const templateVars: Record<string, string> = useMemo(() => {
    return {
      couple_names: proposal?.clientName ?? '',
      wedding_date: proposal?.dateISO ?? '',
      client_name: proposal?.clientName ?? '',
      company_name: proposal?.companyName ?? '',
      reference: proposal?.reference ?? '',
    };
  }, [proposal]);

  // Initialize email form when proposal loads
  useMemo(() => {
    if (proposal) {
      setEmailForm({
        to: proposal.clientEmail || '',
        cc: '',
        subject: `Wedding Proposal - ${proposal.title} | ${proposal.reference}`,
        message: `Dear ${proposal.clientName},\n\nWe are delighted to present our wedding proposal for your special day. Please find attached our comprehensive proposal that outlines all the services and arrangements we can provide.\n\nWe look forward to being a part of your celebration and making it truly memorable.\n\nPlease feel free to reach out if you have any questions or would like to discuss any aspects of the proposal.\n\nWarm regards,\n${proposal.companyName}`,
        attachPdf: true,
      });
    }
  }, [proposal]);

  // Zoom controls
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

  // Handle send email
  const handleSendEmail = async () => {
    // Validate email
    if (!emailForm.to) {
      toast.error('Please enter recipient email');
      return;
    }

    // TODO: Implement actual email sending API
    toast.success('Proposal sent successfully!');
    setShowSendModal(false);
  };

  // Handle share link
  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/proposal/view/${proposalId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Share link copied to clipboard!');
  };

  // Handle PDF download
  const handleDownloadPDF = () => {
    // TODO: Implement actual PDF generation
    window.print();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { icon: Clock, text: 'Draft', className: 'bg-gray-100 text-gray-700' },
      SENT: { icon: Send, text: 'Sent', className: 'bg-blue-100 text-blue-700' },
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
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading proposal...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !proposal) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Proposal not found</p>
          <button
            onClick={() => router.push('/admin/proposals')}
            className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-black"
          >
            Back to Proposals
          </button>
        </div>
      </main>
    );
  }

  // Calculate totals
  const subtotal = proposal.services.reduce(
    (sum, service) => sum + service.price * service.quantity,
    0
  );
  const taxable = Math.max(0, subtotal - proposal.discount);
  const tax = taxable * (proposal.taxesPercent / 100);
  const grandTotal = taxable + tax;

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Action Bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold">Proposal Preview</h1>
              <p className="text-sm text-gray-600">Reference: {proposal.reference}</p>
            </div>
            {getStatusBadge(proposal.status)}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleZoom('out')}
                className="p-1.5 hover:bg-white rounded transition-colors"
                disabled={zoomLevel <= 50}
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <select
                value={zoomLevel}
                onChange={(e) => setZoomLevel(Number(e.target.value))}
                className="px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value={50}>50%</option>
                <option value={75}>75%</option>
                <option value={100}>100%</option>
                <option value={125}>125%</option>
                <option value={150}>150%</option>
                <option value={200}>200%</option>
              </select>
              <button
                onClick={() => handleZoom('in')}
                className="p-1.5 hover:bg-white rounded transition-colors"
                disabled={zoomLevel >= 200}
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleZoom('fit')}
                className="p-1.5 hover:bg-white rounded transition-colors"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>

            <div className="h-8 w-px bg-gray-300" />

            {/* Action Buttons */}
            {proposal.status === 'DRAFT' && (
              <button
                onClick={() => router.push(`/admin/leads/${proposal.leadId}/proposal/create`)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit className="h-4 w-4" />
                Back to Edit
              </button>
            )}

            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Share Link
            </button>

            <button
              onClick={() => setShowSendModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Send className="h-4 w-4" />
              Send to Client
            </button>
          </div>
        </div>
      </header>

      {/* Preview Container */}
      <div className="flex-1 overflow-auto bg-gray-100 p-8">
        <div className="mx-auto" style={{ maxWidth: '850px' }}>
          {/* A4 Document */}
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
            {/* Company Header */}
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
                  />
                )}
              </div>
            </div>

            {/* Proposal Details */}
            <div>
              {/* Date and Client Info */}
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
                  <p className="text-gray-900 font-medium">{proposal.clientName}</p>
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Service
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                          Quantity
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                          Unit Price
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {proposal.services.map((service, index) => (
                        <tr key={service.id || index} className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{service.name}</p>
                              {service.description && (
                                <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                              )}
                            </div>
                          </td>
                          <td className="text-center py-3 px-4 text-gray-900">
                            {service.quantity}
                          </td>
                          <td className="text-right py-3 px-4 text-gray-900">
                            {formatINR(service.price)}
                          </td>
                          <td className="text-right py-3 px-4 font-medium text-gray-900">
                            {formatINR(service.price * service.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Events Section */}
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

              {/* Pricing Summary */}
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
                    <div className="pt-3 border-t border-gray-300">
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Grand Total</span>
                        <span>{formatINR(grandTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Terms</h4>
                <p className="text-gray-700">{proposal.paymentTerms}</p>
              </div>

              {/* Terms & Conditions */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h4>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700 whitespace-pre-line">
                    {applyTemplateVariables(proposal.termsText, templateVars)}
                  </p>
                </div>
              </div>

              {/* Status Timeline */}
              {(proposal.sentAt ||
                proposal.viewedAt ||
                proposal.acceptedAt ||
                proposal.rejectedAt) && (
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h4>
                  <div className="space-y-2">
                    {proposal.sentAt && (
                      <div className="flex items-center gap-3 text-sm">
                        <Send className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-600">
                          Sent on {new Date(proposal.sentAt).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                    {proposal.viewedAt && (
                      <div className="flex items-center gap-3 text-sm">
                        <Eye className="h-4 w-4 text-yellow-600" />
                        <span className="text-gray-600">
                          Viewed on {new Date(proposal.viewedAt).toLocaleString('en-IN')}
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
      </div>

      {/* Send Email Modal */}
      <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Proposal to Client</DialogTitle>
            <DialogDescription>
              Send this proposal via email to your client with a personalized message.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="to">To *</Label>
              <Input
                id="to"
                type="email"
                placeholder="client@example.com"
                value={emailForm.to}
                onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cc">CC (Optional)</Label>
              <Input
                id="cc"
                type="email"
                placeholder="additional@example.com"
                value={emailForm.cc}
                onChange={(e) => setEmailForm({ ...emailForm, cc: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                type="text"
                value={emailForm.subject}
                onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={8}
                value={emailForm.message}
                onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                className="resize-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="attachPdf"
                checked={emailForm.attachPdf}
                onCheckedChange={(checked) =>
                  setEmailForm({ ...emailForm, attachPdf: checked as boolean })
                }
              />
              <Label htmlFor="attachPdf" className="cursor-pointer">
                Attach proposal as PDF
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} className="bg-teal-600 hover:bg-teal-700">
              <Send className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Link Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Proposal Link</DialogTitle>
            <DialogDescription>
              Share this link with your client to allow them to view the proposal online.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={`${window.location.origin}/proposal/view/${proposalId}`}
                readOnly
                className="flex-1"
              />
              <Button onClick={handleShareLink} variant="outline" className="px-3">
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              This link will be valid for 30 days and allows view-only access to the proposal.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
