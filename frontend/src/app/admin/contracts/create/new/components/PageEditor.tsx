'use client';

import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { v4 as uuidv4 } from 'uuid';
import { editorModules, formats } from './EditorToolbar';
import 'react-quill-new/dist/quill.snow.css';
const ReactQuill = dynamic(
    async () => {
        const { default: RQ } = await import('react-quill-new');
        return React.forwardRef<any, React.ComponentProps<typeof RQ>>((props, ref) => (
            <RQ {...props} ref={ref} />
        ));
    },
    { ssr: false }
);

type PageEditorProps = {
    page: { id: string; content: string };
    setPages: (updater: any) => void;
    quillRefs: React.MutableRefObject<Record<string, any>>;
    setActiveEditor: (id: string) => void;
    onEditorChange: (id: string, value: string) => void;
    onVariableTrigger: (id: string, cursorIndex: number) => void;
    modules?: any;
    formats?: string[];
};

export default function PageEditor({
    page,
    setPages,
    quillRefs,
    setActiveEditor,
    onEditorChange,
    onVariableTrigger,
}: PageEditorProps) {
    const { setNodeRef, transform, transition } = useSortable({ id: page.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const reactQuillRef = useRef<any | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!reactQuillRef.current) return;

            const quill =
                typeof reactQuillRef.current.getEditor === 'function'
                    ? reactQuillRef.current.getEditor()
                    : (reactQuillRef.current as any).editor || null;

            if (!quill) return;

            if (!quillRefs.current[page.id]) {
                quillRefs.current[page.id] = quill;
            }

            quill.on('text-change', (delta: any, oldDelta: any, source: any) => {
                const sel = quill.getSelection();
                const cursor = sel?.index ?? 0;
                const textBeforeCursor = quill.getText(Math.max(0, cursor - 2), 2);
                if (textBeforeCursor === '{{') {
                    onVariableTrigger(page.id, cursor);
                }
            });
        }, 300);

        return () => clearTimeout(timer);
    }, []);


    return (
        <Card
            ref={setNodeRef}
            style={style}
            className="mx-auto shadow-md border border-gray-400 flex justify-center bg-gray-200 py-8"
        >
            <div
                className="bg-white text-black shadow-sm border border-gray-300"
                style={{
                    width: '794px',
                    minHeight: '1123px',
                    maxHeight: '1123px',
                    padding: '40px',
                    boxSizing: 'border-box',
                }}
            >
                <ReactQuill
                    ref={reactQuillRef}
                    theme="snow"
                    modules={editorModules}
                    formats={formats}
                    value={page.content}
                    onFocus={() => setActiveEditor(page.id)}
                    onChange={(value: string, _delta: any, _source: any, _editor: any) => {
                        onEditorChange(page.id, value);
                        page.content = value;
                        setPages((prev: any) => {
                            return prev.map((p: any) => (p.id === page.id ? { ...p, content: value } : p));
                        });
                        if (!quillRefs.current[page.id] && reactQuillRef.current) {
                            const q =
                                typeof reactQuillRef.current.getEditor === 'function'
                                    ? reactQuillRef.current.getEditor()
                                    : (reactQuillRef.current as any).editor || null;
                            if (q) quillRefs.current[page.id] = q;
                        }
                    }}
                />
            </div>
        </Card>
    );
}

export const createNewPage = () => ({
    id: uuidv4(),
    content: '',
});
