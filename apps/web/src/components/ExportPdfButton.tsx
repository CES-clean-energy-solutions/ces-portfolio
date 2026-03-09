"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import type { InnovationArea } from "@ces/content/data/innovation";

interface ExportPdfButtonProps {
  innovations: InnovationArea[];
  className?: string;
}

export function ExportPdfButton({ innovations, className = "" }: ExportPdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    setIsGenerating(true);
    try {
      // Import pdf generator dynamically to reduce initial bundle size
      const { generatePortfolioPdf } = await import("@/lib/pdf-generator");
      await generatePortfolioPdf(innovations);

      // Success toast will be shown by the generator
    } catch (error) {
      console.error("PDF generation failed:", error);
      // Error toast will be shown by the generator
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isGenerating}
      className={`group flex items-center gap-2 text-white transition-colors hover:text-brand-gold disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      aria-label={isGenerating ? "Generating PDF..." : "Export portfolio as PDF"}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="hidden sm:inline">Generating...</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Print to PDF</span>
        </>
      )}
    </button>
  );
}
