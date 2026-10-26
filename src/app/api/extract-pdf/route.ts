import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file was provided for extraction.' },
        { status: 400 }
      );
    }

    const filename = file.name || 'document.pdf';
    const isPdf =
      filename.toLowerCase().endsWith('.pdf') ||
      file.type === 'application/pdf';

    // Handle plain text or markdown files directly
    if (!isPdf) {
      const text = await file.text();
      if (!text || !text.trim()) {
        return NextResponse.json(
          { success: false, error: 'The uploaded file is empty.' },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        text: text.trim(),
        pageCount: Math.max(1, Math.ceil(text.length / 1500)),
        filename,
      });
    }

    // Extract PDF text
    const arrayBuffer = await file.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return NextResponse.json(
        { success: false, error: 'The uploaded PDF file is empty (0 bytes).' },
        { status: 400 }
      );
    }

    const uint8Array = new Uint8Array(arrayBuffer);

    // Use pdfjs-dist legacy build for Node.js compatibility
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');

    const loadingTask = pdfjs.getDocument({
      data: uint8Array,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });

    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages || 1;
    const pageTexts: string[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((item: any) => (item && typeof item.str === 'string' ? item.str : ''))
        .filter(Boolean)
        .join(' ');

      if (pageText && pageText.trim()) {
        pageTexts.push(pageText.trim());
      }
    }

    const fullText = pageTexts.join('\n\n');

    // Check if the PDF has extractable text or is purely a scanned image
    if (!fullText || fullText.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error:
            'This PDF appears to be a scanned image or contains no extractable text. Please upload a text-based PDF or paste the text content directly.',
        },
        { status: 422 }
      );
    }

    // Extra safeguard: Ensure no raw binary markers were captured
    if (fullText.startsWith('%PDF-') || fullText.includes('endobj') || fullText.includes('/FontDescriptor')) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Unable to extract readable text from this PDF. Please upload a clean text-based PDF or paste the text content.',
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      text: fullText.trim(),
      pageCount: numPages,
      filename,
    });
  } catch (error: any) {
    console.error('PDF text extraction error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          'Could not extract text from this PDF file. It may be encrypted or corrupted. Please upload a standard text PDF or paste the text directly.',
      },
      { status: 500 }
    );
  }
}
