import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Intercept requests to redirect localhost backend calls to VITE_API_URL when deployed
axios.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith("http://localhost:5000")) {
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
    config.url = config.url.replace("http://localhost:5000", apiBase);
  }
  return config;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
