/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { apiClient, getApiErrorMessage } from "../api/client";
import { validateEmail } from "../utils/validation";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });
  const [erro, setErro] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    const { email, senha } = formData;

    if (!email || !senha) {
      return setErro("Preencha todos os campos.");
    }

    if (!validateEmail(email)) {
      return setErro("E-mail inválido.");
    }

    try {
      const response = await apiClient.post("/users/login", {
        email,
        password: senha,
      });

      const { token } = response.data;
      await login(token);

      navigate("/home");
    } catch (err: any) {
      setErro(getApiErrorMessage(err, "Erro ao fazer login."));
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="login-title">Login</h1>

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="login-input"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="senha"
          placeholder="Senha"
          className="login-input"
          value={formData.senha}
          onChange={handleChange}
        />

        {erro && <p className="login-error">{erro}</p>}

        <button type="submit" className="login-button">
          Entrar
        </button>

        <div className="login-links">
          <Link to="/register" className="login-link">
            Não tem uma conta? Registre-se
          </Link>
        </div>
      </form>
    </div>
  );
}
