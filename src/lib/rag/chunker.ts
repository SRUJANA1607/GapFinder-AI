import { DocumentCategory, DocumentChunk, StudyDocument } from '../types';

export interface ChunkOptions {
  maxChunkSize?: number;
  overlap?: number;
}

export function chunkDocument(
  doc: StudyDocument,
  options: ChunkOptions = {}
): DocumentChunk[] {
  const maxSize = options.maxChunkSize || 600;
  const overlap = options.overlap || 100;

  const content = doc.content.trim();
  if (!content) return [];

  // Split into paragraphs / sections first
  const paragraphs = content.split(/\n\s*\n+/);
  const chunks: DocumentChunk[] = [];
  let currentChunk = '';
  let currentSection = doc.name;
  let chunkIndex = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i].trim();
    if (!para) continue;

    // Check if paragraph looks like a section header (e.g. "UNIT 1:", "CHAPTER 4:", "Section 4.2", "1.1 Process")
    const headerMatch = para.match(/^(?:UNIT|CHAPTER|Section|\d+\.|\d+\.\d+|\[\d{4})/i);
    if (headerMatch) {
      const firstLine = para.split('\n')[0].substring(0, 60);
      currentSection = firstLine.trim();
    }

    if ((currentChunk + '\n\n' + para).length > maxSize && currentChunk.length > 0) {
      chunks.push({
        id: `chunk_${doc.id}_${chunkIndex++}`,
        docId: doc.id,
        docName: doc.name,
        category: doc.category,
        sectionTitle: currentSection,
        pageNumber: Math.max(1, Math.floor(i / 3) + 1),
        content: currentChunk.trim(),
      });

      // Keep overlap from end of currentChunk
      const words = currentChunk.split(/\s+/);
      const overlapWords = words.slice(-Math.min(words.length, Math.floor(overlap / 6)));
      currentChunk = overlapWords.join(' ') + '\n\n' + para;
    } else {
      currentChunk = currentChunk ? currentChunk + '\n\n' + para : para;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({
      id: `chunk_${doc.id}_${chunkIndex++}`,
      docId: doc.id,
      docName: doc.name,
      category: doc.category,
      sectionTitle: currentSection,
      pageNumber: Math.max(1, Math.floor(paragraphs.length / 3) + 1),
      content: currentChunk.trim(),
    });
  }

  return chunks;
}
