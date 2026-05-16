import { Clock, ChevronRight } from "./Icons";

export default function QueryHistory({ history, onSelect, activeId }) {
  const isEmpty = !history || history.length === 0;

  return (
    <div
      className="glass-card animate-fade-in-up"
      style={{ animationDelay: "0.1s" }}
    >
      {/* Header */}
      <div
        style={{
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            className="icon-box icon-box--sm"
            style={{
              background: "var(--warning-bg)",
              border: "1px solid var(--warning-border)",
              color: "var(--warning)",
            }}
          >
            <Clock size={14} />
          </div>
          <h2
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            Recent Queries
          </h2>
        </div>

        {!isEmpty && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
              padding: "3px 10px",
              borderRadius: "var(--radius-full)",
              background: "var(--surface-300)",
              color: "var(--text-muted)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {history.length}
          </span>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--border-subtle)", margin: "0 24px" }} />

      {/* Body */}
      {isEmpty ? (
        <div
          style={{
            padding: "40px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "var(--radius-lg)",
              background: "var(--surface-200)",
              border: "1px dashed var(--border-default)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Clock size={20} style={{ color: "var(--text-muted)", opacity: 0.5 }} />
          </div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}>
            No queries yet
          </p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", opacity: 0.6, marginTop: 4 }}>
            Your extraction history will appear here
          </p>
        </div>
      ) : (
        <div
          style={{
            padding: "12px 16px 16px",
            maxHeight: 420,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {history.map((item, i) => {
            const isActive = item.id === activeId;
            const time = item.created_at
              ? new Date(item.created_at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "";

            const confidence = item.extracted_data?.confidence_score;
            const confPct = confidence ? Math.round(confidence * 100) : null;

            return (
              <button
                key={item.id}
                id={`history-item-${i}`}
                onClick={() => onSelect(item)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "14px 16px",
                  borderRadius: "var(--radius-lg)",
                  cursor: "pointer",
                  transition: "all 0.25s var(--ease-out)",
                  position: "relative",
                  background: isActive ? "var(--surface-300)" : "transparent",
                  border: isActive
                    ? "1px solid var(--border-active)"
                    : "1px solid transparent",
                  fontFamily: "var(--font-sans)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "var(--surface-200)";
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "transparent";
                  }
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 8,
                      bottom: 8,
                      width: 3,
                      borderRadius: "var(--radius-full)",
                      background: "linear-gradient(180deg, var(--brand-400), var(--accent-500))",
                    }}
                  />
                )}

                {/* Content */}
                <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 8 }}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                      lineHeight: 1.4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      transition: "color 0.2s",
                    }}
                  >
                    {item.extracted_data?.topic || item.raw_query?.slice(0, 60)}
                  </p>
                  <ChevronRight
                    size={14}
                    style={{
                      color: isActive ? "var(--brand-300)" : "var(--text-muted)",
                      opacity: isActive ? 1 : 0.4,
                      flexShrink: 0,
                      marginTop: 2,
                      transition: "all 0.2s",
                    }}
                  />
                </div>

                {/* Meta row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 8,
                  }}
                >
                  {time && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 500,
                        color: "var(--text-muted)",
                        padding: "2px 8px",
                        borderRadius: "var(--radius-full)",
                        background: "var(--surface-100)",
                      }}
                    >
                      {time}
                    </span>
                  )}
                  {confPct !== null && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        fontFamily: "var(--font-mono)",
                        color: confPct >= 80 ? "var(--success)" : "var(--warning)",
                      }}
                    >
                      {confPct}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
