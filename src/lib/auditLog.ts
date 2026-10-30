import { supabase } from "@/lib/supabaseClient";

export type AuditLogRow = {
  id: string;
  occurred_at: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  table_name: string | null;
  record_id: string | null;
  summary: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
};

export async function logAppEvent(
  action: "LOGIN" | "LOGOUT" | "EXPORT" | "VIEW" | "OTHER",
  summary?: string,
  extras?: {
    tableName?: string;
    recordId?: string;
    newData?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    const { error } = await supabase.rpc("log_app_event", {
      p_action: action,
      p_summary: summary ?? null,
      p_table_name: extras?.tableName ?? null,
      p_record_id: extras?.recordId ?? null,
      p_new_data: extras?.newData ?? null,
    });
    if (error) {
      console.error("Audit log event failed:", error.message);
    }
  } catch (err) {
    console.error("Audit log event failed:", err);
  }
}

export async function fetchAuditLogs(limit = 200): Promise<{
  rows: AuditLogRow[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("audit_log")
    .select(
      "id, occurred_at, actor_id, actor_email, action, table_name, record_id, summary, old_data, new_data"
    )
    .order("occurred_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { rows: [], error: error.message };
  }

  return { rows: (data ?? []) as AuditLogRow[], error: null };
}
