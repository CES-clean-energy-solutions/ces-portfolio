import type { InnovationArea } from "@ces/content/data/innovation";

interface PdfSectionPageProps {
  section: InnovationArea;
  img1DataUri: string | null;
  img1Caption: string;
  img2DataUri: string | null;
  img2Caption: string;
}

export function PdfSectionPage({
  section,
  img1DataUri,
  img1Caption,
  img2DataUri,
  img2Caption,
}: PdfSectionPageProps) {
  const PAGE_W = 1122;
  const PAGE_H = 794;
  const TITLE_H = 76;
  const BODY_H = PAGE_H - TITLE_H;
  const PAD_X = 48;
  const PAD_Y = 28;
  const COL_GAP = 28;

  const pageStyle: React.CSSProperties = {
    width: `${PAGE_W}px`,
    height: `${PAGE_H}px`,
    backgroundColor: "#0a0a0a",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    color: "#ffffff",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  };

  const titleBarStyle: React.CSSProperties = {
    width: "100%",
    height: `${TITLE_H}px`,
    backgroundColor: "#111111",
    display: "flex",
    alignItems: "center",
    padding: `0 ${PAD_X}px`,
    flexShrink: 0,
    borderBottom: "1px solid #2a2a2a",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "36px",
    fontWeight: "700",
    color: "#D4A843",
    lineHeight: 1.1,
    margin: 0,
    letterSpacing: "-0.01em",
  };

  const bodyStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    flex: 1,
    height: `${BODY_H}px`,
    padding: `${PAD_Y}px ${PAD_X}px`,
    gap: `${COL_GAP}px`,
  };

  // Left column — text content
  const leftColStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    overflow: "hidden",
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: "11px",
    lineHeight: 1.65,
    color: "rgba(255,255,255,0.88)",
    margin: 0,
  };

  const capabilitiesHeaderStyle: React.CSSProperties = {
    fontSize: "10px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#D4A843",
    marginBottom: "10px",
  };

  const capabilityItemStyle: React.CSSProperties = {
    fontSize: "11px",
    color: "rgba(255,255,255,0.8)",
    display: "flex",
    alignItems: "flex-start",
    gap: "6px",
    marginBottom: "6px",
  };

  const bulletStyle: React.CSSProperties = {
    color: "#D4A843",
    fontSize: "13px",
    lineHeight: 1,
    marginTop: "1px",
    flexShrink: 0,
  };

  const dividerStyle: React.CSSProperties = {
    height: "1px",
    backgroundColor: "#2a2a2a",
    margin: "4px 0",
  };

  // Right column — two stacked image blocks
  const rightColStyle: React.CSSProperties = {
    width: "470px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  };

  // Each image block occupies roughly half the available body height
  const IMAGE_H = Math.floor((BODY_H - PAD_Y * 2 - 12) / 2);
  const CAPTION_H = 22;
  const IMG_RENDER_H = IMAGE_H - CAPTION_H;

  const imageBlockStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    height: `${IMAGE_H}px`,
    flexShrink: 0,
  };

  const imageContainerStyle: React.CSSProperties = {
    width: "100%",
    height: `${IMG_RENDER_H}px`,
    overflow: "hidden",
    flexShrink: 0,
  };

  const imgStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  };

  const placeholderStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    backgroundColor: "#1a1a1a",
  };

  const captionStyle: React.CSSProperties = {
    fontSize: "9px",
    color: "#aaaaaa",
    lineHeight: 1.4,
    marginTop: "5px",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  };

  const hasDescription = section.longDescription && section.longDescription.trim();

  return (
    <div style={pageStyle}>
      {/* Title bar */}
      <div style={titleBarStyle}>
        <h1 style={titleStyle}>{section.title}</h1>
      </div>

      {/* Two-column body */}
      <div style={bodyStyle}>
        {/* Left column: description + capabilities */}
        <div style={leftColStyle}>
          <p style={descriptionStyle}>
            {hasDescription
              ? section.longDescription
              : "Content coming soon."}
          </p>

          {section.subItems.length > 0 && (
            <>
              <div style={dividerStyle} />
              <div>
                <div style={capabilitiesHeaderStyle}>Capabilities</div>
                {section.subItems.map((item, index) => (
                  <div key={index} style={capabilityItemStyle}>
                    <span style={bulletStyle}>›</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right column: two images stacked */}
        <div style={rightColStyle}>
          {/* Image 1 */}
          <div style={imageBlockStyle}>
            <div style={imageContainerStyle}>
              {img1DataUri ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img1DataUri} alt="Project image 1" style={imgStyle} />
              ) : (
                <div style={placeholderStyle} />
              )}
            </div>
            {img1Caption && <div style={captionStyle}>{img1Caption}</div>}
          </div>

          {/* Image 2 */}
          <div style={imageBlockStyle}>
            <div style={imageContainerStyle}>
              {img2DataUri ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img2DataUri} alt="Project image 2" style={imgStyle} />
              ) : (
                <div style={placeholderStyle} />
              )}
            </div>
            {img2Caption && <div style={captionStyle}>{img2Caption}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
