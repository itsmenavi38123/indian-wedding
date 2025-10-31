'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Download } from 'lucide-react';
import { useGenerateContractPdf } from '@/services/api/contractTemplate';
import Image from 'next/image';

const templates = [
  {
    id: 'wedding_standard_contract',
    name: 'Classic Wedding Contract',
    preview: '/images/contracts/classic.jpg',
    description: 'Elegant and timeless contract for traditional weddings.',
  },
  {
    id: 'modern_wedding_contract',
    name: 'Modern Wedding Contract',
    preview: '/images/contracts/modern.jpg',
    description: 'Clean, minimal, and suitable for contemporary celebrations.',
  },
  {
    id: 'destination_wedding_contract',
    name: 'Destination Wedding Contract',
    preview: '/images/contracts/destination.jpg',
    description: 'Perfect for weddings abroad or at exotic venues.',
  },
  {
    id: 'luxury_wedding_contract',
    name: 'Luxury Wedding Contract',
    preview: '/images/contracts/luxury.jpg',
    description: 'Premium style for luxury planners and elite events.',
  },
];

export default function ContractTemplateSelector() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('wedding_standard_contract');

  const { data: pdfUrl, isLoading } = useGenerateContractPdf({
    templateId: selectedTemplate,
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

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Choose Your Contract Template</h1>
          <p className="text-gray-400 text-sm">
            Select a style below to preview and download the generated PDF.
          </p>
        </div>
        <Button
          onClick={handleDownload}
          disabled={!pdfUrl || isLoading}
          className="bg-gold-600 hover:bg-gold-700 text-white flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" /> Download PDF
            </>
          )}
        </Button>
      </div>

      {/* Template Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {templates.map((t) => (
          <Card
            key={t.id}
            onClick={() => setSelectedTemplate(t.id)}
            className={`cursor-pointer transition-all border-2 ${
              selectedTemplate === t.id
                ? 'border-gold-500 shadow-lg scale-105'
                : 'border-transparent hover:border-gold-400 hover:scale-[1.02]'
            } bg-gray-900 text-white`}
          >
            <div className="relative w-full h-40">
              <Image
                src={t.preview}
                alt={t.name}
                fill
                className="object-cover rounded-t-lg opacity-90"
              />
            </div>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">{t.name}</CardTitle>
              <p className="text-sm text-gray-400">{t.description}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Preview Section */}
      <Card className="bg-gray-900/50 border border-gray-800 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <FileText className="w-5 h-5 text-gold-500" /> Contract Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin mb-2" />
              Generating PDF for {selectedTemplate}...
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-[80vh] border border-gray-700 rounded-lg shadow-lg"
            ></iframe>
          ) : (
            <p className="text-center text-gray-400 py-10">
              Select a contract template to preview.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
