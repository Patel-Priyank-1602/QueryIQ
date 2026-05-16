import { useState } from "react";
import { Mail, Send, MessageSquare, User, Check, AlertCircle } from "./Icons";

export default function ContactPage() {
  const [formState, setFormState] = useState({
    email: "",
    name: "",
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("https://formspree.io/f/xqenrwyj", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: formState.email,
          name: formState.name,
          message: formState.message,
        }),
      });

      if (res.ok) {
        setStatus("success");
        setFormState({ email: "", name: "", message: "" });
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data?.errors?.[0]?.message || "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div 
        className="contact-wrapper"
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
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: "url('/bg-con.png')",
            backgroundSize: "cover",
            backgroundPosition: "top center",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 100%)",
            opacity: 0.85,
            zIndex: -1,
          }}
        />
        <div className="animate-scale-in contact-inner">
          <div
            className="glass-card contact-card"
            style={{ textAlign: "center" }}
          >
            <div className="contact-success-icon">
              <Check size={28} style={{ color: "var(--success)" }} />
            </div>
            <h2 className="contact-heading" style={{ marginBottom: 8 }}>
              Message Sent!
            </h2>
            <p className="contact-body" style={{ marginBottom: 20 }}>
              Thank you for reaching out! I'll get back to you as soon as possible.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="btn btn--primary"
              style={{ fontSize: "clamp(12px, 1.5vw, 14px)", padding: "clamp(8px, 1.5vw, 12px) clamp(16px, 3vw, 28px)" }}
            >
              <Mail size={14} />
              Send Another Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  const inputStyle = {
    width: "100%",
    padding: "clamp(10px, 1.5vw, 14px) clamp(12px, 2vw, 16px)",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-default)",
    background: "rgba(255, 255, 255, 0.6)",
    color: "var(--text-primary)",
    fontSize: "clamp(12px, 1.5vw, 14px)",
    fontFamily: "var(--font-sans)",
    outline: "none",
    transition: "all 0.25s var(--ease-out)",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: "clamp(9px, 1.2vw, 12px)",
    fontWeight: 700,
    color: "var(--text-secondary)",
    marginBottom: "clamp(4px, 1vw, 8px)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = "var(--brand-400)";
    e.target.style.boxShadow = "0 0 0 3px rgba(249, 115, 22, 0.1)";
  };
  const handleBlur = (e) => {
    e.target.style.borderColor = "var(--border-default)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div 
      className="contact-wrapper"
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
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: "url('/bg-con.png')",
          backgroundSize: "cover",
          backgroundPosition: "top center",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 100%)",
          opacity: 0.85,
          zIndex: -1,
        }}
      />
      <div className="animate-fade-in-up contact-inner">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(20px, 4vw, 40px)" }}>
          <h2 className="contact-heading">
            Contact <span className="gradient-text">Me</span>
          </h2>
          <p className="contact-subtext">
            Have a question, want to collaborate, or just say hi? Drop me a message and I'll get back to you!
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card contact-card">
          {/* Error Banner */}
          {status === "error" && (
            <div
              className="animate-scale-in"
              style={{
                marginBottom: "clamp(12px, 2vw, 24px)",
                padding: "clamp(8px, 1.5vw, 12px) clamp(10px, 2vw, 16px)",
                borderRadius: "var(--radius-md)",
                background: "var(--error-bg)",
                border: "1px solid var(--error-border)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <AlertCircle size={14} style={{ color: "var(--error)", flexShrink: 0 }} />
              <p style={{ fontSize: "clamp(11px, 1.3vw, 13px)", fontWeight: 500, color: "var(--error)" }}>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name Field */}
            <div style={{ marginBottom: "clamp(12px, 2vw, 20px)" }}>
              <label htmlFor="name" style={labelStyle}>
                <User size={11} />
                Your Name
              </label>
              <input
                id="name" type="text" name="name"
                value={formState.name} onChange={handleChange}
                required placeholder="John Doe"
                style={inputStyle}
                onFocus={handleFocus} onBlur={handleBlur}
              />
            </div>

            {/* Email Field */}
            <div style={{ marginBottom: "clamp(12px, 2vw, 20px)" }}>
              <label htmlFor="email" style={labelStyle}>
                <Mail size={11} />
                Email Address
              </label>
              <input
                id="email" type="email" name="email"
                value={formState.email} onChange={handleChange}
                required placeholder="you@example.com"
                style={inputStyle}
                onFocus={handleFocus} onBlur={handleBlur}
              />
            </div>

            {/* Message Field */}
            <div style={{ marginBottom: "clamp(16px, 3vw, 28px)" }}>
              <label htmlFor="message" style={labelStyle}>
                <MessageSquare size={11} />
                Message
              </label>
              <textarea
                id="message" name="message"
                value={formState.message} onChange={handleChange}
                required rows={4}
                placeholder="Tell me what's on your mind..."
                style={{ ...inputStyle, resize: "vertical", minHeight: "clamp(80px, 12vw, 120px)" }}
                onFocus={handleFocus} onBlur={handleBlur}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === "submitting"}
              className="btn btn--primary btn--full"
              style={{
                padding: "clamp(10px, 1.5vw, 15px) clamp(16px, 3vw, 24px)",
                fontSize: "clamp(12px, 1.5vw, 15px)",
                fontWeight: 700,
                borderRadius: "var(--radius-lg)",
              }}
            >
              {status === "submitting" ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 14, height: 14, borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.2)",
                      borderTopColor: "#fff",
                      animation: "spin 0.6s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  Sending…
                </span>
              ) : (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Send size={14} />
                  Send Message
                </span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* ── CONTACT STYLES ── */}
      <style>{`
        .contact-inner {
          max-width: 680px;
          margin: 0 auto;
        }
        .contact-heading {
          font-size: clamp(20px, 4vw, 40px) !important;
          font-weight: 900;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          margin-bottom: clamp(6px, 1.5vw, 12px);
          line-height: 1.15;
        }
        .contact-subtext {
          font-size: clamp(12px, 1.8vw, 15px) !important;
          color: var(--text-secondary);
          max-width: 480px;
          margin: 0 auto;
          line-height: 1.7;
        }
        .contact-body {
          font-size: clamp(12px, 1.6vw, 15px) !important;
          color: var(--text-secondary);
          line-height: 1.7 !important;
        }
        .contact-card {
          padding: clamp(18px, 4vw, 36px) clamp(16px, 4vw, 40px) !important;
          background: rgba(255, 255, 255, 0.5) !important;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.4) !important;
        }
        .contact-success-icon {
          width: clamp(48px, 8vw, 72px);
          height: clamp(48px, 8vw, 72px);
          border-radius: 50%;
          background: var(--success-bg);
          border: 2px solid var(--success-border);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto clamp(12px, 2vw, 24px);
        }

        @media (max-width: 480px) {
          .contact-wrapper {
            border-radius: var(--radius-lg) !important;
          }
        }
      `}</style>
    </div>
  );
}
