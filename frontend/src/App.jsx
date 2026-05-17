import { useState, useEffect, useRef } from "react";
import QueryForm from "./components/QueryForm";
import ResultCard from "./components/ResultCard";
import LoadingSpinner from "./components/LoadingSpinner";
import HistoryPage from "./components/HistoryPage";
import AboutPage from "./components/AboutPage";
import ContactPage from "./components/ContactPage";
import { submitQuery, getRecentQueries } from "./api";
import { Zap, Search, Clock, Info, MessageSquare, Github, Sparkles, Mail, Activity } from "./components/Icons";

const NAV_ITEMS = [
  { id: "search", label: "Search", icon: <Search size={15} /> },
  { id: "history", label: "History", icon: <Clock size={15} /> },
  { id: "about", label: "About", icon: <Info size={15} /> },
  { id: "contact", label: "Contact", icon: <MessageSquare size={15} /> },
];

export default function App() {
  const [activePage, setActivePage] = useState("search");
  const [currentResult, setCurrentResult] = useState(null);
  const [queryHistory, setQueryHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);

  // Splash screen delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Sliding pill state
  const navRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    const activeEl = navRefs.current[activePage];
    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        opacity: 1,
      });
    }
  }, [activePage]);

  // Load recent queries on mount
  useEffect(() => {
    getRecentQueries()
      .then(setQueryHistory)
      .catch(() => {});
  }, []);

  const handleSubmit = async (queryText) => {
    setIsLoading(true);
    setError("");
    try {
      const result = await submitQuery(queryText);
      setCurrentResult(result);
      setQueryHistory((prev) => [result, ...prev].slice(0, 10));
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    };
  };

  const handleReviewComplete = (queryId, newStatus, updatedQuery) => {
    setQueryHistory((prev) =>
      prev.map((q) => q.id === queryId ? (updatedQuery || { ...q, status: newStatus }) : q)
    );
    if (currentResult && currentResult.id === queryId) {
      setCurrentResult((prev) => (updatedQuery || { ...prev, status: newStatus }));
    }
  };

  const handleSelectHistory = (item) => {
    setCurrentResult(item);
    setActivePage("search");
    setError("");
  };

  const navigateTo = (pageId) => {
    setActivePage(pageId);
    setMobileMenuOpen(false);
  };

  if (!isAppReady) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--surface-0)" }}>
        <div style={{ 
          animation: "float 3s ease-in-out infinite", 
          width: 120, 
          height: 120, 
          borderRadius: "30px", 
          background: "#000000", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          boxShadow: "0 12px 36px rgba(0,0,0,0.2)" 
        }}>
          <img src="/fav.png" alt="QueryIQ" style={{ width: 80, height: 80, animation: "spin 2s linear infinite" }} />
        </div>
        <h2 style={{ marginTop: 32, fontSize: 40, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.04em", animation: "fadeInUp 0.6s ease-out forwards" }}>QueryIQ</h2>
        {/* <div style={{ width: 140, height: 4, background: "var(--surface-300)", borderRadius: 4, marginTop: 24, overflow: "hidden", animation: "fadeIn 1s ease-out forwards" }}>
          <div style={{ height: "100%", background: "linear-gradient(90deg, var(--brand-400), var(--brand-600))", borderRadius: 4, animation: "widthGrow 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards" }} />
        </div> */}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", animation: "fadeIn 0.6s ease-out" }}>
      {/* ═══════════════════════════════════════════════════════
          NAVBAR
          ═══════════════════════════════════════════════════════ */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          background: "var(--navbar-bg)",
          borderBottom: "1px solid var(--border-subtle)",
          transition: "background-color 0.4s var(--ease-out)",
        }}
      >
        <div className="navbar-inner">
          {/* ── LEFT: Logo ── */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={() => navigateTo("search")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "var(--radius-lg)",
                  background: "#000000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                <img src="/fav.png" alt="logo" width={32} height={32} />
              </div>
              <span className="logo-text">QueryIQ</span>
            </button>
          </div>

          {/* ── CENTER: Desktop Navigation ── */}
          <nav className="desktop-nav" style={{ position: "relative" }}>
            {/* Sliding Pill Indicator */}
            <div
              style={{
                position: "absolute",
                top: 6,
                bottom: 6,
                left: indicatorStyle.left,
                width: indicatorStyle.width,
                opacity: indicatorStyle.opacity,
                borderRadius: "999px",
                background: "linear-gradient(135deg, var(--brand-400), var(--brand-600))",
                boxShadow: "0 6px 16px rgba(249, 115, 22, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                zIndex: 0,
              }}
            />
            {NAV_ITEMS.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  ref={(el) => (navRefs.current[item.id] = el)}
                  onClick={() => navigateTo(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 22px",
                    borderRadius: "999px",
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 500,
                    fontFamily: "var(--font-sans)",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    zIndex: 1,
                    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    background: "transparent",
                    color: isActive ? "#fff" : "var(--text-secondary)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                      e.currentTarget.style.color = "var(--text-primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* ── RIGHT: Desktop socials + Mobile hamburger ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div className="desktop-socials">
              <a href="mailto:patelpriyank2526@gmail.com" title="Email Me"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.2s var(--ease-out)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-500)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
              >
                <Mail size={22} />
              </a>
              <a href="https://github.com/Patel-Priyank-1602/QueryIQ" target="_blank" rel="noopener noreferrer" title="View on GitHub"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.2s var(--ease-out)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-500)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
              >
                <Github size={22} />
              </a>
            </div>

            {/* Hamburger button — mobile only */}
            <button
              className="hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className={`hamburger-icon ${mobileMenuOpen ? "open" : ""}`}>
                <span /><span /><span />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          MOBILE DRAWER — Slides from right
          ═══════════════════════════════════════════════════════ */}
      {mobileMenuOpen && (
        <div className="mobile-backdrop" onClick={() => setMobileMenuOpen(false)} />
      )}
      <div className={`mobile-drawer ${mobileMenuOpen ? "open" : ""}`}>
        <div style={{ padding: "24px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>Navigation</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {NAV_ITEMS.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px", borderRadius: "var(--radius-md)",
                    fontSize: 15, fontWeight: isActive ? 700 : 500,
                    fontFamily: "var(--font-sans)", border: "none", cursor: "pointer",
                    width: "100%", textAlign: "left",
                    transition: "all 0.2s var(--ease-out)",
                    background: isActive ? "linear-gradient(135deg, var(--brand-500), var(--brand-600))" : "var(--surface-200)",
                    color: isActive ? "#fff" : "var(--text-primary)",
                    boxShadow: isActive ? "0 2px 10px rgba(249,115,22,0.3)" : "none",
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ padding: "20px 20px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 14 }}>Connect</p>
          <div style={{ display: "flex", gap: 12 }}>
            <a href="mailto:patelpriyank2526@gmail.com" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: "var(--radius-md)", background: "var(--surface-200)", color: "var(--text-secondary)", textDecoration: "none" }}>
              <Mail size={20} />
            </a>
            <a href="https://github.com/Patel-Priyank-1602/QueryIQ" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: "var(--radius-md)", background: "var(--surface-200)", color: "var(--text-secondary)", textDecoration: "none" }}>
              <Github size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MAIN CONTENT
          ═══════════════════════════════════════════════════════ */}
      <main style={{ flex: 1, width: "100%", margin: "0 auto", padding: "24px 16px" }}>
        {activePage === "search" && (
          <SearchPage
            onSubmit={handleSubmit}
            isLoading={isLoading}
            currentResult={currentResult}
            error={error}
            onReviewComplete={handleReviewComplete}
          />
        )}
        {activePage === "history" && (
          <HistoryPage
            history={queryHistory}
            onSelect={handleSelectHistory}
            onGoToSearch={() => setActivePage("search")}
          />
        )}
        {activePage === "about" && <AboutPage />}
        {activePage === "contact" && <ContactPage />}
      </main>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════ */}
      <footer style={{ marginTop: "auto", borderTop: "1px solid var(--border-subtle)", padding: "24px 0" }}>
        <div className="footer-inner">
          <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
            © {new Date().getFullYear()} QueryIQ — Built by Priyank Patel
          </p>
          <div className="footer-links">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color 0.2s var(--ease-out)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-500)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════
          RESPONSIVE STYLES
          ═══════════════════════════════════════════════════════ */}
      <style>{`
        /* ── Navbar ── */
        .navbar-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 28px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .logo-text {
          font-size: 24px;
          font-weight: 900;
          color: var(--text-primary);
          letter-spacing: -0.03em;
        }
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px;
          border-radius: 999px;
          background: rgba(241, 243, 248, 0.55);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.6);
          box-shadow: 0 4px 24px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(255,255,255,0.3);
        }
        .desktop-socials {
          display: flex;
          align-items: center;
        }

        /* ── Hamburger ── */
        .hamburger-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          z-index: 70;
        }
        .hamburger-icon {
          width: 22px;
          height: 16px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .hamburger-icon span {
          display: block;
          width: 100%;
          height: 2px;
          background: var(--text-primary);
          border-radius: 2px;
          transition: all 0.3s var(--ease-out);
          transform-origin: center;
        }
        .hamburger-icon.open span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .hamburger-icon.open span:nth-child(2) {
          opacity: 0;
        }
        .hamburger-icon.open span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        /* ── Mobile Drawer ── */
        .mobile-backdrop {
          display: none;
        }
        .mobile-drawer {
          position: fixed;
          top: 0;
          right: -300px;
          width: 280px;
          height: 100vh;
          background: var(--surface-50);
          border-left: 1px solid var(--border-subtle);
          z-index: 60;
          transition: right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
          box-shadow: -8px 0 32px rgba(0,0,0,0.08);
          padding-top: 80px;
        }
        .mobile-drawer.open {
          right: 0;
        }

        /* ── Footer ── */
        .footer-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .footer-links {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        /* ═══════════════════════════════════════════════
           TABLET — 768px
           ═══════════════════════════════════════════════ */
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .desktop-socials { display: none !important; }
          .hamburger-btn { display: block !important; }
          .mobile-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            z-index: 55;
            animation: fadeIn 0.25s ease;
          }
          .navbar-inner {
            padding: 0 16px;
            height: 64px;
          }
          .logo-text {
            font-size: 20px;
          }
          .footer-inner {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }
          .footer-links {
            gap: 16px;
          }
        }

        /* ═══════════════════════════════════════════════
           MOBILE — 480px
           ═══════════════════════════════════════════════ */
        @media (max-width: 480px) {
          .navbar-inner {
            padding: 0 12px;
            height: 56px;
          }
          .logo-text {
            font-size: 18px;
          }
          .mobile-drawer {
            width: 260px;
            padding-top: 56px;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   SEARCH PAGE — Single Column with Tabs
   ═══════════════════════════════════════════════════════ */
function SearchPage({ onSubmit, isLoading, currentResult, error, onReviewComplete }) {
  const [activeTab, setActiveTab] = useState("query"); // "query" | "result"

  useEffect(() => {
    if (currentResult) {
      setActiveTab("result");
    }
  }, [currentResult]);

  const handleFormSubmit = async (text) => {
    setActiveTab("result");
    await onSubmit(text);
  };

  return (
    <div 
      style={{ 
        position: "relative",
        width: "100%", 
        borderRadius: "24px", 
        overflow: "hidden", 
        padding: "clamp(20px, 5vw, 48px) clamp(10px, 3vw, 20px) clamp(32px, 5vw, 64px)",
        marginTop: "-16px", /* Adjust for main padding if needed */
      }}
    >
      {/* The Background Image covering the entire Search Page */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          /* IMPORTANT: Please save your image as 'bg-image.png' in the frontend/public folder! */
          backgroundImage: "url('/bg-image.png')",
          backgroundSize: "cover",
          backgroundPosition: "top center",
          /* Fades out the image at the top to blend with the background */
          maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 100%)",
          opacity: 0.85,
          zIndex: -1,
        }}
      />

      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Hero Section */}
      <div
        className="animate-fade-in-up"
        style={{
          textAlign: "center",
          marginBottom: "clamp(20px, 4vw, 48px)",
        }}
      >
        {/* <div
          className="tag"
          style={{
            background: "rgba(249, 115, 22, 0.08)",
            border: "1px solid rgba(249, 115, 22, 0.15)",
            color: "var(--brand-400)",
            marginBottom: 20,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <Sparkles size={14} />
          Groq LLaMA 3.3 Powered
        </div> */}

        <h2
          style={{
            fontSize: "clamp(22px, 5vw, 48px)",
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
            marginBottom: 16,
          }}
        >
          Intelligence <span className="gradient-text">Extraction</span>
        </h2>

        <p
          style={{
            fontSize: "clamp(12px, 2vw, 16px)",
            color: "var(--text-secondary)",
            maxWidth: 580,
            margin: "0 auto",
            lineHeight: 1.7,
            fontWeight: 400,
          }}
        >
          Enter a natural language request to instantly extract and structure key intelligence points.
        </p>
      </div>

      {/* Segmented Control Tabs */}
      <div
        className="animate-fade-in-up segmented-tabs"
        style={{
          display: "flex",
          background: "var(--surface-200)",
          padding: 4,
          borderRadius: "var(--radius-lg)",
          width: "fit-content",
          margin: "0 auto clamp(16px, 3vw, 32px)",
          border: "1px solid var(--border-subtle)",
          animationDelay: "0.1s",
        }}
      >
        <button
          onClick={() => setActiveTab("query")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 28px",
            borderRadius: "var(--radius-md)",
            border: "none",
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "var(--font-sans)",
            cursor: "pointer",
            transition: "all 0.25s var(--ease-out)",
            background: activeTab === "query" ? "var(--surface-100)" : "transparent",
            color: activeTab === "query" ? "var(--text-primary)" : "var(--text-secondary)",
            boxShadow: activeTab === "query" ? "var(--shadow-sm)" : "none",
          }}
        >
          <img src="/newquery.png" alt="New Query" style={{ width: 25, height: 25, objectFit: "contain", filter: activeTab !== "query" ? "grayscale(100%) opacity(0.7)" : "none", transition: "all 0.2s" }} />
          New Query
        </button>
        <button
          onClick={() => setActiveTab("result")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 28px",
            borderRadius: "var(--radius-md)",
            border: "none",
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "var(--font-sans)",
            cursor: "pointer",
            transition: "all 0.25s var(--ease-out)",
            background: activeTab === "result" ? "var(--surface-100)" : "transparent",
            color: activeTab === "result" ? "var(--text-primary)" : "var(--text-secondary)",
            boxShadow: activeTab === "result" ? "var(--shadow-sm)" : "none",
          }}
        >
          <img src="/result.png" alt="Result" style={{ width: 25, height: 25, objectFit: "contain", filter: activeTab !== "result" ? "grayscale(100%) opacity(0.7)" : "none", transition: "all 0.2s" }} />
          Result
        </button>
      </div>

      {/* Content Area */}
      <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        {/* Error Banner */}
        {error && (
          <div
            className="animate-scale-in"
            style={{
              marginBottom: 24,
              padding: "14px 20px",
              borderRadius: "var(--radius-lg)",
              background: "var(--error-bg)",
              border: "1px solid var(--error-border)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-md)",
                background: "rgba(248, 113, 113, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 16 }}>⚠</span>
            </div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--error)" }}>
              {error}
            </p>
          </div>
        )}

        {/* Tab Content */}
        <div style={{ position: "relative" }}>
          {activeTab === "query" && (
            <QueryForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          )}

          {activeTab === "result" && (
            <div>
              {isLoading ? (
                <div
                  className="glass-card"
                  style={{
                    padding: 64,
                    minHeight: 380,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <LoadingSpinner />
                </div>
              ) : currentResult ? (
                <ResultCard data={currentResult} onReviewComplete={onReviewComplete} />
              ) : (
                <EmptyState onSwitchToQuery={() => setActiveTab("query")} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}


/* ─── Empty State ─── */
function EmptyState({ onSwitchToQuery }) {
  return (
    <div
      className="glass-card animate-fade-in-up"
      style={{
        padding: "64px 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 420,
        textAlign: "center",
        animationDelay: "0.15s",
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "var(--radius-xl)",
          background: "var(--surface-200)",
          border: "1px solid var(--border-default)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 28,
          animation: "float 4s ease-in-out infinite",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "var(--radius-lg)",
            background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(245,158,11,0.1))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Sparkles size={24} style={{ color: "var(--brand-300)" }} />
        </div>
      </div>

      <h3
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 8,
          letterSpacing: "-0.01em",
        }}
      >
        Ready to Analyze
      </h3>
      <p
        style={{
          fontSize: 14,
          color: "var(--text-secondary)",
          maxWidth: 340,
          lineHeight: 1.6,
        }}
      >
        Enter a research query on the left and structured intelligence will
        appear here in real-time.
      </p>

      {/* Feature hints */}
      <div
        style={{
          marginTop: 32,
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "center",
        }}
      >
        {["Topic Extraction", "Geo Detection", "Keyword Mining", "Intent Analysis"].map(
          (f, i) => (
            <span
              key={f}
              className="tag"
              style={{
                background: "var(--surface-300)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-muted)",
                fontSize: 11,
              }}
            >
              {f}
            </span>
          )
        )}
      </div>

      <button
        onClick={onSwitchToQuery}
        className="btn btn--primary"
        style={{ marginTop: 32, padding: "12px 24px", fontSize: 13 }}
      >
        <Zap size={14} /> Write a Query
      </button>
    </div>
  );
}
