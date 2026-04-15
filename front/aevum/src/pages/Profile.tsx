/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiClient, getApiErrorMessage } from "../api/client";
import { getPasswordStrength, onlyDigits, validateCPF, validateEmail } from "../utils/validation";
import { Alert } from "../components/Alert";
import { PageShell } from "../components/PageShell";

export default function Profile() {
  const navigate = useNavigate();
  const { user, refreshUser, logout } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setEmail(user.email ?? "");
    setCpf(user.cpf ?? "");
  }, [user]);

  const passwordStrength = useMemo(
    () => (newPassword ? getPasswordStrength(newPassword) : null),
    [newPassword]
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user?.id) return setError("Sessão inválida. Faça login novamente.");
    if (!name.trim() || !email.trim() || !cpf.trim()) {
      return setError("Preencha nome, e-mail e CPF.");
    }
    if (!validateEmail(email)) return setError("E-mail inválido.");
    if (!validateCPF(cpf)) return setError("CPF inválido.");

    if (newPassword || confirmPassword) {
      if (getPasswordStrength(newPassword) === "fraca") {
        return setError(
          "Senha fraca. Use pelo menos 8 caracteres, com letras maiúsculas/minúsculas e números."
        );
      }
      if (newPassword !== confirmPassword) {
        return setError("As senhas não coincidem.");
      }
    }

    // Requisito: não permitir alterar e-mail
    if (user.email && email.trim() !== user.email) {
      return setError("Você não pode alterar o e-mail.");
    }

    setSaving(true);
    try {
      // Backend só valida senha no PUT, então enviamos password apenas se mudou.
      const payload: any = { name, cpf: onlyDigits(cpf) };
      if (newPassword) payload.password = newPassword;

      await apiClient.put(`/users/${user.id}`, payload);
      await refreshUser();
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Perfil atualizado com sucesso.");
    } catch (err) {
      const msg = getApiErrorMessage(err, "Erro ao atualizar perfil.");
      if (String(msg).toLowerCase().includes("jwt") || String(msg).includes("401")) {
        logout();
        navigate("/login");
        return;
      }
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title="Meu perfil" showHome>
      <p style={{ opacity: 0.8, marginBottom: 16 }}>
        Atualize seus dados. O e-mail é somente leitura.
      </p>

      <form onSubmit={handleSave} style={{ display: "grid", gap: 12, maxWidth: 520 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Nome</span>
          <input className="app-input" value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Email (não editável)</span>
          <input className="app-input" value={email} disabled />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>CPF</span>
          <input className="app-input" value={cpf} onChange={(e) => setCpf(onlyDigits(e.target.value))} />
        </label>

        <hr style={{ margin: "12px 0" }} />

        <label style={{ display: "grid", gap: 6 }}>
          <span>Nova senha</span>
          <input
            type="password"
            className="app-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>

        {passwordStrength && (
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            Força da senha: <strong>{passwordStrength}</strong>
          </div>
        )}

        <label style={{ display: "grid", gap: 6 }}>
          <span>Confirmar nova senha</span>
          <input
            type="password"
            className="app-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>

        {error && (
          <Alert variant="error">{error}</Alert>
        )}
        {success && (
          <Alert variant="success">{success}</Alert>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
          <button type="submit" disabled={saving} className="app-btn app-btn-primary">
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </PageShell>
  );
}

