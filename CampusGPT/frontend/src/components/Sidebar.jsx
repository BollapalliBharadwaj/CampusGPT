import axios from "axios";
import { useEffect, useState } from "react";

const FileIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

function Sidebar({ selectedDocId, onSelectDoc }) {
  const [documents, setDocuments] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/documents")
      .then(res => {
        setDocuments(res.data);
        if (res.data.length > 0 && !selectedDocId) {
          onSelectDoc(res.data[0]._id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = documents.filter(d =>
    d.fileName.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const w = collapsed ? "var(--sidebar-collapsed-w)" : "var(--sidebar-w)";

  return (
    <aside style={{
      width: w, minWidth: w, maxWidth: w,
      height: "100%",
      display: "flex", flexDirection: "column",
      background: "var(--surface)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      borderRight: "1px solid var(--border)",
      flexShrink: 0,
      transition: "width .2s ease, min-width .2s ease, max-width .2s ease",
      overflow: "hidden",
    }}>
      {/* Sidebar header */}
      <div style={{
        padding: collapsed ? "12px 0" : "12px 12px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        flexShrink: 0,
      }}>
        {!collapsed && (
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--muted)" }}>
            Documents
          </span>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            width: 26, height: 26,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "none",
            background: "transparent",
            color: "var(--muted)",
            cursor: "pointer",
            borderRadius: 6,
            transition: "all .15s",
            flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--card)"; e.currentTarget.style.color = "var(--text)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            {collapsed
              ? <path d="M9 18l6-6-6-6"/>
              : <path d="M15 18l-6-6 6-6"/>
            }
          </svg>
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Search */}
          <div style={{ padding: "10px 12px", flexShrink: 0 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 10px",
              borderRadius: 7,
              border: "1px solid var(--border)",
              background: "var(--bg)",
            }}>
              <span style={{ color: "var(--muted-dim)", flexShrink: 0 }}><SearchIcon /></span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search documents…"
                style={{
                  flex: 1, border: "none", background: "transparent",
                  fontSize: 12, color: "var(--text)", outline: "none",
                  minWidth: 0,
                }}
              />
            </div>
          </div>

          {/* Doc list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 8px" }}>
            {loading && (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ padding: "8px", marginBottom: 2, borderRadius: 7 }}>
                  <div className="skeleton" style={{ height: 11, width: "70%", marginBottom: 5 }} />
                  <div className="skeleton" style={{ height: 9, width: "45%" }} />
                </div>
              ))
            )}

            {!loading && filtered.length === 0 && (
              <div style={{ padding: "24px 8px", textAlign: "center" }}>
                <div style={{
                  width: 36, height: 36,
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 8px",
                  color: "var(--muted-dim)",
                }}>
                  <FileIcon />
                </div>
                <p style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>
                  {search ? "No matches" : "No documents"}
                </p>
                <p style={{ fontSize: 11, color: "var(--muted-dim)", marginTop: 2 }}>
                  {search ? "Try a different term" : "Upload a PDF to get started"}
                </p>
              </div>
            )}

            {!loading && filtered.map(doc => {
              const active = doc._id === selectedDocId;
              return (
                <div
                  key={doc._id}
                  onClick={() => onSelectDoc(doc._id)}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 8,
                    padding: "8px 8px",
                    borderRadius: 7,
                    marginBottom: 1,
                    cursor: "pointer",
                    transition: "all .15s",
                    background: active ? "rgba(37,99,235,.1)" : "transparent",
                    border: `1px solid ${active ? "rgba(37,99,235,.25)" : "transparent"}`,
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--card)"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{
                    width: 28, height: 28,
                    background: active ? "rgba(37,99,235,.15)" : "var(--card)",
                    border: `1px solid ${active ? "rgba(37,99,235,.3)" : "var(--border)"}`,
                    borderRadius: 6,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    color: active ? "var(--primary)" : "var(--muted)",
                  }}>
                    <FileIcon />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 12, fontWeight: active ? 600 : 500,
                      color: active ? "var(--primary)" : "var(--text)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {doc.fileName}
                    </p>
                    {doc.uploadedAt && (
                      <p style={{ fontSize: 10, color: "var(--muted-dim)", marginTop: 1 }}>
                        {formatDate(doc.uploadedAt)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{
            padding: "10px 12px",
            borderTop: "1px solid var(--border)",
            flexShrink: 0,
          }}>
            <p style={{ fontSize: 11, color: "var(--muted-dim)" }}>
              {documents.length} document{documents.length !== 1 ? "s" : ""} total
            </p>
          </div>
        </>
      )}

      {collapsed && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0", gap: 2, overflowY: "auto" }}>
          {documents.map(doc => {
            const active = doc._id === selectedDocId;
            return (
              <button
                key={doc._id}
                onClick={() => onSelectDoc(doc._id)}
                title={doc.fileName}
                style={{
                  width: 32, height: 32,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 7,
                  border: `1px solid ${active ? "rgba(37,99,235,.3)" : "transparent"}`,
                  background: active ? "rgba(37,99,235,.1)" : "transparent",
                  color: active ? "var(--primary)" : "var(--muted)",
                  cursor: "pointer",
                  transition: "all .15s",
                  flexShrink: 0,
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "var(--card)"; e.currentTarget.style.color = "var(--text)"; }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}}
              >
                <FileIcon />
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
