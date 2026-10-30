import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/adminAuth";
import { DEFAULT_USER_PASSWORD } from "@/lib/superAdmin";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  const gate = await requireSuperAdmin(request);
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const users = data.users ?? [];
    const failures: { id: string; email: string; error: string }[] = [];
    let updated = 0;

    for (const user of users) {
      const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
        password: DEFAULT_USER_PASSWORD,
      });
      if (updateError) {
        failures.push({
          id: user.id,
          email: user.email ?? "",
          error: updateError.message,
        });
      } else {
        updated += 1;
      }
    }

    return NextResponse.json({
      ok: failures.length === 0,
      updated,
      total: users.length,
      password: DEFAULT_USER_PASSWORD,
      failures,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Errore reset password" },
      { status: 500 }
    );
  }
}
