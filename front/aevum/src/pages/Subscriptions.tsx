/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { apiClient, getApiErrorMessage } from "../api/client";
import { Pagination } from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/Alert";
import { PageShell } from "../components/PageShell";

type Subscription = {
  id: number;
  user_id: number;
  plan: "mensal" | "anual";
  status: "ativa" | "cancelada";
  start_date: string;
  end_date: string;
};

export default function Subscriptions() {
  const { user } = useAuth();
  const [items, setItems] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const totalPages = useMemo(() => Math.ceil(items.length / pageSize), [items.length]);
  const visible = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page]
  );

  const load = async () => {
    if (!user?.id) return;
    setError("");
    setLoading(true);
    try {
      const res = await apiClient.get(`/subscriptions/${user.id}`);
      setItems(res.data ?? []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Erro ao carregar assinaturas."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const cancel = async (id: number) => {
    if (!confirm("Cancelar esta assinatura?")) return;
    try {
      await apiClient.delete(`/signature/${id}`);
      await load();
    } catch (err) {
      alert(getApiErrorMessage(err, "Erro ao cancelar assinatura."));
    }
  };

  const renew = async (s: Subscription) => {
    try {
      await apiClient.put(`/signature/${s.id}`, { plan: s.plan, status: "ativa" });
      await load();
    } catch (err) {
      alert(getApiErrorMessage(err, "Erro ao renovar assinatura."));
    }
  };

  if (loading)
    return (
      <PageShell title="Assinaturas" showHome>
        <div>Carregando...</div>
      </PageShell>
    );

  return (
    <PageShell title="Assinaturas" showHome>
      <div className="app-panel">
        {error && (
          <Alert variant="error">{error}</Alert>
        )}

        {items.length === 0 ? (
          <p className="app-muted">Nenhuma assinatura encontrada.</p>
        ) : (
          <>
            <div className="app-list">
              {visible.map((s) => (
                <div key={s.id} className="app-list-item">
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>
                      #{s.id} • {s.plan.toUpperCase()} • {s.status.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.8 }}>
                      Início: {new Date(s.start_date).toLocaleDateString("pt-BR")} • Fim:{" "}
                      {new Date(s.end_date).toLocaleDateString("pt-BR")}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                      minWidth: 220,
                    }}
                  >
                    <button onClick={() => renew(s)} className="app-btn app-btn-primary">
                      Renovar
                    </button>
                    <button onClick={() => cancel(s.id)} className="app-btn app-btn-danger">
                      Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </PageShell>
  );
}

