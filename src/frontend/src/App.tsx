import { useState } from "react";

export default function App() {
  const [projectName, setProjectName] = useState("my-nest-app");
  const [database, setDatabase] = useState("None");
  const [useAuth, setUseAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = { projectName, database, useAuth };

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) setSuccess(true);
    } catch (err) {
      alert("Generation failed. Check terminal log.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#4ade80" }}>
        <h2>🚀 Success!</h2>
        <p style={{ color: "#94a3b8" }}>
          You can close this tab and return to your terminal.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "50px auto",
        padding: "20px",
        background: "#1e293b",
        color: "#fff",
        borderRadius: "12px",
      }}
    >
      <h1>NestJS Generator Layout</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Project Name
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              background: "#0f172a",
              border: "1px solid #334155",
              color: "#fff",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Database
          </label>
          <select
            value={database}
            onChange={(e) => setDatabase(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              background: "#0f172a",
              border: "1px solid #334155",
              color: "#fff",
            }}
          >
            <option value="None">None</option>
            <option value="PostgreSQL">PostgreSQL</option>
            <option value="MongoDB">MongoDB</option>
          </select>
        </div>

        {/* Dynamic React Option: Only show Auth if a DB is selected */}
        {database !== "None" && (
          <label style={{ display: "flex", gap: "10px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={useAuth}
              onChange={(e) => setUseAuth(e.target.checked)}
            />
            Include Database Authentication Boilerplate
          </label>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px",
            background: "#4f46e5",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {loading ? "Generating..." : "Generate Project"}
        </button>
      </form>
    </div>
  );
}
