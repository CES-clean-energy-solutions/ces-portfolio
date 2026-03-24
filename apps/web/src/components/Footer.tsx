"use client";

import React, { useState } from "react";
import { LegalModal } from "./modals/LegalModal";

const LEGAL_LINKS = [
  { id: "impressum", label: "Legal Notice" },
  { id: "company-data", label: "Company Data" },
  { id: "data-protection", label: "Privacy Policy" },
  { id: "compliance", label: "Compliance" },
  { id: "certifications", label: "Certifications" },
] as const;

type LegalLinkId = typeof LEGAL_LINKS[number]["id"];
type Lang = "de" | "en";

interface LegalContent {
  title: string;
  content: string | React.ReactNode;
}

function ImpressumContent() {
  const [lang, setLang] = useState<Lang>("de");

  return (
    <div>
      {/* Language toggle */}
      <div className="mb-6 flex items-center gap-1 text-sm">
        <button
          onClick={() => setLang("de")}
          className={`rounded px-2.5 py-1 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold ${
            lang === "de"
              ? "bg-brand-gold text-black"
              : "text-white/50 hover:text-white"
          }`}
        >
          DE
        </button>
        <span className="text-white/20">/</span>
        <button
          onClick={() => setLang("en")}
          className={`rounded px-2.5 py-1 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold ${
            lang === "en"
              ? "bg-brand-gold text-black"
              : "text-white/50 hover:text-white"
          }`}
        >
          EN
        </button>
        {lang === "en" && (
          <span className="ml-3 text-xs text-white/40 italic">
            The German version is legally binding.
          </span>
        )}
      </div>

      {lang === "de" ? (
        <div className="space-y-5 text-sm leading-relaxed text-white/80">
          <p className="text-white/50">Angaben gemäß § 5 ECG, § 25 MedienG</p>

          <div>
            <p className="font-semibold text-white">CES clean energy solutions GesmbH</p>
            <p>Schönbrunner Straße 297</p>
            <p>1120 Wien, Österreich</p>
          </div>

          <div>
            <p>E-Mail: <a href="mailto:office@ic-ces.at" className="text-brand-gold hover:underline">office@ic-ces.at</a></p>
            <p>Web: <a href="https://ic-ces.at" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">ic-ces.at</a></p>
          </div>

          <div>
            <p><span className="text-white/50">Geschäftsführer:</span> Ing. Andreas Helbl, Dipl.-Ing. Felix Eckert, Dipl.-Ing. Michael Reidlinger</p>
            <p><span className="text-white/50">Unternehmensgegenstand:</span> Ingenieurbüros (Beratende Ingenieure) für technischen Umweltschutz</p>
          </div>

          <div>
            <p><span className="text-white/50">Firmenbuchnummer:</span> FN 320442p</p>
            <p><span className="text-white/50">Firmenbuchgericht:</span> Handelsgericht Wien</p>
            <p><span className="text-white/50">UID-Nummer:</span> ATU 64715133</p>
          </div>

          <div>
            <p><span className="text-white/50">Kammerzugehörigkeit:</span> Wirtschaftskammer Wien</p>
            <p>
              <span className="text-white/50">Anwendbare Rechtsvorschriften:</span>{" "}
              <a
                href="https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10007517"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-gold hover:underline"
              >
                Gewerbeordnung 1994 (GewO 1994)
              </a>
            </p>
            <p><span className="text-white/50">Aufsichtsbehörde:</span> Magistratisches Bezirksamt des XII. Bezirks</p>
          </div>

          <div>
            <p><span className="text-white/50">Inhaltlich Verantwortlicher gemäß § 55 Abs. 2 RStV:</span> Ing. Andreas Helbl</p>
          </div>

          <div>
            <p><span className="text-white/50">Bildnachweis:</span> iC Archives, CES Archives, iStockPhoto</p>
          </div>

          <div className="border-t border-white/10 pt-4">
            <p className="mb-1 font-medium text-white">Haftungsausschluss</p>
            <p>
              Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Für die Inhalte externer Links übernehmen wir keine Haftung. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-5 text-sm leading-relaxed text-white/80">
          <p className="text-white/50">Information pursuant to § 5 ECG (Austrian E-Commerce Act), § 25 MedienG (Austrian Media Act)</p>

          <div>
            <p className="font-semibold text-white">CES clean energy solutions GesmbH</p>
            <p>Schönbrunner Straße 297</p>
            <p>1120 Vienna, Austria</p>
          </div>

          <div>
            <p>Email: <a href="mailto:office@ic-ces.at" className="text-brand-gold hover:underline">office@ic-ces.at</a></p>
            <p>Web: <a href="https://ic-ces.at" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">ic-ces.at</a></p>
          </div>

          <div>
            <p><span className="text-white/50">Managing Directors:</span> Ing. Andreas Helbl, Dipl.-Ing. Felix Eckert, Dipl.-Ing. Michael Reidlinger</p>
            <p><span className="text-white/50">Business Activity:</span> Engineering consultancy for technical environmental protection</p>
          </div>

          <div>
            <p><span className="text-white/50">Company Register Number:</span> FN 320442p</p>
            <p><span className="text-white/50">Company Register Court:</span> Vienna Commercial Court (Handelsgericht Wien)</p>
            <p><span className="text-white/50">VAT ID:</span> ATU 64715133</p>
          </div>

          <div>
            <p><span className="text-white/50">Chamber Membership:</span> Vienna Chamber of Commerce (Wirtschaftskammer Wien)</p>
            <p>
              <span className="text-white/50">Applicable Regulations:</span>{" "}
              <a
                href="https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10007517"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-gold hover:underline"
              >
                Austrian Trade Act 1994 (Gewerbeordnung 1994)
              </a>
            </p>
            <p><span className="text-white/50">Supervisory Authority:</span> Magistratisches Bezirksamt des XII. Bezirks</p>
          </div>

          <div>
            <p><span className="text-white/50">Responsible for Content:</span> Ing. Andreas Helbl</p>
          </div>

          <div>
            <p><span className="text-white/50">Photo Credits:</span> iC Archives, CES Archives, iStockPhoto</p>
          </div>

          <div className="border-t border-white/10 pt-4">
            <p className="mb-1 font-medium text-white">Disclaimer</p>
            <p>
              The contents of this website have been prepared with the greatest possible care. However, we cannot accept any liability for the accuracy, completeness, or timeliness of the content. We accept no liability for the content of external links. The operators of linked pages are solely responsible for their content.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function DataProtectionContent() {
  const [lang, setLang] = useState<Lang>("de");

  return (
    <div>
      {/* Language toggle */}
      <div className="mb-6 flex items-center gap-1 text-sm">
        <button
          onClick={() => setLang("de")}
          className={`rounded px-2.5 py-1 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold ${
            lang === "de"
              ? "bg-brand-gold text-black"
              : "text-white/50 hover:text-white"
          }`}
        >
          DE
        </button>
        <span className="text-white/20">/</span>
        <button
          onClick={() => setLang("en")}
          className={`rounded px-2.5 py-1 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold ${
            lang === "en"
              ? "bg-brand-gold text-black"
              : "text-white/50 hover:text-white"
          }`}
        >
          EN
        </button>
        {lang === "en" && (
          <span className="ml-3 text-xs text-white/40 italic">
            The German version is legally binding.
          </span>
        )}
      </div>

      {lang === "de" ? (
        <div className="space-y-6 text-sm leading-relaxed text-white/80">

          <section>
            <h3 className="mb-2 font-semibold text-white">1. Verantwortlicher</h3>
            <p>CES clean energy solutions GesmbH</p>
            <p>Schönbrunner Straße 297</p>
            <p>1120 Wien, Österreich</p>
            <p>E-Mail: <a href="mailto:office@ic-ces.at" className="text-brand-gold hover:underline">office@ic-ces.at</a></p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-white">2. Grundsätze der Datenverarbeitung</h3>
            <p>Wir verarbeiten personenbezogene Daten nur im Einklang mit der Datenschutz-Grundverordnung (DSGVO) und dem österreichischen Datenschutzgesetz (DSG). Personenbezogene Daten werden nur erhoben, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-white">3. Zugriffsdaten / Server-Logfiles</h3>
            <p className="mb-2">Bei jedem Zugriff auf unsere Website werden automatisch Daten durch den Webserver erfasst (sog. Server-Logfiles):</p>
            <ul className="ml-4 list-disc space-y-1 text-white/70">
              <li>Browsertyp und -version</li>
              <li>Verwendetes Betriebssystem</li>
              <li>Referrer-URL (zuvor besuchte Seite)</li>
              <li>IP-Adresse des zugreifenden Rechners</li>
              <li>Uhrzeit der Serveranfrage</li>
            </ul>
            <p className="mt-2">Diese Daten sind nicht bestimmten Personen zuordenbar. Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Die Daten werden nach einer statistischen Auswertung gelöscht.</p>
            <p className="mt-2 text-white/50 text-xs">Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Sicherstellung eines störungsfreien Betriebs der Website).</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-white">4. Kontaktaufnahme</h3>
            <p>Wenn Sie uns per E-Mail oder über das Kontaktformular kontaktieren, werden die von Ihnen mitgeteilten Daten (Name, E-Mail-Adresse, ggf. Telefonnummer, Inhalt der Nachricht) von uns gespeichert, um Ihre Anfrage zu bearbeiten. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.</p>
            <p className="mt-2 text-white/50 text-xs">Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen) bzw. Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Beantwortung von Anfragen).</p>
            <p className="mt-1 text-white/50 text-xs">Speicherdauer: Ihre Daten werden nach abschließender Bearbeitung Ihrer Anfrage gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-white">5. Cookies</h3>
            <p className="mb-2">Unsere Website verwendet Cookies. Dabei handelt es sich um kleine Textdateien, die Ihr Webbrowser auf Ihrem Endgerät speichert.</p>
            <p className="font-medium text-white/90">a) Technisch notwendige Cookies</p>
            <p>Diese Cookies sind für den Betrieb der Website erforderlich und können nicht deaktiviert werden.</p>
            <p className="mt-1 text-white/50 text-xs">Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-white">6. SSL-Verschlüsselung</h3>
            <p>Diese Website nutzt aus Sicherheitsgründen eine SSL-Verschlüsselung (HTTPS) für die Übertragung vertraulicher Inhalte.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-white">7. Ihre Rechte</h3>
            <p className="mb-2">Sie haben folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:</p>
            <ul className="ml-4 list-disc space-y-1 text-white/70">
              <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
              <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
              <li>Recht auf Löschung (Art. 17 DSGVO)</li>
              <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
            </ul>
            <p className="mt-2">Zur Ausübung Ihrer Rechte wenden Sie sich bitte an: <a href="mailto:office@ic-ces.at" className="text-brand-gold hover:underline">office@ic-ces.at</a></p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-white">8. Beschwerderecht</h3>
            <p>Sie haben das Recht, bei der österreichischen Datenschutzbehörde (DSB) Beschwerde einzureichen:</p>
            <div className="mt-2 text-white/70">
              <p>Österreichische Datenschutzbehörde</p>
              <p>Barichgasse 40–42</p>
              <p>1030 Wien</p>
              <p><a href="https://www.dsb.gv.at" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">dsb.gv.at</a></p>
            </div>
          </section>

        </div>
      ) : (
        <div className="space-y-6 text-sm leading-relaxed text-white/80">

          <section>
            <h3 className="mb-2 font-semibold text-white">1. Data Controller</h3>
            <p>CES clean energy solutions GesmbH</p>
            <p>Schönbrunner Straße 297</p>
            <p>1120 Vienna, Austria</p>
            <p>Email: <a href="mailto:office@ic-ces.at" className="text-brand-gold hover:underline">office@ic-ces.at</a></p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-white">2. Principles of Data Processing</h3>
            <p>We process personal data only in accordance with the General Data Protection Regulation (GDPR) and the Austrian Data Protection Act (DSG). Personal data is collected only to the extent necessary to provide a functional website and our content and services.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-white">3. Access Data / Server Log Files</h3>
            <p className="mb-2">Each time our website is accessed, data is automatically collected by the web server (server log files):</p>
            <ul className="ml-4 list-disc space-y-1 text-white/70">
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Referrer URL (previously visited page)</li>
              <li>IP address of the accessing computer</li>
              <li>Time of the server request</li>
            </ul>
            <p className="mt-2">This data cannot be attributed to specific individuals. This data is not combined with other data sources. The data is deleted after statistical analysis.</p>
            <p className="mt-2 text-white/50 text-xs">Legal basis: Art. 6(1)(f) GDPR (legitimate interest in ensuring trouble-free operation of the website).</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-white">4. Contact</h3>
            <p>When you contact us by email or via the contact form, the data you provide (name, email address, telephone number if applicable, content of the message) will be stored by us in order to process your enquiry. We will not share this data without your consent.</p>
            <p className="mt-2 text-white/50 text-xs">Legal basis: Art. 6(1)(b) GDPR (pre-contractual measures) or Art. 6(1)(f) GDPR (legitimate interest in responding to enquiries).</p>
            <p className="mt-1 text-white/50 text-xs">Storage period: Your data will be deleted after your enquiry has been fully processed, unless statutory retention obligations apply.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-white">5. Cookies</h3>
            <p className="mb-2">Our website uses cookies. These are small text files that your web browser stores on your device.</p>
            <p className="font-medium text-white/90">a) Technically necessary cookies</p>
            <p>These cookies are required for the operation of the website and cannot be deactivated.</p>
            <p className="mt-1 text-white/50 text-xs">Legal basis: Art. 6(1)(f) GDPR.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-white">6. SSL Encryption</h3>
            <p>For security reasons, this website uses SSL encryption (HTTPS) for the transmission of confidential content.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-white">7. Your Rights</h3>
            <p className="mb-2">You have the following rights regarding your personal data:</p>
            <ul className="ml-4 list-disc space-y-1 text-white/70">
              <li>Right of access (Art. 15 GDPR)</li>
              <li>Right to rectification (Art. 16 GDPR)</li>
              <li>Right to erasure (Art. 17 GDPR)</li>
              <li>Right to restriction of processing (Art. 18 GDPR)</li>
              <li>Right to data portability (Art. 20 GDPR)</li>
              <li>Right to object (Art. 21 GDPR)</li>
            </ul>
            <p className="mt-2">To exercise your rights, please contact: <a href="mailto:office@ic-ces.at" className="text-brand-gold hover:underline">office@ic-ces.at</a></p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-white">8. Right to Lodge a Complaint</h3>
            <p>You have the right to lodge a complaint with the Austrian Data Protection Authority (DSB):</p>
            <div className="mt-2 text-white/70">
              <p>Österreichische Datenschutzbehörde</p>
              <p>Barichgasse 40–42</p>
              <p>1030 Vienna, Austria</p>
              <p><a href="https://www.dsb.gv.at" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">dsb.gv.at</a></p>
            </div>
          </section>

        </div>
      )}
    </div>
  );
}

const LEGAL_CONTENT: Record<LegalLinkId, LegalContent> = {
  impressum: {
    title: "Legal Notice",
    content: <ImpressumContent />,
  },
  "company-data": {
    title: "Company Data",
    content: `CES clean energy solutions GesmbH

Company Registration
Registration Number: FN 320442p
Court of Registration: Vienna Commercial Court (Handelsgericht Wien)
VAT ID: ATU 64715133

Registered Office
Schönbrunner Straße 297
1120 Vienna, Austria

Contact
Email: office@ic-ces.at
Web: ic-ces.at

This information is provided in accordance with Austrian e-Commerce and media laws and the Austrian Trade Act.`,
  },
  "data-protection": {
    title: "Privacy Policy",
    content: <DataProtectionContent />,
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
