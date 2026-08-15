import React, { useState, useEffect } from "react";
import { Sparkles, Search, Globe, Shield } from "./Icons";

export default function LoadingSpinner({ message = "Running Agentic Pipeline…" }) {
  const [activeStep, setActiveStep] = useState(0);

  const PIPELINE_STAGES = [
    { label: "Classifying query intent", model: "Groq GPT-OSS 120B", icon: <Search size={13} />, color: "99, 102, 241" },
    { label: "Searching live internet", model: "Tavily Search API", icon: <Globe size={13} />, color: "14, 165, 233" },
    { label: "Extracting intelligence", model: "Groq GPT-OSS 120B", icon: <Sparkles size={13} />, color: "168, 85, 247" },
    { label: "Saving for review", model: "Supabase PostgreSQL", icon: <Shield size={13} />, color: "5, 150, 105" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < PIPELINE_STAGES.length - 1 ? prev + 1 : prev));
    }, 2200);
    return () => clearInterval(interval);
  }, [PIPELINE_STAGES.length]);

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28, padding: "32px 0" }}>
      {/* Orbital spinner */}
      <div style={{ position: "relative", width: 64, height: 64 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "var(--brand-400)", borderRightColor: "rgba(139,92,246,0.15)", animation: "spin 1s linear infinite" }} />
        <div style={{ position: "absolute", inset: 8, borderRadius: "50%", border: "2px solid transparent", borderBottomColor: "var(--accent-400)", borderLeftColor: "rgba(217,70,239,0.15)", animation: "spin 1.5s linear infinite reverse" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "linear-gradient(135deg, var(--brand-400), var(--accent-400))", animation: "pulseGlow 2s ease-in-out infinite" }} />
        </div>
      </div>

      {/* Pipeline stages */}
      <div style={{ width: "100%", maxWidth: 340 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
            <Sparkles size={14} style={{ color: "var(--brand-300)" }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>{message}</p>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>
            It takes around 8-14 seconds for this process.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {PIPELINE_STAGES.map((stage, i) => {
            const isActive = i === activeStep;
            const isDone = i < activeStep;
            const isPending = i > activeStep;
            const rgb = stage.color;
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: "var(--radius-md)",
                background: isActive ? `rgba(${rgb}, 0.08)` : "transparent",
                border: isActive ? `1px solid rgba(${rgb}, 0.2)` : "1px solid transparent",
                opacity: isPending ? 0.4 : 1,
                transition: "all 0.4s var(--ease-out)",
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "var(--radius-sm)", flexShrink: 0,
                  background: isDone ? `rgba(${rgb}, 0.15)` : isActive ? `rgba(${rgb}, 0.12)` : "var(--surface-300)",
                  color: isDone || isActive ? `rgb(${rgb})` : "var(--text-muted)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isDone ? <span style={{ fontSize: 12 }}>✓</span> : stage.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? "var(--text-primary)" : isDone ? "var(--text-secondary)" : "var(--text-muted)" }}>
                    {stage.label}
                  </p>
                  <p style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginTop: 1 }}>
                    {stage.model}
                  </p>
                </div>
                {isActive && (
                  <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid transparent", borderTopColor: `rgb(${rgb})`, animation: "spin 0.6s linear infinite" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
