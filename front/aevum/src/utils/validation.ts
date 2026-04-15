export function validateEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

// Validação completa (dígitos verificadores)
export function validateCPF(rawCpf: string) {
  const cpf = onlyDigits(rawCpf);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calcCheck = (base: string, factor: number) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += Number(base[i]) * (factor - i);
    }
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const base9 = cpf.slice(0, 9);
  const d1 = calcCheck(base9, 10);
  const base10 = cpf.slice(0, 10);
  const d2 = calcCheck(base10, 11);
  return cpf === `${base9}${d1}${d2}`;
}

export type PasswordStrength = "fraca" | "media" | "forte";

export function getPasswordStrength(password: string): PasswordStrength {
  const p = password ?? "";
  const hasLower = /[a-z]/.test(p);
  const hasUpper = /[A-Z]/.test(p);
  const hasDigit = /\d/.test(p);
  const hasSpecial = /[^A-Za-z0-9]/.test(p);

  const score =
    (p.length >= 8 ? 1 : 0) +
    (p.length >= 12 ? 1 : 0) +
    (hasLower ? 1 : 0) +
    (hasUpper ? 1 : 0) +
    (hasDigit ? 1 : 0) +
    (hasSpecial ? 1 : 0);

  if (score >= 5) return "forte";
  if (score >= 3) return "media";
  return "fraca";
}

