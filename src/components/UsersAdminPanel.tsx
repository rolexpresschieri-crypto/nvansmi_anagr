"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  createManagedUser,
  deleteManagedUser,
  listManagedUsers,
  resetAllPasswords,
  updateManagedUser,
  type ManagedUser,
} from "@/lib/adminUsersApi";
import { DEFAULT_USER_PASSWORD, isSuperAdminEmail } from "@/lib/superAdmin";
import { supabase } from "@/lib/supabaseClient";

const ROLE_OPTIONS = ["admin", "segreteria", "istruttore", "lettura"];

export default function UsersAdminPanel() {
  const [session, setSession] = useState<Session | null>(null);
  const [isBootLoading, setIsBootLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [users, setUsers] = useState<ManagedUser[]>([]);

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState(DEFAULT_USER_PASSWORD);
  const [newRole, setNewRole] = useState("lettura");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState("lettura");
  const [showEditPassword, setShowEditPassword] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const rows = await listManagedUsers();
      setUsers(rows);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Errore caricamento");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const boot = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) setErrorMessage(error.message);
      setSession(data.session);
      if (data.session && isSuperAdminEmail(data.session.user.email)) {
        await loadUsers();
      }
      setIsBootLoading(false);
    };
    boot();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, current) => {
      setSession(current);
      if (current && isSuperAdminEmail(current.user.email)) {
        void loadUsers();
      } else {
        setUsers([]);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [loadUsers]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      await createManagedUser({
        email: newEmail,
        password: newPassword || DEFAULT_USER_PASSWORD,
        role: newRole,
      });
      setNewEmail("");
      setNewPassword(DEFAULT_USER_PASSWORD);
      setNewRole("lettura");
      setInfoMessage("Utente creato.");
      await loadUsers();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Errore creazione");
    } finally {
      setIsSaving(false);
    }
  };

  const openEdit = (user: ManagedUser) => {
    setEditId(user.id);
    setEditEmail(user.email);
    setEditPassword("");
    setEditRole(user.role || "lettura");
    setShowEditPassword(false);
    setInfoMessage(null);
    setErrorMessage(null);
  };

  const handleUpdate = async (event: FormEvent) => {
    event.preventDefault();
    if (!editId) return;
    setIsSaving(true);
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      await updateManagedUser(editId, {
        email: editEmail,
        role: editRole,
        ...(editPassword.trim() ? { password: editPassword.trim() } : {}),
      });
      setEditId(null);
      setInfoMessage("Utente aggiornato.");
      await loadUsers();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Errore aggiornamento");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (user: ManagedUser) => {
    const ok = window.confirm(`Eliminare l'utente ${user.email}?`);
    if (!ok) return;
    setIsSaving(true);
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      await deleteManagedUser(user.id);
      if (editId === user.id) setEditId(null);
      setInfoMessage("Utente eliminato.");
      await loadUsers();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Errore eliminazione");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetAll = async () => {
    const ok = window.confirm(
      `Impostare la password ${DEFAULT_USER_PASSWORD} per TUTTI gli utenti?`
    );
    if (!ok) return;
    setIsSaving(true);
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      const result = await resetAllPasswords();
      setInfoMessage(
        `Password resettate: ${result.updated}/${result.total}. Nuova password: ${result.password}`
      );
      if (result.failures.length > 0) {
        setErrorMessage(
          `Alcuni reset non riusciti: ${result.failures
            .map((item) => item.email || item.id)
            .join(", ")}`
        );
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Errore reset password");
    } finally {
      setIsSaving(false);
    }
  };

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
          <p className="text-slate-700">Accedi per gestire gli utenti.</p>
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

  if (!isSuperAdminEmail(session.user.email)) {
    return (
      <main className="min-h-screen p-6">
        <div className="app-card mx-auto max-w-6xl space-y-3 rounded-xl p-6">
          <p className="text-slate-700">
            La gestione utenti è riservata all&apos;account superadmin.
          </p>
          <Link
            href="/"
            className="inline-flex rounded-md border border-amber-400 bg-amber-300 px-3 py-2 text-sm font-bold text-amber-950 hover:bg-amber-400"
          >
            Torna all&apos;anagrafica
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="app-card rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Gestione utenti</h1>
              <p className="mt-1 text-sm text-slate-600">
                Inserimento, modifica ed eliminazione account. Visibile solo a{" "}
                {session.user.email}.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex rounded-md border border-amber-400 bg-amber-300 px-3 py-2 text-sm font-bold text-amber-950 hover:bg-amber-400"
              >
                Torna all&apos;anagrafica
              </Link>
              <Image
                src="/logo-nvansmi.png"
                alt="NV ANSMI"
                width={64}
                height={64}
                className="h-16 w-16 object-contain"
                priority
              />
            </div>
          </div>
        </header>

        {errorMessage ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}
        {infoMessage ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {infoMessage}
          </p>
        ) : null}

        <section className="app-card rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">Nuovo utente</h2>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => void handleResetAll()}
              className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-60"
            >
              Reset tutte le password a {DEFAULT_USER_PASSWORD}
            </button>
          </div>
          <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-4">
            <label className="block md:col-span-2">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Email</span>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Password</span>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((c) => !c)}
                  aria-label={showNewPassword ? "Nascondi password" : "Mostra password"}
                  className="absolute inset-y-0 right-0 px-3 text-slate-500"
                >
                  {showNewPassword ? "🙈" : "👁"}
                </button>
              </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Ruolo</span>
              <select
                value={newRole}
                onChange={(event) => setNewRole(event.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60 md:col-span-4 md:w-fit"
            >
              Crea utente
            </button>
          </form>
        </section>

        <section className="app-card overflow-hidden rounded-xl">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
            <h2 className="text-lg font-semibold text-slate-900">Utenti</h2>
            <button
              type="button"
              onClick={() => void loadUsers()}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Aggiorna
            </button>
          </div>
          {isLoading ? (
            <p className="p-4 text-sm text-slate-600">Caricamento...</p>
          ) : users.length === 0 ? (
            <p className="p-4 text-sm text-slate-600">Nessun utente.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Ruolo</th>
                    <th className="px-3 py-2">Ultimo accesso</th>
                    <th className="px-3 py-2">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-slate-200">
                      <td className="px-3 py-2">{user.email}</td>
                      <td className="px-3 py-2">{user.role ?? "-"}</td>
                      <td className="px-3 py-2">
                        {user.last_sign_in_at
                          ? new Date(user.last_sign_in_at).toLocaleString("it-IT")
                          : "-"}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(user)}
                            className="rounded border border-blue-300 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-800"
                          >
                            Modifica
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(user)}
                            className="rounded border border-red-300 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700"
                          >
                            Elimina
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {editId ? (
          <section className="app-card rounded-xl p-4 space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Modifica utente</h2>
            <form onSubmit={handleUpdate} className="grid gap-3 md:grid-cols-3">
              <label className="block md:col-span-2">
                <span className="mb-1 block text-xs font-semibold text-slate-600">Email</span>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(event) => setEditEmail(event.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-600">Ruolo</span>
                <select
                  value={editRole}
                  onChange={(event) => setEditRole(event.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block md:col-span-3">
                <span className="mb-1 block text-xs font-semibold text-slate-600">
                  Nuova password (opzionale)
                </span>
                <div className="relative max-w-md">
                  <input
                    type={showEditPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={editPassword}
                    onChange={(event) => setEditPassword(event.target.value)}
                    placeholder="Lascia vuoto per non cambiare"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword((c) => !c)}
                    aria-label={showEditPassword ? "Nascondi password" : "Mostra password"}
                    className="absolute inset-y-0 right-0 px-3 text-slate-500"
                  >
                    {showEditPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </label>
              <div className="flex gap-2 md:col-span-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  Salva
                </button>
                <button
                  type="button"
                  onClick={() => setEditId(null)}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  Annulla
                </button>
              </div>
            </form>
          </section>
        ) : null}
      </div>
    </main>
  );
}
