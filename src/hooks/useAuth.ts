import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

const useAuthStore = create((set: any) => {
  const savedToken =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const payloadToken = savedToken ? jwtDecode(savedToken) : null;

  return {
    token: savedToken,
    payloadToken,
    isAuthenticated: !!savedToken,

    login: (token: string) => {
      const decoded = jwtDecode(token);
      localStorage.setItem("auth_token", token);
      set({ token, payloadToken: decoded, isAuthenticated: true });
    },

    logout: () => {
      localStorage.removeItem("auth_token");
      set({ token: null, payloadToken: null, isAuthenticated: false });
    },

    updateToken: (newToken: string) => {
      const decoded = jwtDecode(newToken);
      localStorage.setItem("auth_token", newToken);
      set({ token: newToken, payloadToken: decoded });
    },
  };
});

export const useAuth = () => {
  const { token, payloadToken, isAuthenticated, login, logout, updateToken } =
    useAuthStore();

  return { token, payloadToken, isAuthenticated, login, logout, updateToken };
};
