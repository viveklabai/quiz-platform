"use server";

import { redirect } from "next/navigation";
import {
  clearAdminSession,
  setAdminSession,
  verifyAdminPassword,
} from "@/src/lib/admin-auth";

export type LoginResult =
  | { success: true }
  | { success: false; error: string };

export async function loginAdmin(password: string): Promise<LoginResult> {
  if (!verifyAdminPassword(password)) {
    return { success: false, error: "Invalid password." };
  }

  try {
    await setAdminSession(password);
  } catch {
    return {
      success: false,
      error: "Admin password is not configured on the server.",
    };
  }

  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}
