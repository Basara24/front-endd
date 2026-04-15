import React from "react";
import { Link, useNavigate } from "react-router-dom";

export function PageShell({
  title,
  showHome = true,
  showBack = false,
  children,
}: {
  title?: string;
  showHome?: boolean;
  showBack?: boolean;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <div className="app-card">
        <div className="app-topbar">
          <div className="app-topbar-title">{title ?? "Aevum"}</div>
          <div className="app-actions">
            {showBack && (
              <button className="app-btn" onClick={() => navigate(-1)}>
                Voltar
              </button>
            )}
            {showHome && (
              <Link to="/home" className="app-btn">
                Home
              </Link>
            )}
          </div>
        </div>
        <div style={{ padding: 16 }}>{children}</div>
      </div>
    </div>
  );
}

