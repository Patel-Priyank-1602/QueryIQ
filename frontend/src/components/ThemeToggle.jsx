import { Sun, Moon } from "./Icons";

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";

  return (
    <button
      id="theme-toggle-btn"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <div className="theme-toggle__track">
        <div className="theme-toggle__thumb">
          {isDark ? (
            <Moon size={12} style={{ color: "#fff" }} />
          ) : (
            <Sun size={12} style={{ color: "#fff" }} />
          )}
        </div>
      </div>
    </button>
  );
}
