/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateEvent.css";
import { apiClient, getApiErrorMessage } from "../api/client";
import { PageShell } from "../components/PageShell";

export default function CreateEvent() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
    image: null as File | null,
  });

  const [erro, setErro] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("date", form.date);
      formData.append("location", form.location);

      if (form.image) {
        formData.append("image", form.image);
      }

      const response = await apiClient.post("/events", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Evento criado:", response.data);
      navigate("/home");
    } catch (err: any) {
      console.error(err);
      setErro(getApiErrorMessage(err, "Erro ao criar evento."));
    }
  };

  return (
    <PageShell title="Criar evento" showHome showBack>
      <div className="create-event-container" style={{ minHeight: "auto", padding: 0, background: "transparent" }}>
        <form className="create-event-form" onSubmit={handleSubmit}>
        <h1 className="create-event-title">Criar Evento</h1>
        <p className="create-event-subtitle">
          Preencha os detalhes do seu evento abaixo
        </p>

        <div className="create-event-input-group">
          <label htmlFor="name" className="create-event-label">
            Nome do Evento
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="create-event-input"
            value={form.name}
            onChange={handleChange}
            placeholder="Digite o nome do evento"
            required
          />
        </div>

        <div className="create-event-input-group">
          <label htmlFor="description" className="create-event-label">
            Descrição
          </label>
          <textarea
            id="description"
            name="description"
            className="create-event-textarea"
            value={form.description}
            onChange={handleChange}
            placeholder="Descreva o seu evento"
            required
          />
        </div>

        <div className="create-event-input-group">
          <label htmlFor="date" className="create-event-label">
            Data
          </label>
          <input
            type="date"
            id="date"
            name="date"
            className="create-event-input"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="create-event-input-group">
          <label htmlFor="location" className="create-event-label">
            Local
          </label>
          <input
            type="text"
            id="location"
            name="location"
            className="create-event-input"
            value={form.location}
            onChange={handleChange}
            placeholder="Digite o local do evento"
            required
          />
        </div>

        <div className="create-event-input-group">
          <label htmlFor="image" className="create-event-label">
            Imagem do Evento
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            className="create-event-file-input"
            onChange={handleFileChange}
          />
          {previewUrl && (
            <div className="create-event-preview">
              <img
                src={previewUrl}
                alt="Preview"
                className="create-event-preview-image"
              />
            </div>
          )}
        </div>

        {erro && <p className="create-event-error">{erro}</p>}

        <button type="submit" className="create-event-button">
          Criar Evento
        </button>
      </form>
      </div>
    </PageShell>
  );
}
