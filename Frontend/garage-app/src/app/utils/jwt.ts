import { isRole, type Role } from "../models/enums";

export interface TokenClaims {
  sub: string | null;
  userId: number | null;
  role: Role | null;
  exp: number | null; 
}

function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function decodeToken(token?: string | null): TokenClaims | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const claims = JSON.parse(decodeBase64Url(payload)) as Record<string, unknown>;
    const userId = Number(claims.userId);
    return {
      sub: typeof claims.sub === "string" ? claims.sub : null,
      userId: Number.isFinite(userId) ? userId : null,
      role: isRole(claims.role) ? claims.role : null,
      exp: typeof claims.exp === "number" ? claims.exp : null,
    };
  } catch {
    return null;
  }
}

export function isTokenExpired(token?: string | null, skewSeconds = 5): boolean {
  const claims = decodeToken(token);
  if (!claims || claims.exp === null) return true;
  return claims.exp * 1000 <= Date.now() + skewSeconds * 1000;
}

export function msUntilExpiry(token?: string | null): number | null {
  const claims = decodeToken(token);
  if (!claims || claims.exp === null) return null;
  return claims.exp * 1000 - Date.now();
}
