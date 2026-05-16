import { useState } from "react";
import { Zap, Send } from "./Icons";

export default function QueryForm({ onSubmit, isLoading }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSubmit(query.trim());
    }
  };

  const examples = [
    "What companies are leading autonomous vehicle development in Europe?",
    "Market size of fintech startups in Southeast Asia 2025",
    "Top renewable energy investors in North America",
  ];

  const charCount = query.length;
  const isOverLimit = charCount > 500;
  const canSubmit = query.trim() && !isLoading && !isOverLimit;

  return (
    <form onSubmit={handleSubmit} className="glass-card animate-fade-in-up">
      {/* Card Header */}
      <div
        style={{
          padding: "clamp(12px, 3vw, 20px) clamp(14px, 3vw, 24px) clamp(10px, 2vw, 16px)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* <div
          className="icon-box icon-box--md"
          style={{
            background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(245,158,11,0.1))",
            border: "1px solid rgba(249,115,22,0.2)",
            color: "var(--brand-400)",
          }}
        >
          <Zap size={18} />
        </div> */}
        <div>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            New Query
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, fontWeight: 500 }}>
            Extract structured intelligence from text
          </p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--border-subtle)", margin: "0 clamp(14px, 3vw, 24px)" }} />

      {/* Textarea */}
      <div style={{ padding: "clamp(10px, 2vw, 16px) clamp(14px, 3vw, 24px)" }}>
        <div className="textarea-wrapper">
          <textarea
            id="query-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. What are the biggest AI startups in India's healthcare sector?"
            rows={4}
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.5 : 1 }}
          />
          <div className="textarea-footer">
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                fontFamily: "var(--font-mono)",
                color: isOverLimit ? "var(--error)" : "var(--text-muted)",
                transition: "color 0.2s",
              }}
            >
              {charCount}
              <span style={{ color: "var(--text-muted)", opacity: 0.5 }}> / 500</span>
            </span>
          </div>
        </div>
      </div>

      {/* Example Chips */}
      <div style={{ padding: "0 clamp(14px, 3vw, 24px) clamp(10px, 2vw, 16px)" }}>
        <p className="label" style={{ marginBottom: 10 }}>
          Try an example
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {examples.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setQuery(ex)}
              style={{
                textAlign: "left",
                padding: "5px 12px",
                borderRadius: "var(--radius-full)",
                fontSize: 11,
                fontWeight: 500,
                color: "var(--text-secondary)",
                background: "var(--surface-200)",
                border: "1px solid var(--border-subtle)",
                cursor: "pointer",
                transition: "all 0.2s var(--ease-out)",
                lineHeight: 1.4,
                fontFamily: "var(--font-sans)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border-hover)";
                e.currentTarget.style.color = "var(--text-primary)";
                e.currentTarget.style.background = "var(--surface-300)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.background = "var(--surface-200)";
              }}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div style={{ padding: "0 clamp(14px, 3vw, 24px) clamp(14px, 3vw, 24px)" }}>
        <button
          id="submit-query-btn"
          type="submit"
          disabled={!canSubmit}
          className="btn btn--primary btn--full"
          style={{
            padding: "14px 24px",
            fontSize: 14,
            fontWeight: 700,
            borderRadius: "var(--radius-lg)",
            letterSpacing: "-0.01em",
            background: canSubmit
              ? "linear-gradient(135deg, var(--brand-500), var(--brand-600))"
              : "var(--surface-300)",
            color: canSubmit ? "#fff" : "var(--text-muted)",
            border: canSubmit ? "none" : "1px solid var(--border-subtle)",
            boxShadow: canSubmit
              ? "0 4px 20px rgba(249, 115, 22, 0.3)"
              : "none",
          }}
        >
          {isLoading ? (
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.2)",
                  borderTopColor: "#fff",
                  animation: "spin 0.6s linear infinite",
                  display: "inline-block",
                }}
              />
              Analyzing Query…
            </span>
          ) : (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Send size={16} />
              Extract Intelligence
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
