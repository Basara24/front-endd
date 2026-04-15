/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient, getApiErrorMessage } from "../api/client";
import { Alert } from "../components/Alert";
import { PageShell } from "../components/PageShell";

export default function EditEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setError("");
      try {
        const res = await apiClient.get(`/events/${id}`);
        const e = res.data;
        setForm({
          name: e?.name ?? "",
          description: e?.description ?? "",
          date: (e?.date ?? "").slice(0, 10),
          location: e?.location ?? "",
        });
      } catch (err) {
        setError(getApiErrorMessage(err, "Erro ao carregar evento."));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.description || !form.date || !form.location) {
      return setError("Preencha todos os campos obrigatórios.");
    }

    setSaving(true);
    try {
      await apiClient.put(`/events/${id}`, {
        name: form.name,
        description: form.description,
        date: form.date,
        location: form.location,
      });
      navigate(`/evento/${id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Erro ao atualizar evento."));
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <PageShell title="Editar evento" showHome showBack>
        <div>Carregando...</div>
      </PageShell>
    );

  return (
    <PageShell title="Editar evento" showHome showBack>
      <form onSubmit={handleSave} style={{ display: "grid", gap: 12, maxWidth: 720 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Nome*</span>
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Descrição*</span>
          <textarea name="description" value={form.description} onChange={handleChange} required />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Data*</span>
          <input type="date" name="date" value={form.date} onChange={handleChange} required />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Local*</span>
          <input name="location" value={form.location} onChange={handleChange} required />
        </label>

        {error && (
          <Alert variant="error">{error}</Alert>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button type="button" onClick={() => navigate(-1)} className="app-btn">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="app-btn app-btn-primary">
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </PageShell>
  );
}

