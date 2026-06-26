import ReactMarkdown from "react-markdown";

const BotAvatar = () => (
  <div style={{
    width: 28, height: 28,
    background: "var(--primary)",
    borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  }}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
      <path d="M12 3L2 7l10 4 10-4-10-4z"/>
      <path d="M2 17l10 4 10-4"/>
      <path d="M2 12l10 4 10-4"/>
    </svg>
  </div>
);

function ThinkingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "2px 0" }}>
      {[0, 1, 2].map(i => (
        <span key={i} className="thinking-dot" />
      ))}
    </div>
  );
}

function ChatMessage({ msg, isLoading }) {
  const isUser = msg?.role === "user";

  if (isLoading) {
    return (
      <div className="fade-in" style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 16 }}>
        <BotAvatar />
        <div style={{
          padding: "10px 14px",
          borderRadius: "0 8px 8px 8px",
          background: "var(--card)",
          border: "1px solid var(--border)",
        }}>
          <ThinkingDots />
        </div>
      </div>
    );
  }

  if (isUser) {
    return (
      <div className="fade-in" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <div style={{
          maxWidth: "72%",
          padding: "9px 14px",
          borderRadius: "8px 0 8px 8px",
          background: "var(--primary)",
          color: "#fff",
          fontSize: 13.5,
          lineHeight: 1.55,
          fontWeight: 400,
        }}>
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 16 }}>
      <BotAvatar />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          padding: "10px 14px",
          borderRadius: "0 8px 8px 8px",
          background: "var(--card)",
          border: "1px solid var(--border)",
          maxWidth: "90%",
        }}>
          <div className="prose-chat">
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </div>
        </div>

        {msg.sources && msg.sources.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 7, paddingLeft: 0 }}>
            {msg.sources.map((src, i) => (
              <span key={i} style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "3px 8px",
                borderRadius: 5,
                background: "rgba(79,70,229,.08)",
                border: "1px solid rgba(79,70,229,.2)",
                fontSize: 11, fontWeight: 500,
                color: "var(--accent)",
              }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 10 20 15 15 20"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/></svg>
                Source {src.chunkNumber}
                <span style={{ color: "var(--muted-dim)", fontWeight: 400 }}>· {src.score}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
