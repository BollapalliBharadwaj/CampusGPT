import axios from "axios";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const QUICK_PROMPTS = [
  { label: "Summarize PDF", icon: "📋" },
  { label: "Key Topics", icon: "🔑" },
  { label: "Generate MCQs", icon: "✏️" },
  { label: "Interview Questions", icon: "🎯" },
];

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0,1,2].map(i => (
        <span key={i} className="thinking-dot w-2 h-2 rounded-full inline-block"
          style={{ background: 'var(--brand-light)' }} />
      ))}
    </div>
  );
}

function Chat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    axios.get("http://localhost:5000/documents")
      .then((res) => {
        setDocuments(res.data);
        if (res.data.length > 0) setSelectedDoc(res.data[0]._id);
      })
      .catch((err) => console.log(err));
  }, []);

  const askQuestion = async () => {
    if (!question.trim()) return;
    if (!selectedDoc) { alert("Please upload/select a PDF first"); return; }

    setLoading(true);
    const userMessage = { role: "user", text: question };
    setMessages(prev => [...prev, userMessage]);
    const q = question;
    setQuestion("");

    try {
      const response = await axios.post("http://localhost:5000/chat", { question: q, documentId: selectedDoc });
      const aiMessage = { role: "ai", text: response.data.answer, sources: response.data.sources };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.log(err);
      setMessages(prev => [...prev, { role: "ai", text: "Sorry, something went wrong. Please try again.", sources: [] }]);
    }

    setLoading(false);
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      {/* Chat header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--accent))' }}>
            🤖
          </div>
          <div>
            <h2 className="text-sm font-semibold">AI Assistant</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Powered by Gemini</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {documents.length > 0 && (
            <select value={selectedDoc} onChange={(e) => setSelectedDoc(e.target.value)}
              className="text-xs rounded-lg px-3 py-2 outline-none cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border)',
                color: '#cbd5e1',
                maxWidth: '180px'
              }}>
              {documents.map((doc) => (
                <option key={doc._id} value={doc._id} style={{ background: '#0c1529' }}>
                  📄 {doc.fileName}
                </option>
              ))}
            </select>
          )}
          <div className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
            Online
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="h-[55vh] overflow-y-auto p-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              🤖
            </div>
            <h3 className="text-base font-semibold mb-1">Ready to help</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              Upload a PDF and ask anything about it
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_PROMPTS.map((item, index) => (
                <button key={index} onClick={() => { setQuestion(item.label); inputRef.current?.focus(); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all font-medium"
                  style={{
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border)',
                    color: '#cbd5e1'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-light)'; e.currentTarget.style.color = 'var(--brand-light)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = '#cbd5e1'; }}>
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "ai" && (
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mr-2.5 flex-shrink-0 mt-0.5 text-sm"
                style={{ background: 'linear-gradient(135deg, var(--brand), var(--accent))', flexShrink: 0 }}>
                🤖
              </div>
            )}
            <div className="max-w-[78%]">
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed prose-chat ${
                msg.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"
              }`} style={
                msg.role === "user"
                  ? { background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: '#e2e8f0' }
              }>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {msg.sources.map((source, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--brand-light)' }}>
                      📌 Chunk {source.chunkNumber}
                      <span style={{ color: 'var(--text-muted)' }}>· {source.score}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--accent))' }}>
              🤖
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)' }}>
              <ThinkingDots />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--brand)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}>
          <input
            ref={inputRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); askQuestion(); } }}
            placeholder="Ask anything about your document..."
            className="flex-1 bg-transparent text-sm outline-none placeholder-slate-600"
            style={{ color: '#e2e8f0' }}
          />
          <button
            onClick={askQuestion}
            disabled={loading || !question.trim()}
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}
            title="Send">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
        <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
          Press Enter to send
        </p>
      </div>
    </div>
  );
}

export default Chat;
