'use client';

import React from 'react';
import Quill from 'quill';
import 'react-quill-new/dist/quill.snow.css';
const Font: any = Quill.import('formats/font');
Font.whitelist = ['sans-serif', 'serif', 'monospace'];
Quill.register(Font, true);

const Size: any = Quill.import('formats/size');
Size.whitelist = ['small', false, 'large', 'huge'];
Quill.register(Size, true);

export const formats = [
  'font',
  'size',
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'color',
  'background',
  'script',
  'blockquote',
  'code-block',
  'list',
  'indent',
  'align',
  'link',
  'image',
  'video',
];

export const editorModules = {
  toolbar: {
    container: '#toolbar',
    handlers: {
      layout(this: any, value: string) {
        const range = this.quill.getSelection();
        if (!range) return;
        const selectedText = this.quill.getText(range.index, range.length);
        let formattedHTML = selectedText;

        if (value === 'two-column') {
          formattedHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;"><div>${selectedText}</div><div>${selectedText}</div></div>`;
        } else if (value === 'centered') {
          formattedHTML = `<div style="text-align:center;">${selectedText}</div>`;
        } else if (value === 'highlight-box') {
          formattedHTML = `<div style="background:#fef08a;padding:8px;border-radius:6px;">${selectedText}</div>`;
        }

        if (value !== 'normal') {
          this.quill.clipboard.dangerouslyPasteHTML(range.index, formattedHTML);
        }
      },
      image(this: any) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.click();

        input.onchange = () => {
          const file = input.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (e) => {
            const range = this.quill.getSelection(true);
            if (e?.target?.result) {
              this.quill.insertEmbed(range.index, 'image', e.target.result);
            }
          };
          reader.readAsDataURL(file);
        };
      },
      video(this: any) {
        const url = prompt('Enter video URL');
        if (url) {
          const range = this.quill.getSelection(true);
          this.quill.insertEmbed(range.index, 'video', url);
        }
      },
    },
  },
  clipboard: { matchVisual: false },
};
export const EditorToolbar = () => (
  <div
    id="toolbar"
    className="sticky top-0 z-50 bg-gray-900 text-white border-b border-gray-700 p-2 flex flex-wrap gap-2 items-center"
  >
    <select className="ql-font" defaultValue="">
      <option value="">Default</option>
      <option value="sans-serif">Sans Serif</option>
      <option value="serif">Serif</option>
      <option value="monospace">Monospace</option>
    </select>
    <select className="ql-size" defaultValue="">
      <option value="small">Small</option>
      <option value="">Normal</option>
      <option value="large">Large</option>
      <option value="huge">Huge</option>
    </select>
    <button className="ql-bold" />
    <button className="ql-italic" />
    <button className="ql-underline" />
    <button className="ql-strike" />
    <select className="ql-color" />
    <select className="ql-background" />
    <button className="ql-script" value="sub" />
    <button className="ql-script" value="super" />
    <button className="ql-blockquote" />
    <button className="ql-code-block" />
    <button className="ql-list" value="ordered" />
    <button className="ql-list" value="bullet" />
    <button className="ql-indent" value="-1" />
    <button className="ql-indent" value="+1" />
    <select className="ql-align" />
    <button className="ql-link" />
    <button className="ql-image" />
    <button className="ql-video" />
    <select className="ql-layout">
      <option value="normal">Normal</option>
      <option value="two-column">2 Columns</option>
      <option value="centered">Centered Block</option>
      <option value="highlight-box">Highlight Box</option>
    </select>
    <button className="ql-clean" />
  </div>
);
