'use client';

import { useParams, useRouter } from 'next/navigation';
import { useGetProposalById, useSendProposalEmail } from '@/services/api/proposal';
import { useMemo, useState } from 'react';
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
import ProposalDocument from '@/components/proposals/ProposalDocument';

export default function ProposalPreviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const proposalId = params?.id || '';
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
  const sendProposalEmailMutation = useSendProposalEmail();

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
  // const handleSendEmail = async () => {
  //   if (!emailForm.to) {
  //     toast.error('Please enter recipient email');
  //     return;
  //   }
  //   toast.success('Proposal sent successfully!');
  //   setShowSendModal(false);
  // };

  const handleSendEmail = async () => {
    if (!emailForm.to) {
      toast.error('Please enter recipient email');
      return;
    }

    try {
      await sendProposalEmailMutation.mutateAsync({
        proposalId,
        to: emailForm.to,
        cc: emailForm.cc,
        subject: emailForm.subject,
        message: emailForm.message,
      });

      toast.success('Proposal sent successfully!');
      setShowSendModal(false);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send proposal email');
    }
  };

  // Handle share link
  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/admin/proposals/${proposalId}/preview`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Share link copied to clipboard!');
  };

  // Handle PDF download
  const handleDownloadPDF = () => {
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
            <p className="text-gray-600">Loading proposal......</p>
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
      <ProposalDocument proposal={proposal} zoomLevel={zoomLevel} />

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
              {sendProposalEmailMutation.isPending ? 'Sending...' : 'Send Email'}
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
                value={`${window.location.origin}/admin/proposals/${proposalId}/preview`}
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
