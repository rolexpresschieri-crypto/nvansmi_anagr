"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { fetchAuditLogs, type AuditLogRow } from "@/lib/auditLog";
import { supabase } from "@/lib/supabaseClient";

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("it-IT");
}

function shortJson(value: Record<string, unknown> | null): string {
  if (!value) return "";
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

export default function AuditLogPanel() {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isBootLoading, setIsBootLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rows, setRows] = useState<AuditLogRow[]>([]);
  const [actionFilter, setActionFilter] = useState("tutti");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async (currentSession: Session | null) => {
    if (!currentSession) {
      setRows([]);
      setRole(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const [{ data: profile, error: profileError }, audit] = await Promise.all([
      supabase.from("profiles").select("role").eq("id", currentSession.user.id).maybeSingle(),
      fetchAuditLogs(300),
    ]);

    if (profileError) {
      setErrorMessage(profileError.message);
      setRole(null);
      setRows([]);
      setIsLoading(false);
      return;
    }

    const currentRole = (profile?.role as string | undefined) ?? null;
    setRole(currentRole);

    if (currentRole !== "admin" && currentRole !== "segreteria") {
      setRows([]);
      setErrorMessage("Solo admin e segreteria possono consultare il log.");
      setIsLoading(false);
      return;
    }

    if (audit.error) {
      setErrorMessage(audit.error);
      setRows([]);
    } else {
      setRows(audit.rows);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const boot = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) setErrorMessage(error.message);
      setSession(data.session);
      await load(data.session);
      setIsBootLoading(false);
    };

    boot();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      void load(currentSession);
    });

    return () => authListener.subscription.unsubscribe();
  }, [load]);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchAction =
        actionFilter === "tutti" || row.action.toUpperCase() === actionFilter.toUpperCase();
      if (!matchAction) return false;
      if (!keyword) return true;
      const haystack = [
        row.actor_email,
        row.action,
        row.table_name,
        row.record_id,
        row.summary,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(keyword);
    });
  }, [rows, actionFilter, search]);

  if (isBootLoading) {
    return (
      <main className="min-h-screen p-6">
        <div className="app-card mx-auto max-w-6xl rounded-xl p-6">Caricamento...</div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen p-6">
        <div className="app-card mx-auto max-w-6xl space-y-3 rounded-xl p-6">
          <p className="text-slate-700">Accedi dall&apos;anagrafica per consultare il log.</p>
          <Link
            href="/"
            className="inline-flex rounded-md border border-amber-400 bg-amber-300 px-3 py-2 text-sm font-bold text-amber-950 hover:bg-amber-400"
          >
            Vai al login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="app-card rounded-xl p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Log accessi e modifiche</h1>
              <p className="mt-1 text-sm text-slate-600">
                Tracciamento automatico di login/logout e di ogni inserimento, modifica o
                cancellazione. Ruolo attuale: {role ?? "-"}.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex rounded-md border border-amber-400 bg-amber-300 px-3 py-2 text-sm font-bold text-amber-950 hover:bg-amber-400"
            >
              Torna all&apos;anagrafica
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Azione</span>
              <select
                value={actionFilter}
                onChange={(event) => setActionFilter(event.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="tutti">Tutte</option>
                <option value="LOGIN">LOGIN</option>
                <option value="LOGOUT">LOGOUT</option>
                <option value="INSERT">INSERT</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="EXPORT">EXPORT</option>
              </select>
            </label>
            <label className="block min-w-[220px] flex-1">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Cerca</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="email, tabella, riepilogo..."
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <button
              type="button"
              onClick={() => void load(session)}
              className="self-end rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Aggiorna
            </button>
          </div>
        </header>

        {errorMessage ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <section className="app-card overflow-hidden rounded-xl">
          {isLoading ? (
            <p className="p-4 text-sm text-slate-600">Caricamento log...</p>
          ) : filteredRows.length === 0 ? (
            <p className="p-4 text-sm text-slate-600">Nessun evento trovato.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Quando</th>
                    <th className="px-3 py-2">Utente</th>
                    <th className="px-3 py-2">Azione</th>
                    <th className="px-3 py-2">Tabella</th>
                    <th className="px-3 py-2">Riepilogo</th>
                    <th className="px-3 py-2">Dettaglio</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => {
                    const open = expandedId === row.id;
                    return (
                      <Fragment key={row.id}>
                        <tr className="border-t border-slate-200 align-top">
                          <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                            {formatWhen(row.occurred_at)}
                          </td>
                          <td className="px-3 py-2 text-slate-700">
                            {row.actor_email ?? row.actor_id ?? "-"}
                          </td>
                          <td className="px-3 py-2 font-semibold text-slate-900">{row.action}</td>
                          <td className="px-3 py-2 text-slate-700">{row.table_name ?? "-"}</td>
                          <td className="px-3 py-2 text-slate-700">{row.summary ?? "-"}</td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => setExpandedId(open ? null : row.id)}
                              className="text-xs font-semibold text-blue-700 hover:underline"
                            >
                              {open ? "Nascondi" : "Mostra"}
                            </button>
                          </td>
                        </tr>
                        {open ? (
                          <tr className="border-t border-slate-100 bg-slate-50">
                            <td colSpan={6} className="px-3 py-3">
                              <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                  <p className="mb-1 text-xs font-bold uppercase text-slate-500">
                                    Prima
                                  </p>
                                  <pre className="overflow-x-auto rounded bg-white p-2 text-xs text-slate-700">
                                    {shortJson(row.old_data) || "-"}
                                  </pre>
                                </div>
                                <div>
                                  <p className="mb-1 text-xs font-bold uppercase text-slate-500">
                                    Dopo
                                  </p>
                                  <pre className="overflow-x-auto rounded bg-white p-2 text-xs text-slate-700">
                                    {shortJson(row.new_data) || "-"}
                                  </pre>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
