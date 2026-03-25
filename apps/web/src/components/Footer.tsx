"use client";

import { useState } from "react";
import { LegalModal } from "./modals/LegalModal";
import { LEGAL_CONTENT, LEGAL_LINKS, type LegalContentId } from "@/lib/legal-content";

export default function Footer() {
  const [activeModal, setActiveModal] = useState<LegalContentId | null>(null);

  return (
    <>
      <footer className="border-t border-white/10 bg-brand-black px-4 py-12">
        <div className="mx-auto max-w-7xl">
          {/* Legal links */}
          <nav
            className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm"
            aria-label="Legal information"
          >
            {LEGAL_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => setActiveModal(link.id)}
                className="text-white/60 transition-colors hover:text-brand-gold focus-visible:text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Copyright */}
          <p className="mt-8 text-center text-sm text-white/40">
            &copy; {new Date().getFullYear()} CES Clean Energy Solutions
          </p>
        </div>
      </footer>

      {/* Legal modal */}
      {activeModal && (
        <LegalModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title={LEGAL_CONTENT[activeModal].title}
          content={LEGAL_CONTENT[activeModal].content}
        />
      )}
    </>
  );
}
