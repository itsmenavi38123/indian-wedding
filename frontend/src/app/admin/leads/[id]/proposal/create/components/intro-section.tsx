'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Type,
  Variable,
} from 'lucide-react';

type Props = {
  valueHTML: string;
  onChange: (html: string) => void;
  onInsertVar: (variable: string) => void;
};

export function IntroSection({ valueHTML, onChange, onInsertVar }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Start typing your introduction here...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: valueHTML || '<p></p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Update editor content when valueHTML changes (e.g., template switch)
  useEffect(() => {
    if (editor && valueHTML !== editor.getHTML()) {
      editor.commands.setContent(valueHTML || '<p></p>');
    }
  }, [valueHTML, editor]);

  const insertVariable = (variable: string) => {
    if (editor) {
      editor.chain().focus().insertContent(variable).run();
      onInsertVar(variable);
    }
  };

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded p-1.5 transition-colors ${
        isActive ? 'bg-teal-100 text-teal-700' : 'hover:bg-gray-100 text-gray-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <section aria-labelledby="intro-heading" className="w-full">
      <div className="mb-3">
        <h2 id="intro-heading" className="text-lg font-semibold mb-2 text-white">
          Introduction
        </h2>

        {/* Rich Text Editor Toolbar */}
        <div className="border border-gray-200 rounded-t-lg bg-gray-50 p-2 flex flex-wrap items-center gap-1">
          {/* Text Formatting */}
          <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-1 px-2 border-r border-gray-300">
            <ToolbarButton
              onClick={() => editor.chain().focus().setParagraph().run()}
              isActive={editor.isActive('paragraph')}
              title="Normal Text"
            >
              <Type className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              title="Heading 2"
            >
              <span className="text-xs font-bold">H2</span>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
              title="Heading 3"
            >
              <span className="text-xs font-bold">H3</span>
            </ToolbarButton>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 px-2 border-r border-gray-300">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Text Alignment */}
          <div className="flex items-center gap-1 px-2 border-r border-gray-300">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              isActive={editor.isActive({ textAlign: 'justify' })}
              title="Justify"
            >
              <AlignJustify className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1 px-2 border-r border-gray-300">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              title="Redo (Ctrl+Y)"
            >
              <Redo className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Variables - Enhanced with dropdown */}
          <div className="flex items-center gap-1 px-2">
            <span className="text-xs text-gray-600 mr-1 flex items-center gap-1">
              <Variable className="h-3 w-3" />
              Variables:
            </span>
            <div className="relative group">
              <button
                type="button"
                className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 hover:bg-blue-200 transition-colors flex items-center gap-1"
                title="Insert variables"
              >
                Insert Variable ▼
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <div className="p-1">
                  <button
                    type="button"
                    onClick={() => insertVariable('{couple_names}')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 rounded transition-colors"
                  >
                    <span className="font-medium">{'{couple_names}'}</span>
                    <span className="block text-gray-500">Client names</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertVariable('{wedding_date}')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 rounded transition-colors"
                  >
                    <span className="font-medium">{'{wedding_date}'}</span>
                    <span className="block text-gray-500">Event date</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertVariable('{company_name}')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 rounded transition-colors"
                  >
                    <span className="font-medium">{'{company_name}'}</span>
                    <span className="block text-gray-500">Your company</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertVariable('{reference}')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 rounded transition-colors"
                  >
                    <span className="font-medium">{'{reference}'}</span>
                    <span className="block text-gray-500">Proposal ref</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertVariable('{current_date}')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 rounded transition-colors"
                  >
                    <span className="font-medium">{'{current_date}'}</span>
                    <span className="block text-gray-500">Today&apos;s date</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertVariable('{current_year}')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 rounded transition-colors"
                  >
                    <span className="font-medium">{'{current_year}'}</span>
                    <span className="block text-gray-500">Current year</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Editor Content */}
        <div className="border border-t-0 border-gray-200 rounded-b-lg bg-white">
          <EditorContent editor={editor} className="rich-text-editor" />
        </div>

        <style jsx global>{`
          .rich-text-editor .ProseMirror {
            min-height: 150px;
            max-height: 400px;
            overflow-y: auto;
          }

          .rich-text-editor .ProseMirror:focus {
            outline: none;
          }

          .rich-text-editor .ProseMirror p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: #adb5bd;
            pointer-events: none;
            height: 0;
          }

          .rich-text-editor .ProseMirror h2 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
          }

          .rich-text-editor .ProseMirror h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin-top: 0.75rem;
            margin-bottom: 0.5rem;
          }

          .rich-text-editor .ProseMirror ul {
            list-style-type: disc;
            padding-left: 1.5rem;
            margin: 0.5rem 0;
          }

          .rich-text-editor .ProseMirror ol {
            list-style-type: decimal;
            padding-left: 1.5rem;
            margin: 0.5rem 0;
          }

          .rich-text-editor .ProseMirror li {
            margin: 0.25rem 0;
          }

          .rich-text-editor .ProseMirror strong {
            font-weight: 600;
          }

          .rich-text-editor .ProseMirror em {
            font-style: italic;
          }

          .rich-text-editor .ProseMirror u {
            text-decoration: underline;
          }
        `}</style>

        {/* Help Text */}
        <p className="mt-2 text-xs text-gray-600">
          Tip: Use the toolbar to format your text. Variables like {'{couple_names}'} and{' '}
          {'{wedding_date}'} will be automatically replaced with actual values in the proposal.
        </p>
      </div>
    </section>
  );
}
