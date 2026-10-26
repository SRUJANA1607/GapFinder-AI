'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  BookOpen,
  FileQuestion,
  Trash2,
  CheckCircle,
  AlertCircle,
  Eye,
  Plus,
  Compass,
  Layers,
  Sparkles,
  Info,
  X,
  Loader2,
} from 'lucide-react';
import { AppStore } from '@/lib/store';
import { StudyDocument, DocumentCategory, UserProfile } from '@/lib/types';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function isRawPdfContent(text?: string): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  return (
    trimmed.startsWith('%PDF-') ||
    (trimmed.includes('endobj') && (trimmed.includes('/Type /Page') || trimmed.includes('/Filter'))) ||
    trimmed.includes('/FontDescriptor')
  );
}

export default function UploadPage() {
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [activeTab, setActiveTab] = useState<DocumentCategory>('syllabus');
  const [docName, setDocName] = useState('');
  const [textContent, setTextContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>('notes');
  const [previewDoc, setPreviewDoc] = useState<StudyDocument | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [extractedFileSize, setExtractedFileSize] = useState('');
  const [extractedPageCount, setExtractedPageCount] = useState<number | undefined>(undefined);
  const [user, setUser] = useState<UserProfile | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const store = AppStore.getInstance();
    store.initStore();
    setDocuments(store.getDocuments());
    setUser(store.getUser());

    const handleUserChange = () => {
      setUser(store.getUser());
    };
    window.addEventListener('gapfinder_user_changed', handleUserChange);
    return () => window.removeEventListener('gapfinder_user_changed', handleUserChange);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');
    setUploadSuccess(false);

    const filename = file.name;
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    setUploadedFileName(filename);
    setExtractedFileSize(formatBytes(file.size));

    // If the title field is blank, use the uploaded filename without extension
    if (!docName.trim()) {
      setDocName(nameWithoutExt);
    }

    const isPdf =
      filename.toLowerCase().endsWith('.pdf') ||
      file.type === 'application/pdf';

    if (!isPdf) {
      // Plain text or markdown
      try {
        const text = await file.text();
        if (!text || !text.trim()) {
          setErrorMessage('The selected file appears to be empty.');
          setTextContent('');
          return;
        }
        setTextContent(text);
        setExtractedPageCount(Math.max(1, Math.ceil(text.length / 1500)));
      } catch {
        setErrorMessage('Could not read file contents. Please verify file permissions or paste the text directly.');
        setTextContent('');
      }
      return;
    }

    // PDF extraction: do NOT read raw binary via FileReader.readAsText
    setIsExtracting(true);
    setTextContent(''); // Keep cleared until extracted

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/extract-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setIsExtracting(false);

      if (!res.ok || !data.success) {
        setErrorMessage(
          data.error ||
            'This PDF appears to be a scanned image or contains no extractable text. Please upload a text-based PDF or paste the text content directly.'
        );
        setTextContent('');
        return;
      }

      setTextContent(data.text);
      if (data.pageCount) {
        setExtractedPageCount(data.pageCount);
      }
    } catch {
      setIsExtracting(false);
      setErrorMessage(
        'Network error during PDF text extraction. Please check your connection or paste the text content directly.'
      );
      setTextContent('');
    }
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();

    // Preserve entered title or fallback to filename without extension
    const titleToUse = docName.trim() || (uploadedFileName ? uploadedFileName.replace(/\.[^/.]+$/, '') : '');

    if (!titleToUse) {
      setErrorMessage('Please provide a document title or upload a named file.');
      return;
    }

    if (!textContent.trim()) {
      setErrorMessage(
        isExtracting
          ? 'Extracting text from PDF, please wait a moment...'
          : 'Please upload a document with readable text or paste content before submitting.'
      );
      return;
    }

    // Prevent saving raw PDF binary
    if (isRawPdfContent(textContent)) {
      setErrorMessage(
        'Cannot save raw PDF binary data. Please upload a text-based PDF with extractable text or paste the content directly.'
      );
      return;
    }

    setErrorMessage('');

    const calcSize =
      extractedFileSize || `${Math.round(textContent.length / 1024) || 1} KB`;
    const calcPages =
      extractedPageCount || Math.max(1, Math.ceil(textContent.length / 1500));

    const newDoc: StudyDocument = {
      id: `doc_${Date.now()}`,
      name: titleToUse,
      category: selectedCategory,
      uploadedAt: new Date().toISOString(),
      fileSize: calcSize,
      pageCount: calcPages,
      content: textContent.trim(),
      chunksCount: Math.max(1, Math.ceil(textContent.length / 500)),
    };

    const store = AppStore.getInstance();
    store.addDocument(newDoc);
    setDocuments(store.getDocuments());

    // Switch tab to the newly uploaded category so it appears immediately
    setActiveTab(selectedCategory);

    // Clear form inputs cleanly
    setDocName('');
    setTextContent('');
    setUploadedFileName('');
    setExtractedFileSize('');
    setExtractedPageCount(undefined);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this material from your workspace?')) {
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
  };

  const filteredDocs = documents.filter((d) => d.category === activeTab);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {user?.role === 'teacher' ? 'Upload Class Learning Materials' : 'Upload Study Materials & Past Papers'}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
          {user?.role === 'teacher'
            ? 'Upload official course syllabus, textbook chapters, lecture slides, and past exam question papers for your class. Documents are parsed into semantic chunks to diagnose class-level misconceptions and performance.'
            : 'Upload your official syllabus, textbook excerpts, lecture notes, and past question papers. Documents are parsed into semantic chunks to ground all diagnostic quizzes and revision plans.'}
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
                  onChange={(e) => {
                    setDocName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="e.g. Unit 4 Virtual Memory Notes (leave blank to use filename)"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  File Upload (.pdf, .txt, .md) or Paste Text
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.json,.pdf"
                  onChange={handleFileUpload}
                  disabled={isExtracting}
                  className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 cursor-pointer disabled:opacity-50"
                />
              </div>

              {isExtracting && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Extracting readable text from {uploadedFileName || 'PDF'}...</span>
                </div>
              )}

              <div>
                <textarea
                  rows={5}
                  value={textContent}
                  disabled={isExtracting}
                  onChange={(e) => {
                    setTextContent(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder={
                    isExtracting
                      ? 'Extracting readable text from your PDF, please wait...'
                      : 'Paste textbook definitions, lecture notes, or question paper questions here...'
                  }
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none font-mono disabled:opacity-50"
                />
              </div>

              {errorMessage && (
                <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-2.5 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between gap-2 font-semibold">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrorMessage('')}
                    className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {uploadSuccess && (
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-2.5 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5 font-semibold">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Material uploaded successfully! (+50 XP)</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isExtracting}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 py-2.5 text-xs font-bold text-white shadow-xs transition flex items-center justify-center gap-2"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extracting PDF Text...</span>
                  </>
                ) : (
                  <span>Upload Material</span>
                )}
              </button>
            </form>
          </div>

          <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 p-3.5 text-xs text-indigo-800 dark:text-indigo-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400" />
            <p className="leading-relaxed">
              <strong>Note:</strong> Course materials are pre-loaded on the right for reference. You can upload additional subject notes anytime.
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
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 font-semibold text-slate-700 dark:text-slate-300 capitalize text-[10px]">
                            {doc.category.replace('_', ' ')}
                          </span>
                          <span>•</span>
                          <span>{doc.fileSize}</span>
                          <span>•</span>
                          <span>~{doc.pageCount || 1} pages</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handlePreview(doc)}
                        className="flex items-center gap-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition shadow-2xs"
                        title="View Material"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(doc.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="Delete Material"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Material Content Viewer */}
          {previewDoc && (
            <div className="clean-card p-5 sm:p-6 space-y-4 animate-in fade-in duration-200 border border-slate-200 dark:border-slate-800 shadow-md">
              <div className="flex items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/60">
                      {previewDoc.category.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{previewDoc.fileSize}</span>
                    {previewDoc.pageCount && (
                      <>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">~{previewDoc.pageCount} pages</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{previewDoc.name}</h3>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="shrink-0 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
                >
                  Close
                </button>
              </div>

              {/* Document Content Display */}
              {isRawPdfContent(previewDoc.content) ? (
                <div className="rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-6 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto" />
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    Raw Binary PDF Data Detected
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-300 max-w-md mx-auto leading-relaxed">
                    This file was saved prior to PDF text extraction support. Please delete this item and re-upload the PDF to extract and view clean, readable text.
                  </p>
                </div>
              ) : !previewDoc.content || !previewDoc.content.trim() ? (
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center space-y-2">
                  <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No Text Content Available
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                    This material does not contain any readable text. You can add notes or re-upload a text-based document.
                  </p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto pr-3 text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 font-sans shadow-inner selection:bg-indigo-100 dark:selection:bg-indigo-900">
                  {previewDoc.content}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
