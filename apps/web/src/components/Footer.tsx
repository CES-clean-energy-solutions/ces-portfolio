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
    content: `Company Information

CES Clean Energy Solutions GmbH
Vienna, Austria

VAT ID: ATU 64715133
Company Registration No.: FN 320442p
Court of Registration: Vienna Commercial Court (Handelsgericht Wien)

Further compulsory company information according to Austrian e-Commerce and media laws and according to Austrian Trade Act.

Disclaimer: The contents of this website were prepared with highest possible accuracy. However, we cannot accept any liability for the information contained and especially for the weblinks to external websites including the information available there.

Responsible for the content: Mr. Klaus Kogler

Photo Credits: iC Archives, CES Archives, iStockPhoto`,
  },
  "company-data": {
    title: "Company Data",
    content: `CES Clean Energy Solutions GmbH

Company Registration
Registration Number: FN 320442p
Court of Registration: Vienna Commercial Court (Handelsgericht Wien)
VAT ID: ATU 64715133

Registered Office
Vienna, Austria

Contact
Responsible for content: Mr. Klaus Kogler
Email: k.kogler@ic-ces.at
Phone: +43 664 601 692 32

This information is provided in accordance with Austrian e-Commerce and media laws and the Austrian Trade Act.`,
  },
  "data-protection": {
    title: "Data Protection Policy",
    content: `Data Protection Regulation

[NOTE: Full data protection policy content to be provided by client]

CES Clean Energy Solutions GmbH is committed to protecting your personal data in accordance with the General Data Protection Regulation (GDPR) and Austrian data protection laws.

This section should include:
- What personal data we collect and how we collect it
- Legal basis for processing your data
- How we use your data
- Your rights under GDPR (access, rectification, erasure, restriction, portability, objection)
- Data retention periods
- Data security measures
- Third-party data processors
- Cookie policy
- Contact information for our Data Protection Officer
- How to lodge a complaint with the supervisory authority

For questions regarding data protection, please contact Mr. Klaus Kogler.`,
  },
  compliance: {
    title: "Compliance Policy",
    content: `CES Clean Energy Solutions pursues the principle of conducting its business activities exclusively in accordance with the applicable laws, rules and regulations. However, this compliance does not only mean adherence to the law, but also the maintenance of corporate principles and ethics.

The task of the corporate philosophy is to cultivate a culture that promotes ethical behaviour and strict compliance with the law while making every effort to prevent and uncover misconduct.

Compliance Management System (CMS)

The basis for this is the Compliance Management System with the following main points:

• Misconduct such as fraud, corruption, bribery, unfair agreements, coercion or obstruction will not be tolerated in any way.

• Benefits or inducements (gifts, entertainment, travel, expenses) that may improperly influence will neither be accepted nor provided.

• All business transactions and cash flows are documented conscientiously and comprehensibly by means of detailed and comprehensive accounting.

• Continuous and structured measures are taken to prevent possible misconduct by staff and business partners.

• Additional review/approval processes are in place for donations, sponsorship and party funding.

• Reports of possible misconduct can be submitted to the Compliance Officer confidentially and anonymously via a secure internet link. Reports made via this link cannot be traced; if queries are required, please contact the Compliance Officer at the email address provided.

Business partners of CES undertake to conduct their business in accordance with this programme. Violations of this entitle to the cancellation of contractual agreements.

Policy Statement

It is the policy of CES to conduct its business activities strictly in accordance with all applicable laws, rules and regulations. This refers not only to compliance with the law, but the policy is also applicable to the maintenance of business principle and business ethics. The objective of the company's philosophy is to foster a culture which promotes ethical behaviour and strict compliance with the law and to make every effort to prevent and detect misconduct.

Key Principles:
• Any form of misconduct such as fraudulent, corrupt, collusive, coercive or obstructive practices will not be tolerated in any way.
• It is prohibited to accept or to pay for any gifts, entertainment and hospitality- or travel expenses which may be deemed to improperly affect the outcome of a business transaction or otherwise result in an improper advantage.
• It is obligatory to maintain accurate, detailed and comprehensive records of all business transactions and payments.
• Continuous and structured measures will be taken to prevent possible misconduct by individuals and business partners.
• A special review and approval is necessary for all charitable donations, sponsorships or political contributions.
• Any misconduct must to be reported immediately to the business partner.

The Parties undertake to conduct their business in accordance with this program. Possible misdemeanor entitles to extraordinary termination of a contractual agreement.`,
  },
  certifications: {
    title: "Certifications",
    content: `ISO Certificates

CES Clean Energy Solutions GmbH holds the following ISO certifications through Bureau Veritas:

ISO 9001 - Quality Management System
ISO 9001 certification by Bureau Veritas is an effective tool for managing quality processes within companies, continuously improving company performance and fulfilling customer expectations in the best possible way. A quality management system (QMS) certified in accordance with ISO 9001 makes a decisive contribution to increasing the quality of products and services along the entire value chain and to sustainably promoting business success.

ISO 14001 - Environmental Management System
By systematically introducing and certifying an environmental management system (EMS) in accordance with ISO 14001, organisations visibly demonstrate their commitment to the environment, confirm their compliance with environmental legal requirements and sustainably improve their environmental performance. In this way, organisations lay the foundations for the responsible management of tomorrow, which firmly integrates environmental protection into the strategic orientation and operational implementation of business processes.

ISO 45001 - Occupational Health and Safety Management
As an occupational health and safety certification, ISO 45001:2018 offers suitable tools to reduce risks, accidents and work-related illnesses in the company at all levels. It was finalised in 2018 as the world's first uniform standard for occupational health and safety management and replaced the previous standard BS OHSAS 18001:2007.

These certifications demonstrate our commitment to quality, environmental sustainability, and workplace safety across all our operations.`,
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
