import { useEffect, useState } from "react";
import axios from "axios";
import { applyTheme, getInitialDark } from "./components/ThemeToggle";
import Navbar, { useAIStatus } from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Stats from "./components/Stats";
import Upload from "./components/Upload";
import ChatWindow from "./components/ChatWindow";
import Login from "./components/Login";
import DashboardBackground from "./components/DashboardBackground";

export default function App() {
  const [user, setUser]                   = useState(null);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [uploadKey, setUploadKey]         = useState(0);
  const aiStatus                          = useAIStatus();

  useEffect(() => {
    applyTheme(getInitialDark());
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }
  }, []);

  const handleLogin = (session) => {
    if (session) {
      setUser(session.user);
      localStorage.setItem("user", JSON.stringify(session.user));
      localStorage.setItem("token", session.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${session.token}`;
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setSelectedDocId(null);
  };

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden", position:"relative" }}>
      {/* Animated canvas background — fixed, behind everything */}
      <DashboardBackground />

      {/* All content above background */}
      <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
        <Navbar user={user} onLogout={handleLogout} aiStatus={aiStatus} />

        <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
          <Sidebar selectedDocId={selectedDocId} onSelectDoc={setSelectedDocId} key={uploadKey} onDeleteComplete={()=>setUploadKey(k=>k+1)} />

          <main style={{ flex:1, overflowY:"auto", padding:"20px 24px 32px", background:"transparent" }}>
            <div style={{ maxWidth:900, margin:"0 auto" }}>
              <Stats questionCount={questionCount} aiStatus={aiStatus} key={uploadKey} />
              <Upload onUploadComplete={()=>setUploadKey(k=>k+1)} />
              <ChatWindow
                selectedDocId={selectedDocId}
                onQuestionAsked={()=>setQuestionCount(c=>c+1)}
              />
            </div>
            <footer style={{ textAlign:"center", marginTop:28, paddingTop:16, borderTop:"1px solid var(--border)" }}>
              <p style={{ fontSize:11, color:"var(--muted-dim)" }}>
                Built by{" "}<span style={{ color:"var(--primary)", fontWeight:600 }}>Bharadwaj Bollapalli</span>
                {" · "}Gemini 2.5 Flash · MongoDB Atlas · React
              </p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
