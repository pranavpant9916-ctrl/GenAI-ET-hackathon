"use client";

import { useState } from "react";

export default function GenAIFrontend() {
  const [tab, setTab] = useState("upload"); // tabs: upload, analyze, agents, monitor, tasks
  const [file, setFile] = useState(null);
  const [code, setCode] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const BACKEND_URL = "http://localhost:5000"; // update to your backend

  const handleRequest = async (endpoint, payload, isFile = false, fieldName = "file") => {
    setLoading(true);
    setResult(null);

    try {
      let options = {};
      if (isFile) {
        const formData = new FormData();
        formData.append(fieldName, payload);
        options = { method: "POST", body: formData };
      } else {
        options = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        };
      }

      const res = await fetch(`${BACKEND_URL}${endpoint}`, options);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: "Request failed" });
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>GenAI Dashboard</h1>

      {/* Tabs */}
      <div style={{ marginBottom: 20 }}>
        {["upload", "analyze", "agents", "monitor", "tasks"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              marginRight: 10,
              background: tab === t ? "#3498db" : "#eee",
              color: tab === t ? "#fff" : "#000",
              padding: "5px 15px",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {tab === "upload" && (
        <div>
          <h2>Upload File</h2>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button
            onClick={() => handleRequest("/api/upload/files", file, true)}
            disabled={loading}
          >
            Upload File
          </button>

          <h2>Upload Code</h2>
          <textarea rows={5} cols={40} value={code} onChange={(e) => setCode(e.target.value)} />
          <br />
          <button onClick={() => handleRequest("/api/upload/code", { code })} disabled={loading}>
            Upload Code
          </button>

          <h2>Upload Repo URL</h2>
          <input
            type="text"
            placeholder="https://github.com/user/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
          <button onClick={() => handleRequest("/api/upload/url", { url: repoUrl })} disabled={loading}>
            Upload Repo URL
          </button>
        </div>
      )}

      {tab === "analyze" && (
        <div>
          <h2>Analyze</h2>
          <textarea rows={5} cols={40} value={code} onChange={(e) => setCode(e.target.value)} />
          <br />
          <button onClick={() => handleRequest("/analyze", { code })} disabled={loading}>
            Run Analysis
          </button>
        </div>
      )}

      {tab === "agents" && (
        <div>
          <h2>Run Agents</h2>
          <button onClick={() => handleRequest("/agents/run", { repoUrl })} disabled={loading}>
            Run Multi-Agent Pipeline
          </button>
        </div>
      )}

      {tab === "monitor" && (
        <div>
          <h2>Monitor</h2>
          <button onClick={() => handleRequest("/monitor", {})} disabled={loading}>
            Get Monitoring Data
          </button>
        </div>
      )}

      {tab === "tasks" && (
        <div>
          <h2>Tasks</h2>
          <button onClick={() => handleRequest("/tasks", {})} disabled={loading}>
            Get Tasks
          </button>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div style={{ marginTop: 20 }}>
          <div className="spinner" />
          <p>Processing...</p>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <pre style={{ background: "#f0f0f0", padding: 10, marginTop: 20 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}

      <style jsx>{`
        .spinner {
          border: 5px solid #f3f3f3;
          border-top: 5px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}