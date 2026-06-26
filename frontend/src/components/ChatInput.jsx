import { useRef } from "react";

const SendIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

function ChatInput({ value, onChange, onSubmit, loading, disabled }) {
  const ref = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const canSend = value.trim() && !loading && !disabled;

  return (
    <div style={{
      padding: "12px 16px",
      borderTop: "1px solid var(--border)",
      background: "var(--surface)",
      flexShrink: 0,
    }}>
      <div
        style={{
          display: "flex", alignItems: "flex-end", gap: 10,
          padding: "8px 12px",
          borderRadius: 9,
          border: "1px solid var(--border)",
          background: "var(--bg)",
          transition: "border-color .15s",
        }}
        onFocusCapture={e => e.currentTarget.style.borderColor = "var(--primary)"}
        onBlurCapture={e => e.currentTarget.style.borderColor = "var(--border)"}
      >
        <textarea
          ref={ref}
          value={value}
          onChange={e => {
            onChange(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
          }}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Select a document to start chatting…" : "Ask anything about your document…"}
          disabled={disabled}
          rows={1}
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            resize: "none",
            fontSize: 13.5,
            color: "var(--text)",
            outline: "none",
            lineHeight: 1.5,
            maxHeight: 120,
            fontFamily: "inherit",
          }}
        />
        <button
          onClick={onSubmit}
          disabled={!canSend}
          style={{
            width: 32, height: 32,
            borderRadius: 7,
            border: "none",
            background: canSend ? "var(--primary)" : "var(--border)",
            color: canSend ? "#fff" : "var(--muted-dim)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: canSend ? "pointer" : "not-allowed",
            transition: "all .15s",
            flexShrink: 0,
          }}
        >
          {loading
            ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5, borderColor: "rgba(255,255,255,.3)", borderTopColor: "#fff" }} />
            : <SendIcon />
          }
        </button>
      </div>
      <p style={{ fontSize: 11, color: "var(--muted-dim)", textAlign: "center", marginTop: 7 }}>
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}

export default ChatInput;
