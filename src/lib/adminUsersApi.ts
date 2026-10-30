import { supabase } from "@/lib/supabaseClient";

async function authHeaders(): Promise<HeadersInit> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error("Sessione non valida");
  }
  return {
    Authorization: `Bearer ${data.session.access_token}`,
    "Content-Type": "application/json",
  };
}

export type ManagedUser = {
  id: string;
  email: string;
  role: string | null;
  created_at?: string;
  last_sign_in_at?: string | null;
  email_confirmed_at?: string | null;
};

export async function listManagedUsers(): Promise<ManagedUser[]> {
  const headers = await authHeaders();
  const response = await fetch("/api/admin/users", { headers, cache: "no-store" });
  const body = (await response.json()) as { users?: ManagedUser[]; error?: string };
  if (!response.ok) throw new Error(body.error || "Errore caricamento utenti");
  return body.users ?? [];
}

export async function createManagedUser(input: {
  email: string;
  password: string;
  role: string;
}): Promise<void> {
  const headers = await authHeaders();
  const response = await fetch("/api/admin/users", {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });
  const body = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(body.error || "Errore creazione utente");
}

export async function updateManagedUser(
  id: string,
  input: { email?: string; password?: string; role?: string }
): Promise<void> {
  const headers = await authHeaders();
  const response = await fetch(`/api/admin/users/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(input),
  });
  const body = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(body.error || "Errore aggiornamento utente");
}

export async function deleteManagedUser(id: string): Promise<void> {
  const headers = await authHeaders();
  const response = await fetch(`/api/admin/users/${id}`, {
    method: "DELETE",
    headers,
  });
  const body = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(body.error || "Errore eliminazione utente");
}

export async function resetAllPasswords(): Promise<{
  updated: number;
  total: number;
  password: string;
  failures: { id: string; email: string; error: string }[];
}> {
  const headers = await authHeaders();
  const response = await fetch("/api/admin/users/reset-passwords", {
    method: "POST",
    headers,
  });
  const body = (await response.json()) as {
    error?: string;
    updated?: number;
    total?: number;
    password?: string;
    failures?: { id: string; email: string; error: string }[];
  };
  if (!response.ok) throw new Error(body.error || "Errore reset password");
  return {
    updated: body.updated ?? 0,
    total: body.total ?? 0,
    password: body.password ?? "123456",
    failures: body.failures ?? [],
  };
}
