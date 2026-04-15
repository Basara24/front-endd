import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import EventCard from "../components/EventCard";
import "./Home.css";
import { apiClient, getApiErrorMessage } from "../api/client";
import { Pagination } from "../components/Pagination";
import { useAuth } from "../context/AuthContext";

interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  image_url: string | null;
}

export default function Home() {
  const { user, logout } = useAuth();
  const [userType, setUserType] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 9;

  useEffect(() => {
    const type = localStorage.getItem("userType");
    setUserType(type);
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await apiClient.get("/events");
      setEvents(response.data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Erro ao carregar eventos."));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    navigate("/criar-evento");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="flex flex-col items-center space-y-4">
          <div className="loading-spinner"></div>
          <p className="loading-text">Carregando eventos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <p className="error-message">{error}</p>
          <button onClick={fetchEvents} className="retry-button">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-content">
          <Link to="/" className="navbar-logo">
            <img
              src="/images/logo.png"
              alt="Aevum Logo"
              className="logo-image"
            />
          </Link>
          <div className="navigation-buttons">
            {user?.name && <span className="nav-user-pill">Olá, {user.name}</span>}
            <Link to="/signature" className="nav-button nav-button-primary">
              Assinatura
            </Link>
            <Link to="/subscriptions" className="nav-button">
              Minhas assinaturas
            </Link>
            <Link to="/registrations" className="nav-button">
              Minhas inscrições
            </Link>
            <Link to="/profile" className="nav-button">
              Perfil
            </Link>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="nav-button nav-button-danger"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      <div className="home-container">
        <div className="home-content">
          <div className="home-panel">
            <div className="home-header">
              <div className="home-title-container">
                <h1 className="home-title">Eventos Disponíveis</h1>
                <p className="home-subtitle">
                  Descubra os melhores eventos para você
                </p>
              </div>
              {userType === "organizador" && (
                <button
                  onClick={handleCreateEvent}
                  className="create-event-button"
                >
                  Criar Evento
                </button>
              )}
            </div>

            {events.length === 0 ? (
              <div className="no-events-container">
                <svg
                  className="no-events-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="no-events-title">Nenhum evento disponível</h3>
                <p className="no-events-message">
                  Não há eventos cadastrados no momento.
                </p>
              </div>
            ) : (
              <>
                <div className="events-grid">
                  {events
                    .slice((page - 1) * pageSize, page * pageSize)
                    .map((event) => (
                      <EventCard key={event.id} {...event} />
                    ))}
                </div>
                <Pagination
                  page={page}
                  totalPages={Math.ceil(events.length / pageSize)}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
