'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Loader2, Save } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { VARIABLES } from '@/constants/variables';
import PageEditor, { createNewPage } from './components/PageEditor';
import { editorModules, EditorToolbar, formats } from './components/EditorToolbar';
import { useDraggable } from '@dnd-kit/core';
import 'react-quill-new/dist/quill.snow.css';

function DraggableVariable({
  variable,
  onClick,
}: {
  variable: string;
  onClick: (v: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: variable });
  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onClick(variable)}
      style={style}
      className="bg-gray-700 text-white px-2 py-1 rounded cursor-pointer hover:bg-gray-600 text-sm select-none"
    >
      {variable}
    </div>
  );
}

export default function CreateTemplatePage() {
  const router = useRouter();
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [pages, setPages] = useState([createNewPage()]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeEditor, setActiveEditor] = useState<string | null>(null);
  const quillRefs = useRef<{ [key: string]: any }>({});
  const [suggestion, setSuggestion] = useState<{ editorId: string; cursor: number } | null>(null);

  const addPage = () => setPages([...pages, createNewPage()]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = pages.findIndex((s) => s.id === active.id);
      const newIndex = pages.findIndex((s) => s.id === over.id);
      setPages(arrayMove(pages, oldIndex, newIndex));
    }
  };

  const handleInsertVariable = (variable: string) => {
    let editorId = activeEditor;
    let cursorPos = null;

    if (suggestion) {
      editorId = suggestion.editorId;
      cursorPos = suggestion.cursor;
      setSuggestion(null);
    }

    if (!editorId || !quillRefs.current[editorId]) return;

    const quill = quillRefs.current[editorId];
    if (!quill?.focus) return; // ✅ Prevent undefined focus errors

    quill.focus();
    const range = quill.getSelection(true);
    const insertIndex = cursorPos ?? range?.index ?? quill.getLength();
    const textBefore = quill.getText(insertIndex - 2, 2);

    if (textBefore === '{{') {
      quill.deleteText(insertIndex - 2, 2);
      quill.insertText(insertIndex - 2, variable);
      quill.setSelection(insertIndex - 2 + variable.length);
    } else {
      quill.insertText(insertIndex, variable);
      quill.setSelection(insertIndex + variable.length);
    }
  };

  const handleVariableTrigger = (editorId: string, cursorPos: number) => {
    setSuggestion({ editorId, cursor: cursorPos });
  };

  const handleEditorChange = (id: string, html: string) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, content: html } : p)));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = { name: templateName, description: templateDescription, pages };
      console.log('Saving template:', payload);
      router.push('/admin/contracts');
    } finally {
      setIsSaving(false);
    }
  };

  const highlightVariables = (html: string) =>
    VARIABLES.reduce(
      (acc, v) =>
        acc.replaceAll(v, `<span class='bg-yellow-200 text-black px-1 rounded'>${v}</span>`),
      html
    );

  return (
    <div className="min-h-screen p-4 sm:p-6 flex flex-col lg:flex-row gap-6">
      {/* ---------- MAIN AREA ---------- */}
      <div className="w-full lg:w-3/4 space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-white">Create Contract Template</h1>

        <Input
          placeholder="Template Name"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          className="bg-gray-800 text-white"
        />
        <Input
          placeholder="Template Description"
          value={templateDescription}
          onChange={(e) => setTemplateDescription(e.target.value)}
          className="bg-gray-800 text-white"
        />

        <EditorToolbar />

        {/* ---------- PAGE EDITORS ---------- */}
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={pages.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {pages.map((page) => (
              <PageEditor
                key={page.id}
                page={page}
                setPages={setPages}
                setActiveEditor={setActiveEditor}
                quillRefs={quillRefs}
                onEditorChange={handleEditorChange}
                onVariableTrigger={handleVariableTrigger}
                modules={editorModules} // keep this
                formats={formats}
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* ---------- ACTION BUTTONS ---------- */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <Button
            onClick={addPage}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" /> Add Blank Page
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !templateName}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Template
          </Button>
        </div>

        <div className="flex flex-col items-center space-y-8">
          {pages.map((p) => (
            <div
              key={p.id}
              className="bg-white text-black shadow-sm border border-gray-300"
              style={{
                width: '794px',
                minHeight: '1123px',
                padding: '40px',
                boxSizing: 'border-box',
              }}
            >
              <div
                className="ql-container ql-snow ql-editor"
                dangerouslySetInnerHTML={{ __html: highlightVariables(p.content) }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ---------- VARIABLES SIDEBAR ---------- */}
      <div className="w-full lg:w-1/4 lg:sticky top-6 h-fit self-start bg-gray-900 p-4 rounded-lg border border-gray-800 flex flex-col gap-2">
        <h2 className="text-lg font-semibold mb-2 text-white">Variables</h2>
        <div className="flex flex-wrap gap-2">
          {VARIABLES.map((v) => (
            <DraggableVariable key={v} variable={v} onClick={handleInsertVariable} />
          ))}
        </div>
      </div>
    </div>
  );
}
