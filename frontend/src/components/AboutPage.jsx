import {
  Zap, Globe, Database, Cpu, Shield, Sparkles,
  Github, Linkedin, Twitter, Mail, MapPin, Heart, Code, ExternalLink,
} from "./Icons";

export default function AboutPage() {
  return (
    <div className="about-page" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      
      {/* ── PROJECT SECTION WRAPPER ── */}
      <div 
        className="about-section-wrapper"
        style={{ 
          position: "relative",
          width: "100%", 
          borderRadius: "24px", 
          overflow: "hidden", 
          padding: "clamp(24px, 5vw, 48px) clamp(12px, 3vw, 20px) clamp(32px, 5vw, 64px)",
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
        <div className="animate-fade-in-up about-inner">
          {/* ── PROJECT SECTION ── */}
          <section>
            {/* Section header */}
            <div style={{ textAlign: "center", marginBottom: "clamp(20px, 4vw, 40px)" }}>
              <h2 className="about-heading">
                What is <span className="gradient-text">QueryIQ</span>?
              </h2>
              <p className="about-subtext">
                A full-stack Query Intelligence Engine that extracts structured data from natural language research queries using AI.
              </p>
            </div>

            {/* Project description card */}
            <div className="glass-card about-card">
              <p className="about-body">
                <strong style={{ color: "var(--text-primary)" }}>QueryIQ</strong> takes natural language research queries like
                <em style={{ color: "var(--brand-300)" }}> "What companies are leading autonomous vehicle development in Europe?"</em> and
                extracts structured intelligence — including topic, geography, industry, entity type, intent, keywords, and a confidence score.
              </p>
              <p className="about-body" style={{ marginBottom: 0 }}>
                All results are persisted in <strong style={{ color: "var(--text-primary)" }}>Supabase</strong> (PostgreSQL) and viewable in a sleek, responsive React dashboard.
                The AI engine is powered by <strong style={{ color: "var(--text-primary)" }}>Groq</strong> running <strong style={{ color: "var(--text-primary)" }}>LLaMA 3.3 70B</strong> for fast, high-quality extraction.
              </p>
            </div>

            {/* Tech stack icons */}
            <div className="about-tech-icons">
              <div className="about-tech-row">
                {[{ src: "/talivy.png", name: "Tavily" }, { src: "/react.png", name: "React" }, { src: "/fast.png", name: "FastAPI" }].map((t) => (
                  <div key={t.name} className="about-tech-item">
                    <img src={t.src} alt={t.name} title={t.name} />
                  </div>
                ))}
              </div>
              <div className="about-tech-row">
                {[{ src: "/groq.png", name: "Groq" }, { src: "/supabase.png", name: "Supabase" }].map((t) => (
                  <div key={t.name} className="about-tech-item">
                    <img src={t.src} alt={t.name} title={t.name} />
                  </div>
                ))}
              </div>
            </div>

            {/* Features list */}
            <div className="glass-card about-card">
              <h3 className="about-features-title">
                <Shield size={14} style={{ color: "var(--brand-300)" }} />
                Key Features
              </h3>
              <div className="about-features-grid">
                {[
                  "AI-powered query intelligence extraction",
                  "Real-time structured data output",
                  "Confidence scoring for each result",
                  "Persistent storage with Supabase",
                  "Copy & download results as JSON",
                  "Fast inference via Groq API",
                ].map((feature) => (
                  <div key={feature} className="about-feature-item">
                    <span className="about-feature-dot" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ── DIVIDER LINE ── */}
      <div className="about-divider">
        <div className="about-divider-line" />
        <span className="about-divider-icon">✦</span>
        <div className="about-divider-line" />
      </div>

      {/* ── ABOUT ME SECTION WRAPPER ── */}
      <div 
        className="about-section-wrapper"
        style={{ 
          position: "relative",
          width: "100%", 
          borderRadius: "24px", 
          overflow: "hidden", 
          padding: "clamp(24px, 5vw, 48px) clamp(12px, 3vw, 20px) clamp(32px, 5vw, 64px)",
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
        <div className="animate-fade-in-up about-inner">
          {/* ── ABOUT ME SECTION ── */}
          <section>
            <div style={{ textAlign: "center", marginBottom: "clamp(16px, 3vw, 36px)" }}>
              <h2 className="about-heading">
                Hi, I'm <span className="gradient-text">Priyank Patel</span>
              </h2>
            </div>

            <div className="glass-card about-card about-me-card">
              {/* Profile Image */}
              <div className="about-profile-img-wrap">
                <div className="about-profile-img-border">
                  <img
                    src="https://github.com/Patel-Priyank-1602.png"
                    alt="Priyank Patel"
                    className="about-profile-img"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:36px;border-radius:calc(var(--radius-xl) - 3px);background:var(--surface-200)">👨‍💻</div>';
                    }}
                  />
                </div>
              </div>

              {/* Bio */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="about-body">
                  I'm a passionate Full-Stack Developer and AI enthusiast who loves building production-grade web applications.
                  I specialize in <strong style={{ color: "var(--text-primary)" }}>React</strong>, <strong style={{ color: "var(--text-primary)" }}>FastAPI</strong>, <strong style={{ color: "var(--text-primary)" }}>Next.js</strong>, and integrating modern AI APIs to solve real-world problems.
                </p>
                <p className="about-body">
                  QueryIQ is one of my projects that showcases how AI can transform unstructured research queries into actionable intelligence. I'm always open to collaboration and new opportunities!
                </p>

                {/* Social Links */}
                <div className="about-socials">
                  {[
                    { icon: <Github size={14} />, label: "GitHub", href: "https://github.com/Patel-Priyank-1602", color: "var(--text-primary)" },
                    { icon: <Linkedin size={14} />, label: "LinkedIn", href: "https://linkedin.com/in/priyank-patel", color: "#0077b5" },
                    { icon: <Mail size={14} />, label: "Email", href: "mailto:priyankpatel1602@gmail.com", color: "var(--error)" },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--ghost about-social-btn"
                      style={{ textDecoration: "none" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = link.color;
                        e.currentTarget.style.borderColor = link.color;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--text-secondary)";
                        e.currentTarget.style.borderColor = "var(--border-default)";
                      }}
                    >
                      {link.icon}
                      {link.label}
                      <ExternalLink size={9} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ── ABOUT PAGE STYLES ── */}
      <style>{`
        .about-inner {
          max-width: 900px;
          margin: 0 auto;
        }
        .about-heading {
          font-size: clamp(20px, 4vw, 40px);
          font-weight: 900;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          margin-bottom: clamp(6px, 1.5vw, 12px);
          line-height: 1.15;
        }
        .about-subtext {
          font-size: clamp(12px, 1.8vw, 15px) !important;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.7;
        }
        .about-card {
          padding: clamp(16px, 3vw, 32px) clamp(14px, 3vw, 36px) !important;
          background: rgba(255, 255, 255, 0.5) !important;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.4) !important;
          margin-bottom: clamp(14px, 2vw, 28px);
        }
        .about-body {
          font-size: clamp(12px, 1.6vw, 15px) !important;
          color: var(--text-secondary);
          line-height: 1.75 !important;
          margin-bottom: clamp(10px, 2vw, 20px);
        }

        /* Tech icons */
        .about-tech-icons {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(14px, 2.5vw, 22px);
          margin: clamp(20px, 4vw, 40px) 0;
        }
        .about-tech-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: clamp(20px, 5vw, 40px);
        }
        .about-tech-item {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .about-tech-item img {
          height: clamp(28px, 5vw, 48px);
          object-fit: contain;
        }

        /* Features */
        .about-features-title {
          font-size: clamp(13px, 1.8vw, 16px) !important;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: clamp(10px, 2vw, 16px);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .about-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: clamp(6px, 1.5vw, 12px);
        }
        .about-feature-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: clamp(11px, 1.4vw, 13px);
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .about-feature-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--brand-400), var(--accent-500));
          flex-shrink: 0;
        }

        /* Divider */
        .about-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: clamp(8px, 2vw, 16px) clamp(20px, 5vw, 60px);
        }
        .about-divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border-default), transparent);
        }
        .about-divider-icon {
          font-size: clamp(10px, 1.5vw, 14px);
          color: var(--brand-400);
          opacity: 0.7;
        }

        /* About Me card */
        .about-me-card {
          display: flex;
          gap: clamp(16px, 3vw, 32px);
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
        }
        .about-profile-img-wrap {
          flex-shrink: 0;
        }
        .about-profile-img-border {
          width: clamp(80px, 15vw, 140px);
          height: clamp(80px, 15vw, 140px);
          border-radius: var(--radius-xl);
          background: linear-gradient(135deg, var(--brand-500), var(--accent-500));
          padding: 2px;
          box-shadow: var(--shadow-lg), 0 0 20px rgba(249,115,22,0.15);
        }
        .about-profile-img {
          width: 100%;
          height: 100%;
          border-radius: calc(var(--radius-xl) - 2px);
          object-fit: cover;
          display: block;
        }

        /* Social buttons */
        .about-socials {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .about-social-btn {
          font-size: clamp(10px, 1.3vw, 12px) !important;
          gap: 5px !important;
          padding: clamp(5px, 1vw, 8px) clamp(10px, 2vw, 16px) !important;
        }

        /* ── MOBILE 480px ── */
        @media (max-width: 480px) {
          .about-section-wrapper {
            border-radius: var(--radius-lg) !important;
          }
          .about-features-grid {
            grid-template-columns: 1fr !important;
            gap: 4px !important;
          }
          .about-feature-item {
            gap: 6px;
          }
          .about-me-card {
            flex-direction: column !important;
            text-align: center;
          }
          .about-socials {
            justify-content: center;
          }
          .about-body {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
}
