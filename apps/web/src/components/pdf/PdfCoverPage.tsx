interface PdfCoverPageProps {
  generatedDate: string;
}

export function PdfCoverPage({ generatedDate }: PdfCoverPageProps) {
  const pageStyle: React.CSSProperties = {
    width: "1122px",
    height: "794px",
    position: "relative",
    backgroundColor: "#000000",
    backgroundImage: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    color: "#ffffff",
    overflow: "hidden",
  };

  const logoStyle: React.CSSProperties = {
    width: "120px",
    height: "96px",
    marginBottom: "32px",
    fill: "#D4A843",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "64px",
    fontWeight: "bold",
    marginBottom: "16px",
    letterSpacing: "-0.02em",
    color: "#ffffff",
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: "24px",
    fontWeight: "normal",
    marginBottom: "8px",
    color: "#D4A843",
  };

  const taglineStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: "300",
    color: "rgba(255, 255, 255, 0.6)",
  };

  const footerStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "40px",
    left: "0",
    right: "0",
    textAlign: "center",
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.4)",
  };

  // Simple SVG chevron (gold arrow)
  const ChevronSVG = () => (
    <svg
      viewBox="0 0 275.52 219.84"
      style={logoStyle}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M137.76 0L275.52 109.92L137.76 219.84L0 109.92L137.76 0Z"
        fill="#D4A843"
      />
    </svg>
  );

  return (
    <div style={pageStyle}>
      <ChevronSVG />
      <h1 style={titleStyle}>CES Portfolio</h1>
      <h2 style={subtitleStyle}>Clean Energy Solutions</h2>
      <p style={taglineStyle}>Engineering Consultancy</p>

      <div style={footerStyle}>
        <div style={{ marginBottom: "4px" }}>
          Generated on {generatedDate}
        </div>
        <div>portfolio.ic-ces.engineering</div>
      </div>
    </div>
  );
}
