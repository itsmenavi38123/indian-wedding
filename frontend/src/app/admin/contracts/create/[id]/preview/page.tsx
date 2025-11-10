'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  SignatureField,
  useGenerateContractPdf,
  useSaveSignatureFields,
} from '@/services/api/contractTemplate';
import { ArrowLeft, Download, Loader2, PenLine, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function ContractPreviewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { id } = params;

  const user = useSelector((state: RootState) => state.auth.user);
  const { data: pdfUrl, isLoading } = useGenerateContractPdf({ templateId: id });
  const [fields, setFields] = useState<SignatureField[]>([]);
  const saveFieldsMutation = useSaveSignatureFields();
  const { mutate: saveFields, isPending: isSaving } = saveFieldsMutation;

  const [isAdding, setIsAdding] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emails, setEmails] = useState(['', '', '']);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${id}.pdf`;
    a.click();
  };

  const handleAddSignatureFields = () => {
    setIsAdding(!isAdding);
    setSelectedField(null);
  };

  const handlePdfClick = (e: React.MouseEvent) => {
    if (!isAdding || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + containerRef.current.scrollLeft;
    const y = e.clientY - rect.top + containerRef.current.scrollTop;

    const newField: SignatureField = {
      id: crypto.randomUUID(),
      type: '',
      x,
      y,
      page: 1,
      width: 100,
      height: 40,
    };
    setFields((prev) => [...prev, newField]);
    setEditingFieldId(newField.id);
  };

  const handleConfirmSave = () => {
    if (!emails.every((e) => e.trim())) {
      toast.error('Please enter all three signer emails');
      return;
    }

    saveFields(
      { templateId: id, payload: { fields, emails } },
      {
        onSuccess: () => {
          setEmailDialogOpen(false);
          setIsAdding(false);
          setSelectedField(null);
        },
      }
    );
  };

  const handleMouseDown = (e: React.MouseEvent, fieldId: string) => {
    e.stopPropagation();
    if (editingFieldId) return;
    setDragging(fieldId);
    setSelectedField(fieldId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + containerRef.current.scrollLeft;
    const y = e.clientY - rect.top + containerRef.current.scrollTop;

    setFields((prev) => prev.map((f) => (f.id === dragging ? { ...f, x, y } : f)));
  };

  const handleMouseUp = () => {
    if (dragging) setDragging(null);
  };

  const handleDeleteField = () => {
    if (!selectedField) return;
    setFields((prev) => prev.filter((f) => f.id !== selectedField));
    setSelectedField(null);
  };

  const handleFieldNameChange = (id: string, value: string) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, type: value } : f)));
  };

  const finishEditing = () => {
    setEditingFieldId(null);
  };

  return (
    <div
      className="min-h-screen bg-gray-900 p-8 text-white relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-semibold capitalize">{id.replace(/_/g, ' ')} Preview</h1>
        </div>

        <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
          <DialogContent className="bg-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Enter Signer Emails</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {emails.map((email, idx) => (
                <Input
                  key={idx}
                  type="email"
                  placeholder={`Signer ${idx + 1} Email`}
                  value={email}
                  onChange={(e) => {
                    const newEmails = [...emails];
                    newEmails[idx] = e.target.value;
                    setEmails(newEmails);
                  }}
                  className="bg-gray-700 text-white"
                />
              ))}
            </div>
            <DialogFooter>
              <Button
                onClick={handleConfirmSave}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  'Confirm & Save'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex gap-3">
          <Button
            onClick={handleDownload}
            disabled={!pdfUrl || isLoading}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
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

          {user?.role === 'ADMIN' && (
            <>
              <Button
                onClick={handleAddSignatureFields}
                className={`${
                  isAdding ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
                } flex items-center gap-2`}
              >
                <PenLine className="w-4 h-4" />
                {isAdding ? 'Cancel Add Mode' : 'Add Signature Fields'}
              </Button>

              {fields.length > 0 && (
                <Button
                  onClick={() => setEmailDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Fields
                </Button>
              )}

              {selectedField && (
                <Button
                  onClick={handleDeleteField}
                  className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete Field
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Scrollable PDF container */}
      <div
        ref={containerRef}
        className="relative bg-gray-800 rounded-lg shadow-lg overflow-auto h-[85vh]"
        onClick={handlePdfClick}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin mb-2" />
            Generating PDF for {id}...
          </div>
        ) : pdfUrl ? (
          <>
            <iframe
              src={pdfUrl}
              className="w-full h-full border-none rounded-lg"
              title="Contract PDF"
            ></iframe>

            {/* Transparent clickable overlay */}
            {isAdding && <div className="absolute inset-0 z-10 cursor-crosshair"></div>}

            {/* Fields */}
            {fields.map((f) => (
              <div
                key={f.id}
                onMouseDown={(e) => handleMouseDown(e, f.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedField(f.id);
                }}
                className={`absolute px-2 py-1 rounded-md text-xs font-semibold shadow-md z-20 select-none ${
                  selectedField === f.id
                    ? 'bg-yellow-300 text-black ring-2 ring-blue-500 scale-105 cursor-move'
                    : 'bg-yellow-400 text-black cursor-move'
                }`}
                style={{
                  top: f.y,
                  left: f.x,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {editingFieldId === f.id ? (
                  <input
                    type="text"
                    autoFocus
                    className="bg-white text-black text-xs px-1 py-0.5 rounded outline-none w-32"
                    value={f.type}
                    placeholder="Enter field name..."
                    onChange={(e) => handleFieldNameChange(f.id, e.target.value)}
                    onBlur={finishEditing}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') finishEditing();
                    }}
                  />
                ) : (
                  <span>{f.type || 'Click to name'}</span>
                )}
              </div>
            ))}
          </>
        ) : (
          <p className="text-center text-gray-400 py-10">Failed to load contract preview.</p>
        )}
      </div>
    </div>
  );
}
