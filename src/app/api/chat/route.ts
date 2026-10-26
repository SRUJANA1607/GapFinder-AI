import { NextRequest, NextResponse } from 'next/server';
import { GeminiRAGService } from '@/lib/rag/gemini';
import { SimpleVectorStore } from '@/lib/rag/vector-store';
import { chunkDocument } from '@/lib/rag/chunker';
import { DEMO_DOCUMENTS } from '@/lib/demo-data';

// Server-side vector store seeded with demo materials
let serverVectorStore: SimpleVectorStore | null = null;

function getServerVectorStore(): SimpleVectorStore {
  if (!serverVectorStore) {
    serverVectorStore = new SimpleVectorStore();
    for (const doc of DEMO_DOCUMENTS) {
      const chunks = chunkDocument(doc);
      serverVectorStore.addChunks(chunks);
    }
  }
  return serverVectorStore;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, customChunks, apiKey } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const vectorStore = getServerVectorStore();
    if (customChunks && Array.isArray(customChunks) && customChunks.length > 0) {
      vectorStore.addChunks(customChunks);
    }

    // Retrieve top 4 most relevant chunks
    const searchResults = vectorStore.search(query, 4);

    const clientApiKey = apiKey || req.headers.get('x-gemini-key') || process.env.GEMINI_API_KEY;
    const ragService = new GeminiRAGService(clientApiKey || undefined);

    const result = await ragService.explainWithRAG(query, searchResults);

    return NextResponse.json({
      success: true,
      answer: result.answer,
      citations: result.citations,
      modelUsed: result.modelUsed,
      retrievedChunksCount: searchResults.length,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
