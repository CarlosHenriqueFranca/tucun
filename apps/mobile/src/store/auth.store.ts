import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  level: number;
  xp: number;
  xpToNextLevel: number;
  badges: Badge[];
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isSubscribed: boolean;
  subscriptionExpiresAt: string | null;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  earnedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: AuthTokens, user: UserProfile) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserProfile) => void;
  setTokens: (tokens: AuthTokens) => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

const STORAGE_KEYS = {
  ACCESS_TOKEN: "tucun_access_token",
  REFRESH_TOKEN: "tucun_refresh_token",
  USER: "tucun_user",
} as const;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (tokens: AuthTokens, user: UserProfile) => {
    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user));
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setUser: (user: UserProfile) => {
    SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user)).catch(
      console.error
    );
    set({ user });
  },

  setTokens: async (tokens: AuthTokens) => {
    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  },

  loadFromStorage: async () => {
    try {
      const [accessToken, refreshToken, userJson] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStore.getItemAsync(STORAGE_KEYS.USER),
      ]);

      if (accessToken && userJson) {
        const user = JSON.parse(userJson) as UserProfile;
        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
