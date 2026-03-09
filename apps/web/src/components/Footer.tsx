"use client";

import { useState } from "react";
import { LegalModal } from "./modals/LegalModal";

const LEGAL_LINKS = [
  { id: "impressum", label: "Impressum" },
  { id: "company-data", label: "Company Data" },
  { id: "data-protection", label: "Data Protection Policy" },
  { id: "compliance", label: "Compliance" },
  { id: "certifications", label: "Certifications" },
] as const;

type LegalLinkId = typeof LEGAL_LINKS[number]["id"];

interface LegalContent {
  title: string;
  content: string;
}

const LEGAL_CONTENT: Record<LegalLinkId, LegalContent> = {
  impressum: {
    title: "Impressum",
    content: `Impressum content will be provided by client.

CES Clean Energy Solutions GmbH
Vienna, Austria

This is placeholder text. Real legal content should be added here including:
- Company registration details
- Managing directors
- VAT ID
- Contact information
- Regulatory authority`,
  },
  "company-data": {
    title: "Company Data",
    content: `Company Data content will be provided by client.

This is placeholder text. Real company information should be added here including:
- Full legal name and address
- Registration numbers
- Bank details (if applicable)
- Insurance information
- Professional memberships`,
  },
  "data-protection": {
    title: "Data Protection Policy",
    content: `Data Protection Policy content will be provided by client.

This is placeholder text. Real privacy policy should be added here compliant with GDPR and local Austrian data protection laws including:
- What data we collect
- How we use your data
- Your rights under GDPR
- How to contact our data protection officer
- Cookie policy (if applicable)
- Third-party processors`,
  },
  compliance: {
    title: "Compliance",
    content: `Compliance content will be provided by client.

This is placeholder text. Real compliance information should be added here including:
- Industry standards we adhere to
- Quality management systems
- Environmental certifications
- Code of conduct
- Anti-corruption policies
- Health and safety standards`,
  },
  certifications: {
    title: "Certifications",
    content: `Certifications content will be provided by client.

This is placeholder text. Real certification information should be added here including:
- ISO certifications (9001, 14001, etc.)
- Industry-specific certifications
- Professional memberships
- Accreditations
- Awards and recognitions`,
  },
};

export default function Footer() {
  const [activeModal, setActiveModal] = useState<LegalLinkId | null>(null);

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
