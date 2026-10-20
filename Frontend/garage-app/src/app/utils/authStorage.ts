import type { User } from "../models/User";
import { isTokenExpired } from "./jwt";

const STORAGE_KEY = "user";

export function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as User;
    if (!user?.token || isTokenExpired(user.token)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return user;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function storeUser(user: User): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getStoredToken(): string | null {
  return loadStoredUser()?.token ?? null;
}
