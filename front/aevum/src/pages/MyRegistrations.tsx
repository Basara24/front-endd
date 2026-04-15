/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { apiClient, getApiErrorMessage } from "../api/client";
import { Pagination } from "../components/Pagination";
import { Alert } from "../components/Alert";
import { PageShell } from "../components/PageShell";

type Registration = {
  id: number;
  event_id: number;
  registration_date: string;
  event?: {
    id: number;
    name: string;
    date: string;
    location: string;
  };
};

export default function MyRegistrations() {
  const [items, setItems] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const totalPages = useMemo(() => Math.ceil(items.length / pageSize), [items.length]);
  const visible = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page]
  );

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await apiClient.get("/me");
      setItems(res.data ?? []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Erro ao carregar suas inscrições."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cancel = async (eventId: number) => {
    if (!confirm("Cancelar sua inscrição nesse evento?")) return;
    try {
      await apiClient.delete(`/events/${eventId}/register`);
      await load();
    } catch (err) {
      alert(getApiErrorMessage(err, "Erro ao cancelar inscrição."));
    }
  };

  if (loading)
    return (
      <PageShell title="Minhas inscrições" showHome>
        <div>Carregando...</div>
      </PageShell>
    );

  return (
    <PageShell title="Minhas inscrições" showHome>
      {error && (
        <Alert variant="error">{error}</Alert>
      )}

      {items.length === 0 ? (
        <p className="app-muted">Você ainda não está inscrito em nenhum evento.</p>
      ) : (
        <>
          <div className="app-list">
            {visible.map((r) => (
              <div
                key={r.id}
                className="app-list-item"
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700 }}>{r.event?.name ?? `Evento #${r.event_id}`}</div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>
                    {r.event?.date ? new Date(r.event.date).toLocaleString("pt-BR") : ""}
                    {r.event?.location ? ` • ${r.event.location}` : ""}
                  </div>
                </div>
                <button onClick={() => cancel(r.event_id)} className="app-btn">
                  Cancelar
                </button>
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </PageShell>
  );
}

