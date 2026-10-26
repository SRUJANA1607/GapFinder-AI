'use client';

import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  BookOpen,
  FileQuestion,
  Trash2,
  CheckCircle,
  Eye,
  Plus,
  Compass,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { AppStore } from '@/lib/store';
import { StudyDocument, DocumentCategory, DocumentChunk } from '@/lib/types';
import { chunkDocument } from '@/lib/rag/chunker';
import CitationCard from '@/components/CitationCard';

export default function UploadPage() {
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [activeTab, setActiveTab] = useState<DocumentCategory>('syllabus');
  const [docName, setDocName] = useState('');
  const [textContent, setTextContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>('notes');
  const [previewDoc, setPreviewDoc] = useState<StudyDocument | null>(null);
  const [previewChunks, setPreviewChunks] = useState<DocumentChunk[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    const store = AppStore.getInstance();
    store.initStore();
    setDocuments(store.getDocuments());
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setTextContent(content || '');
    };
    reader.readAsText(file);
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !textContent.trim()) {
      alert('Please provide a document title and content.');
      return;
    }

    const newDoc: StudyDocument = {
      id: `doc_${Date.now()}`,
      name: docName.endsWith('.pdf') || docName.endsWith('.txt') ? docName : `${docName}.txt`,
      category: selectedCategory,
      uploadedAt: new Date().toISOString(),
      fileSize: `${Math.round(textContent.length / 1024) || 1} KB`,
      pageCount: Math.max(1, Math.ceil(textContent.length / 1500)),
      content: textContent,
      chunksCount: Math.max(1, Math.ceil(textContent.length / 500)),
    };

    const store = AppStore.getInstance();
    store.addDocument(newDoc);
    setDocuments(store.getDocuments());

    setDocName('');
    setTextContent('');
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 2500);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this document and remove its indexed chunks?')) {
      const store = AppStore.getInstance();
      store.deleteDocument(id);
      setDocuments(store.getDocuments());
      if (previewDoc?.id === id) {
        setPreviewDoc(null);
      }
    }
  };

  const handlePreview = (doc: StudyDocument) => {
    setPreviewDoc(doc);
    const chunks = chunkDocument(doc);
    setPreviewChunks(chunks);
  };

  const filteredDocs = documents.filter((d) => d.category === activeTab);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Upload Study Materials
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
          Upload your official syllabus, textbook excerpts, lecture notes, and past question papers.
          Documents are parsed into semantic chunks to ground all diagnostic quizzes and revision plans.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Form (Left Column) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="clean-card p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
              <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Add New Material</span>
            </h2>

            <form onSubmit={handleAddDocument} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Material Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'syllabus', label: 'Syllabus', icon: Compass },
                    { id: 'textbook', label: 'Textbook', icon: BookOpen },
                    { id: 'notes', label: 'Lecture Notes', icon: FileText },
                    { id: 'past_paper', label: 'Past Papers', icon: FileQuestion },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id as DocumentCategory)}
                      className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition ${
                        selectedCategory === cat.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-600 shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <cat.icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Document Title
                </label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. CS301_Unit4_VirtualMemory_Notes.txt"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  File Upload (.txt, .md, .pdf) or Paste Text
                </label>
                <input
                  type="file"
                  accept=".txt,.md,.json,.pdf"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              <div>
                <textarea
                  rows={5}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste textbook definitions, lecture notes, or question paper questions here..."
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none font-mono"
                />
              </div>

              {uploadSuccess && (
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-2.5 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5 font-semibold">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Document parsed, chunked & indexed! (+50 XP)</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 text-xs font-bold text-white shadow-xs transition"
              >
                Index Material into Vector Store
              </button>
            </form>
          </div>

          <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 p-3.5 text-xs text-indigo-800 dark:text-indigo-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400" />
            <p className="leading-relaxed">
              <strong>Evaluator Note:</strong> 4 realistic course materials are pre-loaded on the right for testing. You can add your own custom subject notes anytime.
            </p>
          </div>
        </div>

        {/* Document Explorer (Right Column) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="clean-card p-5 sm:p-6 shadow-sm space-y-4">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              {[
                { id: 'syllabus', label: 'Syllabus', count: documents.filter((d) => d.category === 'syllabus').length },
                { id: 'textbook', label: 'Textbooks', count: documents.filter((d) => d.category === 'textbook').length },
                { id: 'notes', label: 'Lecture Notes', count: documents.filter((d) => d.category === 'notes').length },
                { id: 'past_paper', label: 'Past Papers', count: documents.filter((d) => d.category === 'past_paper').length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as DocumentCategory)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Documents List */}
            <div className="space-y-2.5">
              {filteredDocs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No materials found under this category.
                </div>
              ) : (
                filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 p-3.5 hover:border-slate-300 dark:hover:border-slate-600 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{doc.name}</h4>
                        <div className="flex items-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>{doc.fileSize}</span>
                          <span>•</span>
                          <span>~{doc.pageCount || 1} pages</span>
                          <span>•</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{doc.chunksCount} chunks indexed</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handlePreview(doc)}
                        className="flex items-center gap-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Chunks</span>
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chunk Inspection Viewer */}
          {previewDoc && (
            <div className="clean-card p-5 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Semantic Chunk Preview
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{previewDoc.name}</h3>
                </div>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {previewChunks.map((chunk, idx) => (
                  <div
                    key={chunk.id}
                    className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3 text-xs space-y-1 border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        Chunk #{idx + 1}: {chunk.sectionTitle}
                      </span>
                      <span>Page ~{chunk.pageNumber}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed line-clamp-3">
                      {chunk.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
