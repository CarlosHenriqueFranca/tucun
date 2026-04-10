import { useState } from "react";
import { useAuthStore } from "../store/auth.store";
import api from "../lib/api";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  whatsapp?: string;
}

interface OtpPayload {
  phone: string;
}

interface VerifyOtpPayload {
  phone: string;
  code: string;
}

export function useAuth() {
  const { login, logout, user, isAuthenticated, isLoading } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function clearError() {
    setError(null);
  }

  async function handleLogin(payload: LoginPayload) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/login", payload);
      await login(
        { accessToken: data.accessToken, refreshToken: data.refreshToken },
        data.user
      );
      return { success: true };
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Erro ao fazer login. Verifique seus dados.";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(payload: RegisterPayload) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/register", payload);
      await login(
        { accessToken: data.accessToken, refreshToken: data.refreshToken },
        data.user
      );
      return { success: true };
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Erro ao criar conta. Tente novamente.";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }

  async function requestOtp(payload: OtpPayload) {
    setLoading(true);
    setError(null);
    try {
      await api.post("/auth/otp/request", payload);
      return { success: true };
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Erro ao enviar código. Tente novamente.";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(payload: VerifyOtpPayload) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/otp/verify", payload);
      await login(
        { accessToken: data.accessToken, refreshToken: data.refreshToken },
        data.user
      );
      return { success: true };
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Código inválido. Tente novamente.";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await api.post("/auth/logout").catch(() => {}); // best-effort
    } finally {
      await logout();
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    loading,
    error,
    clearError,
    login: handleLogin,
    register: handleRegister,
    requestOtp,
    verifyOtp,
    logout: handleLogout,
  };
}
