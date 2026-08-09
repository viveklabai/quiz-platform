import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "admin_session";

function getAdminPassword(): string | null {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    return null;
  }

  return password;
}

export function verifyAdminPassword(password: string): boolean {
  const adminPassword = getAdminPassword();

  if (!adminPassword) {
    return false;
  }

  return password === adminPassword;
}

export function isValidSessionToken(token: string | undefined): boolean {
  const adminPassword = getAdminPassword();

  if (!adminPassword || !token) {
    return false;
  }

  return token === adminPassword;
}

export async function setAdminSession(password: string) {
  const adminPassword = getAdminPassword();

  if (!adminPassword || password !== adminPassword) {
    throw new Error("Admin password is not configured.");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, password, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}
