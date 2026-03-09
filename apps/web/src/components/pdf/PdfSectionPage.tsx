import type { InnovationArea } from "@ces/content/data/innovation";

interface PdfSectionPageProps {
  section: InnovationArea;
  backgroundImage?: string;
}

export function PdfSectionPage({
  section,
  backgroundImage,
}: PdfSectionPageProps) {
  const pageStyle: React.CSSProperties = {
    width: "1122px",
    height: "794px",
    position: "relative",
    backgroundColor: "#000000",
    backgroundImage: backgroundImage
      ? `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.4) 100%), url(${backgroundImage})`
      : "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    color: "#ffffff",
    padding: "60px 80px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  const contentStyle: React.CSSProperties = {
    display: "flex",
    gap: "60px",
    flex: 1,
  };

  const leftColumnStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  };

  const rightColumnStyle: React.CSSProperties = {
    flex: 1,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "48px",
    fontWeight: "bold",
    marginBottom: "16px",
    color: "#D4A843",
    lineHeight: 1.2,
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: "14px",
    lineHeight: 1.6,
    color: "rgba(255, 255, 255, 0.9)",
  };

  const statsBoxStyle: React.CSSProperties = {
    backgroundColor: "rgba(212, 168, 67, 0.1)",
    border: "1px solid rgba(212, 168, 67, 0.3)",
    borderRadius: "8px",
    padding: "20px",
    marginTop: "auto",
  };

  const statMetricStyle: React.CSSProperties = {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#D4A843",
    marginBottom: "4px",
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.9)",
  };

  const capabilitiesHeaderStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#D4A843",
    marginBottom: "16px",
  };

  const capabilitiesListStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  };

  const capabilityItemStyle: React.CSSProperties = {
    fontSize: "11px",
    color: "rgba(255, 255, 255, 0.8)",
    display: "flex",
    alignItems: "flex-start",
    gap: "6px",
  };

  const bulletStyle: React.CSSProperties = {
    color: "#D4A843",
    fontSize: "14px",
    lineHeight: 1,
    marginTop: "2px",
  };

  const hasStats =
    section.stats.metric !== "TBD" && section.stats.metricLabel !== "TBD";
  const hasContent = section.longDescription && section.longDescription.trim();

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        {/* Left column: Title, Description, Stats */}
        <div style={leftColumnStyle}>
          <div>
            <h1 style={titleStyle}>{section.title}</h1>
            <p style={descriptionStyle}>
              {hasContent
                ? section.longDescription
                : "Content coming soon. This section is currently under development."}
            </p>
          </div>

          {hasStats && (
            <div style={statsBoxStyle}>
              <div style={statMetricStyle}>{section.stats.metric}</div>
              <div style={statLabelStyle}>{section.stats.metricLabel}</div>
              {section.stats.secondary && (
                <div
                  style={{
                    fontSize: "10px",
                    color: "rgba(255, 255, 255, 0.6)",
                    marginTop: "8px",
                  }}
                >
                  {section.stats.secondary}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column: Capabilities */}
        <div style={rightColumnStyle}>
          {section.subItems.length > 0 && (
            <div>
              <h3 style={capabilitiesHeaderStyle}>Capabilities</h3>
              <div style={capabilitiesListStyle}>
                {section.subItems.map((item, index) => (
                  <div key={index} style={capabilityItemStyle}>
                    <span style={bulletStyle}>›</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
