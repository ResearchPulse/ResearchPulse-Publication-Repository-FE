'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface NativePdfViewerProps {
  url: string;
  fileName?: string;
}

export function NativePdfViewer({ url, fileName }: NativePdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [containerWidth, setContainerWidth] = useState<number>(850);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function updateWidth() {
      if (containerRef.current) {
        // Leave comfortable padding around the paper
        const measured = containerRef.current.clientWidth - 48;
        if (measured > 300) {
          setContainerWidth(Math.min(measured, 950));
        }
      }
    }

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.15, 2.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.15, 0.6));
  const resetZoom = () => setScale(1.0);

  return (
    <div className="native-pdf-wrapper" ref={containerRef}>
      {/* Clean Single-Row Document Control Bar */}
      <div className="native-pdf-toolbar">
        <div className="native-pdf-toolbar__left">
          <div className="native-pdf-toolbar__file-badge" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
          </div>
          <span className="native-pdf-toolbar__title" title={fileName || 'manuscript.pdf'}>
            {fileName || 'Manuscript Document'}
          </span>
          {numPages && (
            <span className="native-pdf-toolbar__pages">
              {numPages} {numPages === 1 ? 'page' : 'pages'}
            </span>
          )}
        </div>

        <div className="native-pdf-toolbar__right">
          {/* Zoom controls */}
          <div className="native-pdf-toolbar__zoom">
            <button
              type="button"
              className="native-pdf-btn native-pdf-btn--icon"
              onClick={zoomOut}
              disabled={scale <= 0.6}
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <span className="native-pdf-zoom-val">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              className="native-pdf-btn native-pdf-btn--icon"
              onClick={zoomIn}
              disabled={scale >= 2.0}
              title="Zoom In"
              aria-label="Zoom In"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          <div className="native-pdf-toolbar__divider" aria-hidden="true" />

          {/* Action buttons */}
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="native-pdf-btn native-pdf-btn--outline"
            title="Open PDF in new browser tab"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            <span>Open Tab</span>
          </a>

          <a
            href={url}
            download={fileName || 'manuscript.pdf'}
            className="native-pdf-btn native-pdf-btn--primary"
            title="Download PDF"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download</span>
          </a>
        </div>
      </div>

      {/* Direct Paper Stream on Clean Background */}
      <div className="native-pdf-document-canvas">
        <Document
          file={`/api/pdf-proxy?url=${encodeURIComponent(url)}`}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="native-pdf-loading">
              <div className="student-spinner" />
              <p>Rendering manuscript pages…</p>
            </div>
          }
          error={
            <div className="native-pdf-error">
              <p>Unable to render PDF directly.</p>
              <a href={url} target="_blank" rel="noreferrer" className="student-btn student-btn--primary">
                Open / Download PDF
              </a>
            </div>
          }
        >
          {numPages &&
            Array.from(new Array(numPages), (_, index) => (
              <div key={`page_${index + 1}`} className="native-pdf-page-card">
                <div className="native-pdf-page-badge">
                  Page {index + 1} of {numPages}
                </div>
                <Page
                  pageNumber={index + 1}
                  width={containerWidth * scale}
                  renderAnnotationLayer={false}
                  renderTextLayer={true}
                  className="native-pdf-rendered-page"
                />
              </div>
            ))}
        </Document>
      </div>
    </div>
  );
}

export default NativePdfViewer;
