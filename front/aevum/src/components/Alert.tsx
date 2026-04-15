import React from "react";

export function Alert({
  variant,
  children,
}: {
  variant: "error" | "success";
  children: React.ReactNode;
}) {
  const styles =
    variant === "error"
      ? { background: "#fee2e2", color: "#7f1d1d" }
      : { background: "#dcfce7", color: "#14532d" };

  return (
    <div style={{ ...styles, padding: 10, borderRadius: 8 }}>
      {children}
    </div>
  );
}

