import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const ROLE_OPTIONS = ["admin", "segreteria", "istruttore", "lettura"] as const;

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const gate = await requireSuperAdmin(request);
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Id utente mancante" }, { status: 400 });
  }

  if (id === gate.user.id) {
    // consentito aggiornare password/ruolo del proprio account, ma non eliminare email in modo distruttivo
  }

  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      role?: string;
    };

    const admin = getSupabaseAdmin();
    const updates: { email?: string; password?: string; email_confirm?: boolean } = {};

    if (typeof body.email === "string" && body.email.trim()) {
      updates.email = body.email.trim().toLowerCase();
      updates.email_confirm = true;
    }
    if (typeof body.password === "string" && body.password.trim()) {
      if (body.password.trim().length < 6) {
        return NextResponse.json(
          { error: "Password troppo corta (minimo 6 caratteri)" },
          { status: 400 }
        );
      }
      updates.password = body.password.trim();
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await admin.auth.admin.updateUserById(id, updates);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    if (typeof body.role === "string" && body.role.trim()) {
      const role = body.role.trim().toLowerCase();
      if (!ROLE_OPTIONS.includes(role as (typeof ROLE_OPTIONS)[number])) {
        return NextResponse.json({ error: "Ruolo non valido" }, { status: 400 });
      }
      const { error: profileError } = await admin.from("profiles").upsert({
        id,
        role,
      });
      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Errore aggiornamento utente" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const gate = await requireSuperAdmin(request);
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Id utente mancante" }, { status: 400 });
  }

  if (id === gate.user.id) {
    return NextResponse.json(
      { error: "Non puoi eliminare il tuo stesso account superadmin" },
      { status: 400 }
    );
  }

  try {
    const admin = getSupabaseAdmin();
    await admin.from("profiles").delete().eq("id", id);
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Errore eliminazione utente" },
      { status: 500 }
    );
  }
}
