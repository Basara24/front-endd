import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./EventDetails.css";
import { apiClient, getApiErrorMessage } from "../api/client";

interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  image_url: string | null;
  organizer_id?: number;
  organizer?: {
    id: number;
    name: string;
    avatar_url: string | null;
  };
}

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [participating, setParticipating] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [registrationError, setRegistrationError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await apiClient.get(`/events/${id}`);
        setEvent(response.data);
      } catch (err) {
        setError(
          getApiErrorMessage(
            err,
            "Erro ao carregar detalhes do evento. Por favor, tente novamente mais tarde."
          )
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleParticipate = async () => {
    if (!event) return;

    try {
      setParticipating(true);
      setRegistrationError("");

      await apiClient.post(`/events/${id}/register`, {});

      alert("Inscrição realizada com sucesso!");
      // Atualizar o estado do evento para refletir a nova inscrição
      const updatedEvent = await apiClient.get(`/events/${id}`);
      setEvent(updatedEvent.data);
    } catch (err: any) {
      console.error("Erro ao participar do evento:", err);
      if (err.response?.status === 401) {
        setRegistrationError(
          "Você precisa estar logado para participar do evento."
        );
      } else if (err.response?.status === 409) {
        setRegistrationError("Você já está inscrito neste evento.");
      } else {
        setRegistrationError(
          getApiErrorMessage(err, "Erro ao participar do evento. Por favor, tente novamente.")
        );
      }
    } finally {
      setParticipating(false);
    }
  };

  if (loading) {
    return (
      <div className="event-details-container">
        <div className="event-details-content">
          <div className="event-details-info">
            <div className="event-details-loading">
              <div className="event-details-loading-spinner"></div>
              <p>Carregando detalhes do evento...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-details-container">
        <div className="event-details-content">
          <div className="event-details-info">
            <div className="event-details-error">
              <svg
                className="event-details-error-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>{error || "Evento não encontrado"}</p>
              <button
                onClick={() => navigate("/home")}
                className="event-details-button event-details-button-primary"
              >
                Voltar para Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(event.date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Construir a URL completa da imagem
  const imageUrl = event.image_url
    ? `http://localhost:3000${event.image_url}`
    : null;

  return (
    <div className="event-details-container">
      <div className="event-details-content">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={event.name}
            className="event-details-image"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="event-details-image-placeholder">
            <svg
              className="event-details-image-placeholder-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        <div className="event-details-info">
          <h1 className="event-details-title">{event.name}</h1>

          <div className="event-details-meta">
            <div className="event-details-meta-item">
              <svg
                className="event-details-meta-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {formattedDate}
            </div>
            <div className="event-details-meta-item">
              <svg
                className="event-details-meta-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {event.location}
            </div>
          </div>

          <div className="event-details-description-container">
            <h3 className="event-details-description-title">Sobre o Evento</h3>
            <p className="event-details-description">{event.description}</p>
          </div>

          {event.organizer && (
            <div className="event-details-organizer">
              <h3 className="event-details-organizer-title">Organizador</h3>
              <div className="event-details-organizer-info">
                {event.organizer.avatar_url ? (
                  <img
                    src={`http://localhost:3000${event.organizer.avatar_url}`}
                    alt={event.organizer.name}
                    className="event-details-organizer-avatar"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                ) : (
                  <div className="event-details-organizer-avatar">
                    {event.organizer.name.charAt(0)}
                  </div>
                )}
                <span className="event-details-organizer-name">
                  {event.organizer.name}
                </span>
              </div>
            </div>
          )}

          <div className="event-details-actions">
            <button
              onClick={() => navigate("/home")}
              className="event-details-button event-details-button-secondary"
            >
              Voltar
            </button>
            <button
              onClick={() => navigate(`/evento/${event.id}/edit`)}
              className="event-details-button event-details-button-secondary"
            >
              Editar
            </button>
            <button
              onClick={async () => {
                if (!confirm("Tem certeza que deseja excluir este evento?")) return;
                try {
                  await apiClient.delete(`/events/${event.id}`);
                  alert("Evento excluído.");
                  navigate("/home");
                } catch (err) {
                  alert(getApiErrorMessage(err, "Erro ao excluir evento."));
                }
              }}
              className="event-details-button event-details-button-secondary"
            >
              Excluir
            </button>
            <button
              onClick={handleParticipate}
              className="event-details-button event-details-button-primary"
              disabled={participating}
            >
              {participating ? "Participando..." : "Participar do Evento"}
            </button>
          </div>

          {registrationError && (
            <div className="event-details-error-message">
              {registrationError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
