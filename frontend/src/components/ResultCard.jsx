import React, { useState } from "react";
import {
  Check, Copy, Download, Globe, Building, Tag, Target, Key,
  BarChart, Shield, Edit, X, CheckCircle, ThumbsUp, ThumbsDown,
  ExternalLink, Search, Sparkles, Activity, Eye, Link2,
} from "./Icons";
import { reviewQuery } from "../api";

/* ═══════════════════════════════════════════════════════════════
   PIPELINE TRACKER — Shows the 4-step agentic process
   ═══════════════════════════════════════════════════════════════ */
function PipelineTracker({ steps = [] }) {
  if (!steps || steps.length === 0) return null;

  const stepColors = {
    1: "99, 102, 241",   // indigo — classify
    2: "14, 165, 233",   // sky — research
    3: "168, 85, 247",   // purple — extract
    4: "5, 150, 105",    // green — save
  };

  const stepIcons = {
    1: <Search size={14} />,
    2: <Globe size={14} />,
    3: <Sparkles size={14} />,
    4: <Shield size={14} />,
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Activity size={14} style={{ color: "var(--brand-300)" }} />
        <p className="label" style={{ color: "var(--brand-300)" }}>
          Agentic Pipeline
        </p>
      </div>
      <div className="pipeline-tracker" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        {steps.map((s, i) => {
          const rgb = stepColors[s.step] || "107,114,128";
          const isSkipped = s.status === "skipped";
          return (
            <div
              key={i}
              className="section-card"
              style={{
                padding: "14px",
                borderLeft: `3px solid rgba(${rgb}, ${isSkipped ? 0.3 : 0.8})`,
                opacity: isSkipped ? 0.6 : 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "var(--radius-sm)",
                  background: `rgba(${rgb}, 0.12)`, color: `rgb(${rgb})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {stepIcons[s.step] || <CheckCircle size={14} />}
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)" }}>
                  {s.name}
                </span>
              </div>
              <p style={{ fontSize: 10, fontWeight: 600, color: `rgb(${rgb})`, fontFamily: "var(--font-mono)", marginBottom: 4 }}>
                {s.model}
              </p>
              {s.details && (
                <p style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.4 }}>{s.details}</p>
              )}
              {s.duration_ms != null && (
                <span style={{
                  display: "inline-block", marginTop: 6, fontSize: 9, fontWeight: 700,
                  fontFamily: "var(--font-mono)", color: "var(--text-muted)",
                  background: "var(--surface-300)", padding: "2px 8px",
                  borderRadius: "var(--radius-full)",
                }}>
                  {s.duration_ms}ms
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SOURCES PANEL — Research sources from Tavily
   ═══════════════════════════════════════════════════════════════ */
function SourcesPanel({ sources = [] }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Link2 size={14} style={{ color: "var(--brand-300)" }} />
        <p className="label" style={{ color: "var(--brand-300)" }}>Research Sources</p>
        <span className="tag" style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)", color: "rgb(14,165,233)", fontSize: 10 }}>
          {sources.length} found
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sources.map((src, i) => (
          <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
            className="section-card"
            style={{
              padding: "12px 14px", textDecoration: "none",
              display: "flex", alignItems: "start", gap: 12,
              transition: "all 0.2s var(--ease-out)", cursor: "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand-400)"; e.currentTarget.style.transform = "translateX(4px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.transform = "translateX(0)"; }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: "var(--radius-sm)", flexShrink: 0,
              background: "rgba(14,165,233,0.08)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ExternalLink size={13} style={{ color: "rgb(14,165,233)" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>
                {src.title}
              </p>
              {src.snippet && (
                <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {src.snippet}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STATUS BADGE
   ═══════════════════════════════════════════════════════════════ */
function StatusBadge({ status }) {
  const config = {
    pending_review: { label: "Pending Review", color: "var(--warning)", bg: "var(--warning-bg)", border: "var(--warning-border)" },
    approved: { label: "Approved", color: "var(--success)", bg: "var(--success-bg)", border: "var(--success-border)" },
    rejected: { label: "Rejected", color: "var(--error)", bg: "var(--error-bg)", border: "var(--error-border)" },
  };
  const c = config[status] || config.pending_review;
  return (
    <span className="tag" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color, fontSize: 11 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
      {c.label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN RESULT CARD — With HITL Review
   ═══════════════════════════════════════════════════════════════ */
export default function ResultCard({ data, onReviewComplete }) {
  if (!data) return null;

  const { id, raw_query, created_at, status, classifier_model, extractor_model } = data;

  // Defensive parsing — handle both object and string JSON shapes
  const extracted_data = data.extracted_data || {};
  const topic = extracted_data.topic || "Unknown";
  const geography = extracted_data.geography || "Unknown";
  const industry = extracted_data.industry || "Unknown";
  const entity_type = extracted_data.entity_type || "Unknown";
  const intent = extracted_data.intent || "Unknown";
  const keywords = Array.isArray(extracted_data.keywords) ? extracted_data.keywords : [];
  const confidence_score = extracted_data.confidence_score || 0;
  const research_summary = extracted_data.research_summary || "";

  // Parse sources (may be string from DB)
  let sources = data.sources || [];
  if (typeof sources === "string") {
    try { sources = JSON.parse(sources); } catch { sources = []; }
  }

  // Parse pipeline_steps (may be string from DB)
  let pipeline_steps = data.pipeline_steps || [];
  if (typeof pipeline_steps === "string") {
    try { pipeline_steps = JSON.parse(pipeline_steps); } catch { pipeline_steps = []; }
  }

  // ── HITL Editable State ──
  const [isEditing, setIsEditing] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [editFields, setEditFields] = useState({
    topic, geography, industry, entity_type, intent,
    keywords: keywords ? [...keywords] : [],
    confidence_score,
    research_summary: research_summary || "",
  });
  const [newKeyword, setNewKeyword] = useState("");
  const [reviewStatus, setReviewStatus] = useState(status || "pending_review");

  const confidencePct = Math.round((isEditing ? editFields.confidence_score : confidence_score) * 100);
  const confidenceColor = confidencePct >= 80 ? "var(--success)" : confidencePct >= 50 ? "var(--warning)" : "var(--error)";

  const dimensionCards = [
    { label: "Geography", key: "geography", value: isEditing ? editFields.geography : geography, icon: <Globe size={16} />, color: "59, 130, 246" },
    { label: "Industry", key: "industry", value: isEditing ? editFields.industry : industry, icon: <Building size={16} />, color: "168, 85, 247" },
    { label: "Entity Type", key: "entity_type", value: isEditing ? editFields.entity_type : entity_type, icon: <Tag size={16} />, color: "245, 158, 11" },
  ];

  const formattedDate = created_at ? new Date(created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "—";

  const [copied, setCopied] = useState(false);
  const jsonPayload = JSON.stringify({ id, raw_query, topic, geography, industry, entity_type, intent, keywords, confidence_score, created_at, status: reviewStatus, sources }, null, 2);

  const handleDownload = () => {
    const blob = new Blob([jsonPayload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `queryiq-${id?.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFieldChange = (field, value) => {
    setEditFields(prev => ({ ...prev, [field]: value }));
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      setEditFields(prev => ({ ...prev, keywords: [...prev.keywords, newKeyword.trim()] }));
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (index) => {
    setEditFields(prev => ({ ...prev, keywords: prev.keywords.filter((_, i) => i !== index) }));
  };

  const handleReview = async (newStatus) => {
    setReviewLoading(true);
    try {
      const edits = isEditing ? editFields : {};
      await reviewQuery(id, newStatus, edits);
      setReviewStatus(newStatus);
      setIsEditing(false);
      if (onReviewComplete) onReviewComplete(id, newStatus);
    } catch (err) {
      console.error("Review failed:", err);
    } finally {
      setReviewLoading(false);
    }
  };

  const isPending = reviewStatus === "pending_review";

  return (
    <div className="glass-card animate-slide-in-right result-card" style={{ overflow: "hidden" }}>
      {/* Gradient accent line */}
      <div style={{ height: 3, background: "linear-gradient(90deg, var(--brand-500), var(--accent-500), var(--brand-400))", backgroundSize: "200% auto", animation: "gradientShift 4s ease infinite" }} />

      <div style={{ padding: "24px 28px 0" }}>
        {/* Title row */}
        <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", marginBottom: 20, gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              Extraction Result
            </h2>
            <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginTop: 3 }}>
              {id?.slice(0, 8)}…
            </p>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <StatusBadge status={reviewStatus} />
            {isPending && (
              <button
                className="btn btn--ghost"
                style={{ fontSize: 11, gap: 4, padding: "4px 10px" }}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <X size={12} /> : <Edit size={12} />}
                {isEditing ? "Cancel" : "Edit"}
              </button>
            )}
          </div>
        </div>

        {/* Model tags */}
        {(classifier_model || extractor_model) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {classifier_model && (
              <span className="tag" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", color: "rgb(99,102,241)", fontSize: 10 }}>
                Classifier: {classifier_model}
              </span>
            )}
            {extractor_model && (
              <span className="tag" style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.15)", color: "rgb(168,85,247)", fontSize: 10 }}>
                Extractor: {extractor_model}
              </span>
            )}
          </div>
        )}

        <div style={{ height: 1, background: "var(--border-subtle)" }} />
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "24px 28px" }}>
        {/* Pipeline Tracker */}
        <PipelineTracker steps={pipeline_steps} />

        {/* Primary Topic */}
        <div style={{ marginBottom: 24 }}>
          <p className="label" style={{ marginBottom: 8, color: "var(--brand-300)" }}>Primary Topic</p>
          {isEditing ? (
            <input type="text" value={editFields.topic}
              onChange={(e) => handleFieldChange("topic", e.target.value)}
              style={{ width: "100%", padding: "10px 14px", fontSize: 16, fontWeight: 700, borderRadius: "var(--radius-md)", border: "2px solid var(--brand-400)", background: "var(--surface-50)", color: "var(--text-primary)", fontFamily: "var(--font-sans)", outline: "none" }}
            />
          ) : (
            <h3 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2, letterSpacing: "-0.02em" }}>{topic}</h3>
          )}
        </div>

        {/* Research Summary */}
        {(research_summary || (isEditing && editFields.research_summary)) && (
          <div className="section-card" style={{ padding: "14px 18px", marginBottom: 24, borderLeft: "3px solid rgba(14,165,233,0.5)" }}>
            <p className="label" style={{ marginBottom: 6, color: "rgb(14,165,233)" }}>
              <Eye size={11} style={{ marginRight: 4, verticalAlign: "middle" }} />
              Research Summary
            </p>
            {isEditing ? (
              <textarea value={editFields.research_summary}
                onChange={(e) => handleFieldChange("research_summary", e.target.value)}
                rows={3}
                style={{ width: "100%", padding: "8px 12px", fontSize: 13, borderRadius: "var(--radius-md)", border: "2px solid var(--brand-400)", background: "var(--surface-50)", color: "var(--text-secondary)", fontFamily: "var(--font-sans)", outline: "none", resize: "vertical", lineHeight: 1.6 }}
              />
            ) : (
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{research_summary}</p>
            )}
          </div>
        )}

        {/* Source Query */}
        <div className="section-card" style={{ padding: "14px 18px", marginBottom: 24 }}>
          <p className="label" style={{ marginBottom: 6 }}>Source Query</p>
          <p style={{ fontSize: 13, fontWeight: 500, fontStyle: "italic", color: "var(--text-secondary)", lineHeight: 1.6 }}>"{raw_query}"</p>
        </div>

        {/* Sources Panel */}
        <SourcesPanel sources={sources} />

        {/* Dimension Cards */}
        <div className="dimension-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
          {dimensionCards.map((dim) => (
            <div key={dim.label} className="section-card" style={{ padding: "16px", transition: "all 0.25s var(--ease-out)", cursor: "default" }}
              onMouseEnter={(e) => { if (!isEditing) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div className="icon-box icon-box--sm" style={{ background: `rgba(${dim.color}, 0.1)`, border: `1px solid rgba(${dim.color}, 0.15)`, color: `rgb(${dim.color})`, marginBottom: 12 }}>
                {dim.icon}
              </div>
              <p className="label" style={{ marginBottom: 4 }}>{dim.label}</p>
              {isEditing ? (
                <input type="text" value={dim.value}
                  onChange={(e) => handleFieldChange(dim.key, e.target.value)}
                  style={{ width: "100%", padding: "6px 10px", fontSize: 13, fontWeight: 600, borderRadius: "var(--radius-sm)", border: "2px solid var(--brand-400)", background: "var(--surface-50)", color: "var(--text-primary)", fontFamily: "var(--font-sans)", outline: "none" }}
                />
              ) : (
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{dim.value}</p>
              )}
            </div>
          ))}
        </div>

        {/* Intent */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Target size={14} style={{ color: "var(--brand-300)" }} />
            <p className="label" style={{ color: "var(--brand-300)" }}>User Intent</p>
          </div>
          <div className="section-card" style={{ padding: "16px 18px", borderLeft: "3px solid var(--brand-500)" }}>
            {isEditing ? (
              <textarea value={editFields.intent}
                onChange={(e) => handleFieldChange("intent", e.target.value)}
                rows={2}
                style={{ width: "100%", padding: "8px 12px", fontSize: 13, borderRadius: "var(--radius-md)", border: "2px solid var(--brand-400)", background: "var(--surface-50)", color: "var(--text-secondary)", fontFamily: "var(--font-sans)", outline: "none", resize: "vertical", lineHeight: 1.6 }}
              />
            ) : (
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{intent}</p>
            )}
          </div>
        </div>

        {/* Keywords */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Key size={14} style={{ color: "var(--brand-300)" }} />
            <p className="label" style={{ color: "var(--brand-300)" }}>Extracted Keywords</p>
          </div>
          <div className="keyword-tags" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(isEditing ? editFields.keywords : keywords)?.map((kw, i) => (
              <span key={i} style={{
                padding: "5px 14px", borderRadius: "var(--radius-full)", fontSize: 12, fontWeight: 600,
                color: "var(--text-primary)", background: "var(--surface-300)", border: "1px solid var(--border-default)",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>
                {kw}
                {isEditing && (
                  <button onClick={() => handleRemoveKeyword(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--error)", padding: 0, display: "flex" }}>
                    <X size={11} />
                  </button>
                )}
              </span>
            ))}
            {isEditing && (
              <div style={{ display: "flex", gap: 4 }}>
                <input type="text" value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyword())}
                  placeholder="Add keyword"
                  style={{ padding: "5px 12px", fontSize: 12, borderRadius: "var(--radius-full)", border: "2px solid var(--brand-400)", background: "var(--surface-50)", color: "var(--text-primary)", fontFamily: "var(--font-sans)", outline: "none", width: 120 }}
                />
                <button onClick={handleAddKeyword} style={{ padding: "4px 10px", borderRadius: "var(--radius-full)", background: "var(--brand-500)", color: "#fff", border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+</button>
              </div>
            )}
          </div>
        </div>

        {/* Confidence Score */}
        <div className="section-card" style={{ padding: "18px 20px", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BarChart size={14} style={{ color: "var(--text-secondary)" }} />
              <p className="label" style={{ color: "var(--text-secondary)" }}>Model Confidence</p>
            </div>
            {isEditing ? (
              <input type="number" min="0" max="100" value={confidencePct}
                onChange={(e) => handleFieldChange("confidence_score", Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) / 100)}
                style={{ width: 70, padding: "4px 8px", fontSize: 14, fontWeight: 800, fontFamily: "var(--font-mono)", borderRadius: "var(--radius-sm)", border: "2px solid var(--brand-400)", background: "var(--surface-50)", color: confidenceColor, textAlign: "right", outline: "none" }}
              />
            ) : (
              <span style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-mono)", color: confidenceColor }}>{confidencePct}%</span>
            )}
          </div>
          <div className="confidence-bar">
            <div className="confidence-bar__fill" style={{ width: `${confidencePct}%`, background: confidenceColor, boxShadow: `0 0 12px ${confidenceColor}` }} />
          </div>
        </div>
      </div>

      {/* ── HITL Review Actions ── */}
      {isPending && (
        <div style={{
          padding: "20px 28px", borderTop: "1px solid var(--border-subtle)",
          background: "linear-gradient(135deg, rgba(249,115,22,0.03), rgba(168,85,247,0.03))",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Eye size={14} style={{ color: "var(--brand-400)" }} />
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Human Review Required</p>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.6 }}>
            Review the AI-extracted data above. You can edit any field before approving, or reject to discard.
          </p>
          <div className="hitl-actions" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => handleReview("approved")} disabled={reviewLoading}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "12px 28px",
                borderRadius: "var(--radius-md)", border: "none", fontSize: 13, fontWeight: 700,
                fontFamily: "var(--font-sans)", cursor: reviewLoading ? "wait" : "pointer",
                background: "linear-gradient(135deg, #059669, #047857)", color: "#fff",
                boxShadow: "0 4px 16px rgba(5,150,105,0.3)",
                transition: "all 0.25s var(--ease-out)", opacity: reviewLoading ? 0.6 : 1,
              }}
            >
              <ThumbsUp size={15} />
              {reviewLoading ? "Saving…" : "Approve & Save"}
            </button>
            <button onClick={() => handleReview("rejected")} disabled={reviewLoading}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "12px 28px",
                borderRadius: "var(--radius-md)", border: "1px solid var(--error-border)",
                fontSize: 13, fontWeight: 700, fontFamily: "var(--font-sans)",
                cursor: reviewLoading ? "wait" : "pointer",
                background: "var(--error-bg)", color: "var(--error)",
                transition: "all 0.25s var(--ease-out)", opacity: reviewLoading ? 0.6 : 1,
              }}
            >
              <ThumbsDown size={15} />
              Reject
            </button>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="result-card-footer" style={{ padding: "16px 28px", borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)" }}>{formattedDate}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleDownload} className="btn btn--ghost" style={{ fontSize: 12, gap: 6 }}>
            <Download size={13} />.json
          </button>
          <button onClick={handleCopy} className="btn btn--ghost"
            style={{ fontSize: 12, gap: 6, color: copied ? "var(--success)" : undefined, borderColor: copied ? "var(--success-border)" : undefined, background: copied ? "var(--success-bg)" : undefined }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
