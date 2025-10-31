'use client';

import { useParams, useRouter } from 'next/navigation';
import { useGenerateContractPdf } from '@/services/api/contractTemplate';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContractPreviewPage() {
  const params = useParams<{ templateId: string }>();
  const router = useRouter();
  const { templateId } = params;

  const { data: pdfUrl, isLoading } = useGenerateContractPdf({
    templateId,
  });

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${templateId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-semibold capitalize">
            {templateId.replace(/_/g, ' ')} Preview
          </h1>
        </div>

        <Button
          onClick={handleDownload}
          disabled={!pdfUrl || isLoading}
          className="bg-gold-600 hover:bg-gold-700 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" /> Download PDF
            </>
          )}
        </Button>
      </div>

      {/* PDF Preview */}
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin mb-2" />
            Generating PDF for {templateId}...
          </div>
        ) : pdfUrl ? (
          <iframe src={pdfUrl} className="w-full h-[85vh] border-none rounded-lg"></iframe>
        ) : (
          <p className="text-center text-gray-400 py-10">Failed to load contract preview.</p>
        )}
      </div>
    </div>
  );
}
