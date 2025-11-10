'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Edit3, Plus } from 'lucide-react';
import Image from 'next/image';
import { getAllContractTemplates, useGenerateContractPdf } from '@/services/api/contractTemplate';

export default function ContractPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const { data: templates, isLoading: isTemplatesLoading } = useQuery({
    queryKey: ['contractTemplates'],
    queryFn: getAllContractTemplates,
  });
  const { data: pdfUrl, isLoading: isPdfLoading } = useGenerateContractPdf({
    templateId: selectedTemplate || '',
  });

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${selectedTemplate}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePreviewAndSign = () => {
    if (!selectedTemplate) return;
    router.push(`/admin/contracts/create/${selectedTemplate}/preview`);
  };

  const handleCreateNewTemplate = () => {
    router.push('/admin/contracts/create/new');
  };

  if (isTemplatesLoading) {
    return (
      <div className="flex justify-center items-center h-96 text-white">
        <Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading templates...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10 text-white">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Choose Your Contract Template</h1>
          <p className="text-gray-400 text-sm">
            Select a style below to preview and download the generated PDF.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleCreateNewTemplate}
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create New Template
          </Button>

          <Button
            onClick={handleDownload}
            disabled={!pdfUrl || isPdfLoading}
            className="bg-gold-600 hover:bg-gold-700 flex items-center gap-2"
          >
            {isPdfLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Download PDF
              </>
            )}
          </Button>

          <Button
            onClick={handlePreviewAndSign}
            disabled={!selectedTemplate}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" /> Preview & Sign
          </Button>
        </div>
      </div>

      {/* Template Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {templates?.map((t: any) => (
          <Card
            key={t.templateId}
            onClick={() => setSelectedTemplate(t.templateId)}
            className={`cursor-pointer transition-all border-2 ${
              selectedTemplate === t.templateId
                ? 'border-gold-500 shadow-lg scale-105'
                : 'border-transparent hover:border-gold-400 hover:scale-[1.02]'
            } bg-gray-900`}
          >
            <div className="relative w-full h-40">
              {t.preview ? (
                <Image
                  src={t.preview}
                  alt={t.name}
                  fill
                  className="object-cover rounded-t-lg opacity-90"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400">
                  No Preview
                </div>
              )}
            </div>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">{t.name}</CardTitle>
              <p className="text-sm text-gray-400">{t.description}</p>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
