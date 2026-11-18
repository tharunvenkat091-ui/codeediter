import { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import {
  Code2, Play, Share2, Save, RotateCcw, Eye, Columns2,
  Maximize2, FileCode2, ChevronDown, Check, Sparkles
} from "lucide-react";

const starter = {
  html: `<main class="card">
  <span class="tag">WELCOME</span>
  <h1>Hello, world! 👋</h1>
  <p>Start creating something amazing.</p>
  <button onclick="sayHello()">Click me</button>
</main>`,
  css: `* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: Arial, sans-serif;
  color: #172033;
  background: linear-gradient(135deg, #dbeafe, #f5d0fe);
}
.card {
  width: min(90%, 420px);
  padding: 42px;
  text-align: center;
  background: white;
  border-radius: 22px;
  box-shadow: 0 20px 60px #24345b22;
}
.tag { color: #7557e8; font-size: 12px; font-weight: bold; letter-spacing: 2px; }
h1 { margin: 14px 0; }
p { color: #64748b; line-height: 1.6; }
button {
  border: 0; border-radius: 10px; padding: 12px 22px;
  color: white; background: #7557e8; cursor: pointer;
}`,
  js: `function sayHello() {
  alert("Your code is running! 🎉");
}`
};

const templates = {
  "Starter page": starter,
  "Portfolio": {
    html: `<nav><strong>MY PORTFOLIO</strong><a href="#contact">Contact</a></nav>
<section class="hero"><p>HELLO, I'M A DEVELOPER</p><h1>Building ideas<br>into reality.</h1><p>I create clean and useful digital experiences.</p><a class="btn" href="#contact">Get in touch</a></section>
<section id="contact"><h2>Let's work together.</h2><p>hello@example.com</p></section>`,
    css: `*{box-sizing:border-box}body{margin:0;font-family:Arial;background:#101522;color:#f8fafc}nav{display:flex;justify-content:space-between;padding:28px 8%;border-bottom:1px solid #ffffff20}a{color:inherit;text-decoration:none}.hero{padding:12vh 10%;min-height:65vh}.hero p{color:#a5b4fc}.hero h1{font-size:clamp(48px,8vw,88px);line-height:1.05;margin:20px 0}.btn{display:inline-block;background:#818cf8;padding:14px 22px;border-radius:8px;margin-top:20px}#contact{padding:50px 10%;background:#1e293b}`,
    js: `console.log("Portfolio template loaded");`
  },
  "Product card": {
    html: `<article class="product"><div class="image">🎧</div><p class="muted">WIRELESS AUDIO</p><h1>Studio Headphones</h1><p>Rich sound. All-day comfort. Designed for focus.</p><div class="bottom"><strong>₹2,499</strong><button onclick="addToCart()">Add to cart</button></div><small id="message"></small></article>`,
    css: `body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f1f5f9;font-family:Arial;color:#172033}.product{background:white;width:min(88%,340px);padding:24px;border-radius:20px;box-shadow:0 15px 45px #0f172a18}.image{height:170px;display:grid;place-items:center;background:#e0e7ff;border-radius:14px;font-size:76px}.muted{color:#64748b;font-size:11px;letter-spacing:2px;margin-top:24px}.bottom{display:flex;align-items:center;justify-content:space-between;margin-top:24px}button{border:0;background:#4f46e5;color:white;padding:12px 16px;border-radius:9px;cursor:pointer}small{display:block;margin-top:14px;color:#16a34a}`,
    js: `function addToCart(){document.getElementById("message").textContent="Added to cart successfully!";}`
  }
};

function decodeSharedCode() {
  try {
    const raw = new URLSearchParams(window.location.search).get("code");
    if (!raw) return null;
    return JSON.parse(decodeURIComponent(escape(atob(raw))));
  } catch {
    return null;
  }
}
function encodeSharedCode(value) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(value))));
}

export default function App() {
  const [code, setCode] = useState(() => decodeSharedCode() || starter);
  const [activeTab, setActiveTab] = useState("html");
  const [layout, setLayout] = useState("split");
  const [template, setTemplate] = useState("Starter page");
  const [notice, setNotice] = useState("");
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("codespace-snippet");
    if (!decodeSharedCode() && saved) {
      try { setCode(JSON.parse(saved)); } catch { /* ignore invalid saved data */ }
    }
  }, []);

  const preview = useMemo(() => `<!doctype html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>${code.css}</style></head><body>${code.html}
<script>${code.js.replace(/<\/script/gi, "<\\/script")}<\/script>
</body></html>`, [code, runKey]);

  const updateCode = (value) => setCode((old) => ({ ...old, [activeTab]: value ?? "" }));
  const loadTemplate = (name) => {
    setTemplate(name);
    setCode({ ...templates[name] });
    setRunKey((n) => n + 1);
    setNotice(`${name} loaded`);
  };
  const saveSnippet = () => {
    localStorage.setItem("codespace-snippet", JSON.stringify(code));
    setNotice("Saved in this browser");
  };
  const shareCode = async () => {
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("code", encodeSharedCode(code));
    try {
      await navigator.clipboard.writeText(url.toString());
      setNotice("Share link copied!");
    } catch {
      window.prompt("Copy your share link:", url.toString());
    }
  };
  const resetCode = () => {
    setCode({ ...starter });
    setTemplate("Starter page");
    setRunKey((n) => n + 1);
    setNotice("Editor reset");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="./"><span className="brand-icon"><Code2 size={21}/></span><span>Code<span className="brand-accent">Space</span></span></a>
        <div className="top-actions">
          <label className="template-select"><Sparkles size={15}/><select value={template} onChange={(e) => loadTemplate(e.target.value)}>{Object.keys(templates).map((name) => <option key={name}>{name}</option>)}</select><ChevronDown size={14}/></label>
          <button className="tool-btn" onClick={saveSnippet}><Save size={16}/> <span>Save</span></button>
          <button className="tool-btn" onClick={shareCode}><Share2 size={16}/> <span>Share</span></button>
          <button className="run-btn" onClick={() => setRunKey((n) => n + 1)}><Play size={15} fill="currentColor"/> Run</button>
        </div>
      </header>

      <main className={`workspace ${layout === "preview" ? "preview-only" : ""}`}>
        <section className="editor-panel">
          <div className="panel-heading">
            <div className="panel-title"><span className="live-dot"/><span>EDITOR</span><span className="file-count">3 files</span></div>
            <button className="icon-btn" title="Reset code" onClick={resetCode}><RotateCcw size={16}/></button>
          </div>
          <div className="tabs">
            {["html", "css", "js"].map((tab) => <button key={tab} className={`tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}><FileCode2 size={15}/>{tab.toUpperCase()}<span className={`file-dot ${tab}`}/></button>)}
          </div>
          <div className="editor-container">
            <Editor
              height="100%"
              language={activeTab === "js" ? "javascript" : activeTab}
              theme="vs-dark"
              value={code[activeTab]}
              onChange={updateCode}
              options={{
                minimap: { enabled: false }, fontSize: 14, tabSize: 2,
                wordWrap: "on", automaticLayout: true, scrollBeyondLastLine: false,
                padding: { top: 18 }, lineNumbers: "on", roundedSelection: false
              }}
            />
          </div>
          <div className="editor-footer"><span><span className="status-dot"/> Ready</span><span>{activeTab.toUpperCase()} · UTF-8</span></div>
        </section>

        {layout !== "preview" && <div className="resize-divider"><span/></div>}

        {layout !== "editor" && <section className="preview-panel">
          <div className="panel-heading">
            <div className="panel-title"><Eye size={16}/><span>LIVE PREVIEW</span><span className="preview-label">LIVE</span></div>
            <div className="preview-actions">
              <button className={`icon-btn ${layout === "split" ? "selected" : ""}`} title="Side by side" onClick={() => setLayout("split")}><Columns2 size={16}/></button>
              <button className={`icon-btn ${layout === "preview" ? "selected" : ""}`} title="Full preview" onClick={() => setLayout("preview")}><Maximize2 size={16}/></button>
            </div>
          </div>
          <div className="browser-bar"><div className="browser-dots"><i/><i/><i/></div><div className="address">your-project.preview</div><span className="secure">●</span></div>
          <iframe key={runKey} title="Live code preview" className="preview-frame" srcDoc={preview} sandbox="allow-scripts"/>
        </section>}
      </main>
      <footer className="bottom-bar">
        <span>Made for creators <span className="heart">♥</span></span>
        <span>{notice ? <><Check size={13}/> {notice}</> : "HTML · CSS · JavaScript"}</span>
        <span>CodeSpace v1.0</span>
      </footer>
    </div>
  );
}