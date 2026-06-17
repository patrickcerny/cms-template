"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createHash } from "crypto";
import { saveCmsContent } from "@/lib/cms-dictionary";
import { locales } from "@/i18n/config";

const cookieName = "cms_admin";

function adminPassword() {
  return process.env.ADMIN_PASSWORD || "changeme";
}

function authToken() {
  return createHash("sha256").update(adminPassword()).digest("hex");
}

export async function isAdminAuthenticated() {
  return (await cookies()).get(cookieName)?.value === authToken();
}

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

// Re-render every locale of every editable route after content is saved.
function revalidateSitePages() {
  const paths = ["", "/about", "/contact", "/legal/privacy", "/legal/terms"];
  for (const locale of locales) {
    for (const path of paths) {
      revalidatePath(`/${locale}${path}`);
    }
  }
}

export async function loginAction(formData: FormData) {
  if (value(formData, "password") !== adminPassword()) {
    redirect("/admin?error=1");
  }

  (await cookies()).set(cookieName, authToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 8,
  });
  redirect("/admin");
}

export async function logoutAction() {
  (await cookies()).delete(cookieName);
  redirect("/admin");
}

export async function saveSiteContentAction(formData: FormData) {
  if (!(await isAdminAuthenticated())) redirect("/admin");
  const raw = String(formData.get("contentJson") || "");
  if (!raw.trim()) redirect("/admin?error=1");
  const content = JSON.parse(raw);
  saveCmsContent(content);
  revalidateSitePages();
  redirect("/admin?saved=1");
}
