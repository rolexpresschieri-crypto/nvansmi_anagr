import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { isSuperAdminEmail } from "@/lib/superAdmin";

export type SuperAdminUser = {
  id: string;
  email: string;
};

export async function requireSuperAdmin(
  request: NextRequest
): Promise<{ user: SuperAdminUser } | { error: string; status: number }> {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!token) {
    return { error: "Sessione mancante", status: 401 };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return { error: "Configurazione Supabase incompleta", status: 500 };
  }

  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) {
    return { error: "Utente non autenticato", status: 401 };
  }

  if (!isSuperAdminEmail(data.user.email)) {
    return { error: "Operazione consentita solo al superadmin", status: 403 };
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email.toLowerCase(),
    },
  };
}
