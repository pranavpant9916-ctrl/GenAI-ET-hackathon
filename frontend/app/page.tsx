"use client";

import { useState } from "react";

export default function GenAIFrontend() {
  const [tab, setTab] = useState("upload");
  const [file, setFile] = useState(null);
  const [code, setCode] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeEndpoint, setActiveEndpoint] = useState("");

  const BACKEND_URL = "http://localhost:5000";

  const handleRequest = async (
    endpoint,
    payload = {},
    isFile = false,
    fieldName = "file",
    method = "POST"
  ) => {
    setLoading(true);
    setResult(null);
    setActiveEndpoint(endpoint);

    try {
      let options = { method };

      if (method !== "GET") {
        if (isFile) {
          const formData = new FormData();
          formData.append(fieldName, payload);
          options.body = formData;
        } else {
          options.headers = { "Content-Type": "application/json" };
          options.body = JSON.stringify(payload);
        }
      }

      const res = await fetch(`${BACKEND_URL}${endpoint}`, options);

      const contentType = res.headers.get("content-type");

      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        data = { error: "Invalid JSON response", raw: text };
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: "Request failed" });
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>GenAI Dashboard 🚀</h1>

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
              padding: "6px 15px",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Upload */}
      {tab === "upload" && (
        <div>
          <h2>Upload File</h2>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button
            onClick={() =>
              handleRequest("/api/upload/files", file, true)
            }
            disabled={loading || !file}
          >
            Upload File
          </button>

          <h2>Upload Code</h2>
          <textarea
            rows={5}
            cols={40}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <br />
          <button
            onClick={() =>
              handleRequest("/api/upload/code", { code })
            }
            disabled={loading || !code}
          >
            Upload Code
          </button>

          <h2>Upload Repo URL</h2>
          <input
            type="text"
            placeholder="https://github.com/user/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
          <button
            onClick={() =>
              handleRequest("/api/upload/url", { url: repoUrl })
            }
            disabled={loading || !repoUrl}
          >
            Upload Repo URL
          </button>
        </div>
      )}

      {/* Analyze */}
      {tab === "analyze" && (
        <div>
          <h2>Analyze</h2>
          <textarea
            rows={5}
            cols={40}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <br />
          <button
            onClick={() =>
              handleRequest("/analyze", { code })
            }
            disabled={loading || !code}
          >
            Run Analysis
          </button>
        </div>
      )}

      {/* Agents */}
      {tab === "agents" && (
        <div>
          <h2>Run Agents</h2>
          <button
            onClick={() =>
              handleRequest("/agents/run", { repoUrl })
            }
            disabled={loading || !repoUrl}
          >
            Run Multi-Agent Pipeline
          </button>
        </div>
      )}

      {/* Monitor (GET) */}
      {tab === "monitor" && (
        <div>
          <h2>Monitor</h2>
          <button
            onClick={() =>
              handleRequest("/monitor", {}, false, "file", "GET")
            }
            disabled={loading}
          >
            Get Monitoring Data
          </button>
        </div>
      )}

      {/* Tasks (GET) */}
      {tab === "tasks" && (
        <div>
          <h2>Tasks</h2>
          <button
            onClick={() =>
              handleRequest("/tasks", {}, false, "file", "GET")
            }
            disabled={loading}
          >
            Get Tasks
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <div className="spinner" />
          <p>⏳ Calling {activeEndpoint}...</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <pre
          style={{
            background: "#111",
            color: "#0f0",
            padding: 15,
            marginTop: 20,
            maxHeight: 300,
            overflow: "auto",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}

      {/* Styles */}
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
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}