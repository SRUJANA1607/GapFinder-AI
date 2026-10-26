import { DocumentChunk } from '../types';

export interface SearchResult {
  chunk: DocumentChunk;
  score: number;
  highlightSnippet: string;
}

export class SimpleVectorStore {
  private chunks: DocumentChunk[] = [];
  private idfMap: Map<string, number> = new Map();
  private docVectors: Map<string, Map<string, number>> = new Map();

  constructor(initialChunks: DocumentChunk[] = []) {
    if (initialChunks.length > 0) {
      this.addChunks(initialChunks);
    }
  }

  public addChunks(newChunks: DocumentChunk[]) {
    // Avoid duplicates
    const existingIds = new Set(this.chunks.map((c) => c.id));
    const toAdd = newChunks.filter((c) => !existingIds.has(c.id));
    this.chunks.push(...toAdd);
    this.rebuildIndex();
  }

  public clear() {
    this.chunks = [];
    this.idfMap.clear();
    this.docVectors.clear();
  }

  public getAllChunks(): DocumentChunk[] {
    return this.chunks;
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);
  }

  private rebuildIndex() {
    const totalDocs = this.chunks.length;
    if (totalDocs === 0) return;

    const docFreq: Map<string, number> = new Map();

    // 1. Compute Document Frequency
    for (const chunk of this.chunks) {
      const words = new Set(this.tokenize(chunk.content + ' ' + chunk.sectionTitle));
      for (const word of words) {
        docFreq.set(word, (docFreq.get(word) || 0) + 1);
      }
    }

    // 2. Compute IDF
    this.idfMap.clear();
    for (const [word, df] of docFreq.entries()) {
      this.idfMap.set(word, Math.log((totalDocs + 1) / (df + 1)) + 1);
    }

    // 3. Compute TF-IDF vectors for each chunk
    this.docVectors.clear();
    for (const chunk of this.chunks) {
      const tokens = this.tokenize(chunk.content + ' ' + chunk.sectionTitle);
      const tf: Map<string, number> = new Map();
      for (const token of tokens) {
        tf.set(token, (tf.get(token) || 0) + 1);
      }

      const vector: Map<string, number> = new Map();
      let normSq = 0;
      for (const [token, count] of tf.entries()) {
        const idf = this.idfMap.get(token) || 1;
        const weight = (1 + Math.log(count)) * idf;
        vector.set(token, weight);
        normSq += weight * weight;
      }

      // Normalize
      const norm = Math.sqrt(normSq) || 1;
      for (const [token, weight] of vector.entries()) {
        vector.set(token, weight / norm);
      }

      this.docVectors.set(chunk.id, vector);
    }
  }

  public search(query: string, topK: number = 4): SearchResult[] {
    if (this.chunks.length === 0) return [];

    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) return [];

    // Query TF-IDF vector
    const queryTf: Map<string, number> = new Map();
    for (const token of queryTokens) {
      queryTf.set(token, (queryTf.get(token) || 0) + 1);
    }

    const queryVec: Map<string, number> = new Map();
    let queryNormSq = 0;
    for (const [token, count] of queryTf.entries()) {
      const idf = this.idfMap.get(token) || 1.5;
      const weight = (1 + Math.log(count)) * idf;
      queryVec.set(token, weight);
      queryNormSq += weight * weight;
    }
    const queryNorm = Math.sqrt(queryNormSq) || 1;
    for (const [token, weight] of queryVec.entries()) {
      queryVec.set(token, weight / queryNorm);
    }

    // Compute Cosine Similarity against all chunks
    const results: { chunk: DocumentChunk; score: number }[] = [];

    for (const chunk of this.chunks) {
      const docVec = this.docVectors.get(chunk.id);
      if (!docVec) continue;

      let dotProduct = 0;
      for (const [token, qWeight] of queryVec.entries()) {
        const dWeight = docVec.get(token);
        if (dWeight) {
          dotProduct += qWeight * dWeight;
        }
      }

      // Bonus if category is textbook or notes
      let bonus = 0;
      if (chunk.category === 'textbook' || chunk.category === 'notes') {
        bonus += 0.05;
      }
      if (query.toLowerCase().includes(chunk.sectionTitle.toLowerCase())) {
        bonus += 0.15;
      }

      const finalScore = Math.min(1.0, dotProduct + bonus);
      if (finalScore > 0.01) {
        results.push({ chunk, score: finalScore });
      }
    }

    // Sort descending by score
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, topK).map((r) => {
      // Find best matching snippet (around 150-200 chars)
      const content = r.chunk.content;
      const firstToken = queryTokens[0];
      const matchIndex = content.toLowerCase().indexOf(firstToken);
      let snippet = '';
      if (matchIndex !== -1) {
        const start = Math.max(0, matchIndex - 50);
        const end = Math.min(content.length, matchIndex + 200);
        snippet = (start > 0 ? '...' : '') + content.substring(start, end).trim() + (end < content.length ? '...' : '');
      } else {
        snippet = content.substring(0, 200).trim() + '...';
      }

      return {
        chunk: r.chunk,
        score: Number(r.score.toFixed(3)),
        highlightSnippet: snippet,
      };
    });
  }
}
