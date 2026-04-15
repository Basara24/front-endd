import React from "react";

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 16,
        flexWrap: "wrap",
      }}
    >
      <button className="app-btn" onClick={() => onPageChange(1)} disabled={page === 1}>
        {"<<"}
      </button>
      <button className="app-btn" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
        {"<"}
      </button>
      <span style={{ fontSize: 14, opacity: 0.85 }}>
        Página <strong>{page}</strong> de <strong>{totalPages}</strong>
      </span>
      <button
        className="app-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        {">"}
      </button>
      <button
        className="app-btn"
        onClick={() => onPageChange(totalPages)}
        disabled={page === totalPages}
      >
        {">>"}
      </button>
    </div>
  );
}

