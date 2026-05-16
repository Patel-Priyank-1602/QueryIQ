import { useState } from "react";
import { Clock, ChevronRight, Search, Sparkles } from "./Icons";

export default function HistoryPage({ history, onSelect, onGoToSearch }) {
  const isEmpty = !history || history.length === 0;
  const [showAll, setShowAll] = useState(false);
  const visibleHistory = showAll ? history : history?.slice(0, 4);

  return (
    <div 
      style={{ 
        position: "relative",
        width: "100%", 
        borderRadius: "24px", 
        overflow: "hidden", 
        padding: "48px 20px 64px",
        marginTop: "-16px",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: "url('/bg-image.png')",
          backgroundSize: "cover",
          backgroundPosition: "top center",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 100%)",
          opacity: 0.85,
          zIndex: -1,
        }}
      />
      <div className="animate-fade-in-up" style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        {/* <div
          className="tag"
          style={{
            background: "var(--warning-bg)",
            border: "1px solid var(--warning-border)",
            color: "var(--warning)",
            marginBottom: 16,
          }}
        >
          <Clock size={14} />
          Query History
        </div> */}
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
            marginBottom: 12,
            lineHeight: 1.15,
          }}
        >
          Recent <span className="gradient-text">Extractions</span>
        </h2>
        <p style={{ fontSize: 15, color: "var(--text-secondary)", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
          Browse your past intelligence extraction queries and results.
        </p>
      </div>

      {isEmpty ? (
        /* Empty State */
        <div
          className="glass-card"
          style={{
            padding: "72px 40px",
            textAlign: "center",
            background: "rgba(255, 255, 255, 0.5)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.4)",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "var(--radius-xl)",
              background: "var(--surface-200)",
              border: "1px dashed var(--border-default)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <Clock size={28} style={{ color: "var(--text-muted)", opacity: 0.5 }} />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
            No queries yet
          </h3>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 28, maxWidth: 360, margin: "0 auto 28px" }}>
            Submit your first research query to see results appear here.
          </p>
          <button
            onClick={onGoToSearch}
            className="btn btn--primary"
            style={{ fontSize: 14, padding: "12px 28px" }}
          >
            <Search size={16} />
            Start Searching
          </button>
        </div>
      ) : (
        /* Query List */
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {visibleHistory.map((item, i) => {
            const time = item.created_at
              ? new Date(item.created_at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "";

            const confidence = item.extracted_data?.confidence_score;
            const confPct = confidence ? Math.round(confidence * 100) : null;
            const topic = item.extracted_data?.topic;
            const geography = item.extracted_data?.geography;
            const industry = item.extracted_data?.industry;

            return (
              <button
                key={item.id}
                id={`history-page-item-${i}`}
                onClick={() => onSelect(item)}
                className="glass-card"
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "22px 28px",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 20,
                  transition: "all 0.25s var(--ease-out)",
                  background: "rgba(255, 255, 255, 0.5)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Topic */}
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: 4,
                      lineHeight: 1.3,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {topic || item.raw_query?.slice(0, 80)}
                  </p>

                  {/* Source query preview */}
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-muted)",
                      fontStyle: "italic",
                      marginBottom: 10,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    "{item.raw_query}"
                  </p>

                  {/* Meta badges */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {time && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: "var(--text-muted)",
                          padding: "3px 10px",
                          borderRadius: "var(--radius-full)",
                          background: "var(--surface-200)",
                        }}
                      >
                        {time}
                      </span>
                    )}
                    {geography && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "rgb(59, 130, 246)",
                          padding: "3px 10px",
                          borderRadius: "var(--radius-full)",
                          background: "rgba(59, 130, 246, 0.1)",
                        }}
                      >
                        🌍 {geography}
                      </span>
                    )}
                    {industry && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "rgb(168, 85, 247)",
                          padding: "3px 10px",
                          borderRadius: "var(--radius-full)",
                          background: "rgba(168, 85, 247, 0.1)",
                        }}
                      >
                        🏭 {industry}
                      </span>
                    )}
                    {confPct !== null && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          fontFamily: "var(--font-mono)",
                          color: confPct >= 80 ? "var(--success)" : "var(--warning)",
                          padding: "3px 10px",
                          borderRadius: "var(--radius-full)",
                          background: confPct >= 80 ? "var(--success-bg)" : "var(--warning-bg)",
                        }}
                      >
                        {confPct}% confidence
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "var(--radius-md)",
                    background: "var(--surface-200)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
                </div>
              </button>
            );
          })}

          {history.length > 4 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="btn btn--ghost"
              style={{
                marginTop: 16,
                padding: "14px 28px",
                alignSelf: "center",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {showAll ? "Show Less" : "Show All"}
            </button>
          )}
        </div>
      )}
    </div>
    </div>
  );
}
