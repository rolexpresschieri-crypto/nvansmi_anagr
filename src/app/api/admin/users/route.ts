import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/adminAuth";
import { DEFAULT_USER_PASSWORD } from "@/lib/superAdmin";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const ROLE_OPTIONS = ["admin", "segreteria", "istruttore", "lettura"] as const;

export async function GET(request: NextRequest) {
  const gate = await requireSuperAdmin(request);
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  try {
    const admin = getSupabaseAdmin();
    const [{ data: listed, error: listError }, { data: profiles, error: profilesError }] =
      await Promise.all([
        admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
        admin.from("profiles").select("id, role"),
      ]);

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }
    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    const roleById = new Map(
      ((profiles ?? []) as { id: string; role: string | null }[]).map((row) => [
        row.id,
        row.role,
      ])
    );

    const users = (listed.users ?? []).map((user) => ({
      id: user.id,
      email: user.email ?? "",
      role: roleById.get(user.id) ?? null,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at,
    }));

    return NextResponse.json({ users });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Errore elenco utenti" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireSuperAdmin(request);
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      role?: string;
    };

    const email = (body.email ?? "").trim().toLowerCase();
    const password = (body.password ?? DEFAULT_USER_PASSWORD).trim();
    const role = (body.role ?? "lettura").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email non valida" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password troppo corta (minimo 6 caratteri)" },
        { status: 400 }
      );
    }
    if (!ROLE_OPTIONS.includes(role as (typeof ROLE_OPTIONS)[number])) {
      return NextResponse.json({ error: "Ruolo non valido" }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message ?? "Creazione utente fallita" },
        { status: 400 }
      );
    }

    const { error: profileError } = await admin.from("profiles").upsert({
      id: data.user.id,
      role,
    });

    if (profileError) {
      return NextResponse.json(
        {
          error: `Utente creato ma profilo non salvato: ${profileError.message}`,
          userId: data.user.id,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        role,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Errore creazione utente" },
      { status: 500 }
    );
  }
}
