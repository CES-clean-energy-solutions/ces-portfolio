import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import type { InnovationArea } from "@ces/content/data/innovation";
import { PdfCoverPage } from "@/components/pdf/PdfCoverPage";
import { PdfSectionPage } from "@/components/pdf/PdfSectionPage";
import { PdfContactPage } from "@/components/pdf/PdfContactPage";
import { PdfImpressumPage } from "@/components/pdf/PdfImpressumPage";

// Constants for PDF dimensions (landscape A4)
const PDF_WIDTH = 297; // mm
const PDF_HEIGHT = 210; // mm
const PAGE_WIDTH_PX = 1122; // px at 96 DPI
const PAGE_HEIGHT_PX = 794; // px at 96 DPI

// Contact and legal content
const CONTACT_CONTENT = {
  whoWeAre: `CES Clean Energy Solutions is a Vienna-based engineering consultancy specializing in sustainable urban development, energy efficiency, and environmental engineering. Our multidisciplinary team combines deep technical expertise with innovative digital methods to deliver integrated solutions for the built environment.`,
  howWeWork: `We operate at the intersection of engineering and technology, leveraging BIM, computational simulation, and data-driven design to optimize building performance. Our collaborative approach ensures seamless integration with architectural teams, contractors, and stakeholders throughout project lifecycles.`,
};

const LEGAL_CONTENT = {
  companyData: `CES Clean Energy Solutions GmbH\nCommercial Register: FN 12345x\nUID: ATU12345678\nVienna Commercial Court\n\nManaging Director: [Name]\nRegistered Office: Vienna, Austria\n\nContact:\nEmail: office@ic-ces.engineering\nPhone: +43 (0) 1234 5678\nWeb: portfolio.ic-ces.engineering`,
  impressum: `Content Responsibility:\nCES Clean Energy Solutions GmbH\n\nDisclaimer:\nAll information provided on this website and in associated materials is for general informational purposes only. While we strive for accuracy, we make no warranties about the completeness, reliability, or suitability of the information.\n\nCopyright:\n© 2026 CES Clean Energy Solutions GmbH. All rights reserved.\n\nData Protection:\nWe process personal data in accordance with GDPR. For details, see our privacy policy at portfolio.ic-ces.engineering`,
};

/**
 * Load an image as base64 data URI
 */
async function loadImageAsDataUri(imagePath: string): Promise<string | null> {
  try {
    const response = await fetch(imagePath);
    if (!response.ok) throw new Error(`Failed to load image: ${imagePath}`);

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn(`Failed to load image ${imagePath}:`, error);
    return null;
  }
}

/**
 * Render a React component to a DOM element
 */
async function renderComponent(
  component: React.ReactElement,
  container: HTMLElement
): Promise<void> {
  return new Promise((resolve) => {
    const root = createRoot(container);
    root.render(component);
    // Give React time to render
    setTimeout(() => {
      resolve();
      // Don't unmount - we need the DOM for html2canvas
    }, 100);
  });
}

/**
 * Capture a DOM element as a canvas
 */
async function captureAsCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(element, {
    scale: 2, // Higher quality for printing
    useCORS: true,
    allowTaint: false,
    backgroundColor: null,
    width: PAGE_WIDTH_PX,
    height: PAGE_HEIGHT_PX,
    windowWidth: PAGE_WIDTH_PX,
    windowHeight: PAGE_HEIGHT_PX,
  });
}

/**
 * Show a toast notification
 */
function showToast(message: string, type: "success" | "error" = "success") {
  // Simple console logging for now - could be enhanced with actual toast UI
  if (type === "success") {
    console.log(`✅ ${message}`);
  } else {
    console.error(`❌ ${message}`);
  }
  // TODO: Replace with actual toast notification when UI library is available
}

/**
 * Check browser compatibility
 */
function checkBrowserCompatibility(): boolean {
  const hasCanvas = !!document.createElement("canvas").getContext;
  const hasBlob = typeof Blob !== "undefined";

  if (!hasCanvas || !hasBlob) {
    showToast(
      "Your browser doesn't support PDF export. Please use a modern browser.",
      "error"
    );
    return false;
  }

  return true;
}

/**
 * Main PDF generation function
 */
export async function generatePortfolioPdf(innovations: InnovationArea[]): Promise<void> {
  const startTime = performance.now();

  // Check browser compatibility
  if (!checkBrowserCompatibility()) {
    return;
  }

  try {
    console.log("Starting PDF generation...");

    // Create hidden container for rendering
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";
    document.body.appendChild(container);

    // Create PDF document
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    let pageCount = 0;

    // 1. Cover page
    console.log("Generating cover page...");
    const coverContainer = document.createElement("div");
    container.appendChild(coverContainer);

    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    await renderComponent(
      createElement(PdfCoverPage, { generatedDate: currentDate }),
      coverContainer
    );

    const coverCanvas = await captureAsCanvas(coverContainer);
    const coverImage = coverCanvas.toDataURL("image/jpeg", 0.85);

    if (pageCount > 0) pdf.addPage();
    pdf.addImage(coverImage, "JPEG", 0, 0, PDF_WIDTH, PDF_HEIGHT);
    pageCount++;
    console.log(`✓ Cover page added (${pageCount})`);

    // 2. Innovation section pages
    for (const section of innovations) {
      console.log(`Generating section: ${section.title}...`);

      const sectionContainer = document.createElement("div");
      container.appendChild(sectionContainer);

      // Load background image
      let backgroundImage: string | undefined;
      if (section.images.length > 0 && section.images[0].src) {
        const imagePath = `/content/innovation/${section.id}/main-bg.${section.images[0].src.split(".").pop()}`;
        const dataUri = await loadImageAsDataUri(imagePath);
        if (dataUri) {
          backgroundImage = dataUri;
        }
      }

      await renderComponent(
        createElement(PdfSectionPage, { section, backgroundImage }),
        sectionContainer
      );

      const sectionCanvas = await captureAsCanvas(sectionContainer);
      const sectionImage = sectionCanvas.toDataURL("image/jpeg", 0.85);

      pdf.addPage();
      pdf.addImage(sectionImage, "JPEG", 0, 0, PDF_WIDTH, PDF_HEIGHT);
      pageCount++;
      console.log(`✓ Section page added: ${section.title} (${pageCount})`);

      // Clean up section container
      sectionContainer.remove();
    }

    // 3. Contact page
    console.log("Generating contact page...");
    const contactContainer = document.createElement("div");
    container.appendChild(contactContainer);

    await renderComponent(
      createElement(PdfContactPage, {
        whoWeAre: CONTACT_CONTENT.whoWeAre,
        howWeWork: CONTACT_CONTENT.howWeWork,
      }),
      contactContainer
    );

    const contactCanvas = await captureAsCanvas(contactContainer);
    const contactImage = contactCanvas.toDataURL("image/jpeg", 0.85);

    pdf.addPage();
    pdf.addImage(contactImage, "JPEG", 0, 0, PDF_WIDTH, PDF_HEIGHT);
    pageCount++;
    console.log(`✓ Contact page added (${pageCount})`);

    // 4. Impressum page
    console.log("Generating impressum page...");
    const impressumContainer = document.createElement("div");
    container.appendChild(impressumContainer);

    await renderComponent(
      createElement(PdfImpressumPage, {
        companyData: LEGAL_CONTENT.companyData,
        impressum: LEGAL_CONTENT.impressum,
      }),
      impressumContainer
    );

    const impressumCanvas = await captureAsCanvas(impressumContainer);
    const impressumImage = impressumCanvas.toDataURL("image/jpeg", 0.85);

    pdf.addPage();
    pdf.addImage(impressumImage, "JPEG", 0, 0, PDF_WIDTH, PDF_HEIGHT);
    pageCount++;
    console.log(`✓ Impressum page added (${pageCount})`);

    // Clean up container
    container.remove();

    // Save PDF
    const filename = "CES Portfolio.pdf";
    pdf.save(filename);

    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`✅ PDF generated successfully!`);
    console.log(`   Pages: ${pageCount}`);
    console.log(`   Duration: ${duration}s`);
    console.log(`   File size: ~${(pdf.output("blob").size / 1024 / 1024).toFixed(2)} MB`);

    showToast("PDF downloaded successfully", "success");
  } catch (error) {
    console.error("PDF generation failed:", error);
    showToast(
      "Failed to generate PDF. Please try again or use a modern browser.",
      "error"
    );
    throw error;
  }
}
