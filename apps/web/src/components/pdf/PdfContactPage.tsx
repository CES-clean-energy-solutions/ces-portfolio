interface PdfContactPageProps {
  contactInfo?: {
    email: string;
    phone: string;
    address: string;
  };
  whoWeAre: string;
  howWeWork: string;
}

export function PdfContactPage({
  contactInfo = {
    email: "office@ic-ces.engineering",
    phone: "+43 (0) 1234 5678",
    address: "Vienna, Austria",
  },
  whoWeAre,
  howWeWork,
}: PdfContactPageProps) {
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
    gridTemplateColumns: "1fr 1fr 1fr",
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
    fontSize: "12px",
    lineHeight: 1.6,
    color: "#333333",
  };

  const contactItemStyle: React.CSSProperties = {
    fontSize: "12px",
    lineHeight: 1.8,
    color: "#333333",
  };

  const contactLabelStyle: React.CSSProperties = {
    fontWeight: "600",
    color: "#000000",
  };

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>Contact & Information</h1>

      <div style={columnsStyle}>
        {/* Contact Us Column */}
        <div style={columnStyle}>
          <h3 style={columnHeaderStyle}>Contact Us</h3>
          <div style={contactItemStyle}>
            <div style={contactLabelStyle}>Email</div>
            <div>{contactInfo.email}</div>
          </div>
          <div style={contactItemStyle}>
            <div style={contactLabelStyle}>Phone</div>
            <div>{contactInfo.phone}</div>
          </div>
          <div style={contactItemStyle}>
            <div style={contactLabelStyle}>Location</div>
            <div>{contactInfo.address}</div>
          </div>
          <div style={contactItemStyle}>
            <div style={contactLabelStyle}>Website</div>
            <div>portfolio.ic-ces.engineering</div>
          </div>
        </div>

        {/* Who We Are Column */}
        <div style={columnStyle}>
          <h3 style={columnHeaderStyle}>Who We Are</h3>
          <p style={textStyle}>{whoWeAre}</p>
        </div>

        {/* How We Work Column */}
        <div style={columnStyle}>
          <h3 style={columnHeaderStyle}>How We Work</h3>
          <p style={textStyle}>{howWeWork}</p>
        </div>
      </div>
    </div>
  );
}
