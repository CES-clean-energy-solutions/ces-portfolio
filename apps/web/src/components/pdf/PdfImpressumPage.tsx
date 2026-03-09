interface PdfImpressumPageProps {
  companyData: string;
  impressum: string;
}

export function PdfImpressumPage({
  companyData,
  impressum,
}: PdfImpressumPageProps) {
  const pageStyle: React.CSSProperties = {
    width: "1122px",
    height: "794px",
    backgroundColor: "#ffffff",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    color: "#000000",
    padding: "60px 80px",
    display: "flex",
    flexDirection: "column",
    gap: "40px",
  };

  const headerStyle: React.CSSProperties = {
    fontSize: "48px",
    fontWeight: "bold",
    color: "#000000",
    marginBottom: "40px",
    paddingBottom: "20px",
    borderBottom: "3px solid #D4A843",
  };

  const columnsStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "40px",
    flex: 1,
  };

  const columnStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  };

  const columnHeaderStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: "600",
    color: "#D4A843",
    marginBottom: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const textStyle: React.CSSProperties = {
    fontSize: "11px",
    lineHeight: 1.6,
    color: "#333333",
    whiteSpace: "pre-wrap",
  };

  const footerStyle: React.CSSProperties = {
    fontSize: "10px",
    color: "#666666",
    textAlign: "center",
    marginTop: "auto",
    paddingTop: "20px",
    borderTop: "1px solid #E5E5E5",
  };

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>Legal Information</h1>

      <div style={columnsStyle}>
        {/* Company Data Column */}
        <div style={columnStyle}>
          <h3 style={columnHeaderStyle}>Company Data</h3>
          <div style={textStyle}>{companyData}</div>
        </div>

        {/* Impressum Column */}
        <div style={columnStyle}>
          <h3 style={columnHeaderStyle}>Impressum</h3>
          <div style={textStyle}>{impressum}</div>
        </div>
      </div>

      <div style={footerStyle}>
        Generated from portfolio.ic-ces.engineering
      </div>
    </div>
  );
}
