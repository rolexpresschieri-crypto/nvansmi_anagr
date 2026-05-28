"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type Dog = {
  id: string;
  name: string | null;
  breed: string | null;
  sex: "M" | "F" | null;
  microchip: string | null;
};

type Volunteer = {
  id: string;
  first_name: string;
  last_name: string;
  tax_code: string | null;
  phone: string | null;
  email: string | null;
  qualification: string | null;
  team: string | null;
  member_type: string | null;
  entry_date: string | null;
  exit_date: string | null;
  dogs: Dog[] | null;
};

type VolunteerFormValues = {
  first_name: string;
  last_name: string;
  tax_code: string;
  phone: string;
  email: string;
  member_type: string;
  qualification: string;
  team: string;
  entry_date: string;
  exit_date: string;
};

const emptyVolunteerForm = (): VolunteerFormValues => ({
  first_name: "",
  last_name: "",
  tax_code: "",
  phone: "",
  email: "",
  member_type: "",
  qualification: "",
  team: "",
  entry_date: "",
  exit_date: "",
});

export default function Home() {
  const [uiPreset, setUiPreset] = useState<"chiara" | "istituzionale">("chiara");
  const [session, setSession] = useState<Session | null>(null);
  const [isBootLoading, setIsBootLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [search, setSearch] = useState("");
  const [socioFilter, setSocioFilter] = useState<"tutti" | "attivi" | "non_attivi">(
    "tutti"
  );
  const [memberTypeFilters, setMemberTypeFilters] = useState<string[]>([]);
  const [teamFilters, setTeamFilters] = useState<string[]>([]);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string | null>(
    null
  );
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingVolunteerId, setEditingVolunteerId] = useState<string | null>(null);
  const [isSavingVolunteer, setIsSavingVolunteer] = useState(false);
  const [volunteerForm, setVolunteerForm] = useState<VolunteerFormValues>(
    emptyVolunteerForm
  );
  const editorRef = useRef<HTMLElement | null>(null);
  const memberTypeInitializedRef = useRef(false);
  const teamInitializedRef = useRef(false);

  const isVolunteerActive = (volunteer: Volunteer) =>
    Boolean(volunteer.entry_date) && !Boolean(volunteer.exit_date);

  const loadPresetForUser = (userId: string | undefined) => {
    if (!userId) return;
    const storageKey = `nvansmi_ui_preset_${userId}`;
    const savedPreset = window.localStorage.getItem(storageKey);
    if (savedPreset === "chiara" || savedPreset === "istituzionale") {
      setUiPreset(savedPreset);
    } else {
      setUiPreset("chiara");
    }
  };

  useEffect(() => {
    if (!session?.user?.id) return;
    const storageKey = `nvansmi_ui_preset_${session.user.id}`;
    window.localStorage.setItem(storageKey, uiPreset);
  }, [uiPreset, session?.user?.id]);

  useEffect(() => {
    const body = document.body;
    body.classList.remove("preset-chiara", "preset-istituzionale");
    body.classList.add(
      uiPreset === "chiara" ? "preset-chiara" : "preset-istituzionale"
    );
  }, [uiPreset]);

  const loadVolunteersForSession = useCallback(
    async (currentSession: Session | null) => {
    if (!currentSession) {
      setVolunteers([]);
      setSelectedVolunteerId(null);
      memberTypeInitializedRef.current = false;
      teamInitializedRef.current = false;
      return;
    }

    setIsDataLoading(true);
    setErrorMessage(null);

    const { data, error } = await supabase
      .from("volunteers")
      .select(
        "id, first_name, last_name, tax_code, phone, email, qualification, team, member_type, entry_date, exit_date, dogs(id, name, breed, sex, microchip)"
      )
      .order("last_name", { ascending: true });

    if (error) {
      setErrorMessage(error.message);
    } else {
      const rows = (data ?? []) as Volunteer[];
      setVolunteers(rows);

      if (!memberTypeInitializedRef.current) {
        const allMemberTypes = Array.from(
          new Set(rows.map((item) => item.member_type).filter(Boolean))
        ) as string[];
        if (allMemberTypes.length > 0) {
          setMemberTypeFilters(allMemberTypes.sort((a, b) => a.localeCompare(b)));
          memberTypeInitializedRef.current = true;
        }
      }

      if (!teamInitializedRef.current) {
        const allTeams = Array.from(
          new Set(rows.map((item) => item.team).filter(Boolean))
        ) as string[];
        if (allTeams.length > 0) {
          setTeamFilters(allTeams.sort((a, b) => a.localeCompare(b)));
          teamInitializedRef.current = true;
        }
      }

      if (rows.length > 0) {
        setSelectedVolunteerId((current) => current ?? rows[0].id);
      } else {
        setSelectedVolunteerId(null);
      }
    }

    setIsDataLoading(false);
    },
    []
  );

  useEffect(() => {
    const boot = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSession(data.session);
        loadPresetForUser(data.session?.user?.id);
        await loadVolunteersForSession(data.session);
      }

      setIsBootLoading(false);
    };

    boot();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        loadPresetForUser(currentSession?.user?.id);
        void loadVolunteersForSession(currentSession);
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, [loadVolunteersForSession]);

  const filteredVolunteers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return volunteers.filter((item) => {
      const fullName = `${item.last_name} ${item.first_name}`.toLowerCase();
      const matchSearch =
        fullName.includes(keyword) ||
        (item.qualification ?? "").toLowerCase().includes(keyword) ||
        (item.team ?? "").toLowerCase().includes(keyword);

      const active = isVolunteerActive(item);
      const matchSocio =
        socioFilter === "tutti" ||
        (socioFilter === "attivi" && active) ||
        (socioFilter === "non_attivi" && !active);

      const matchMemberType =
        memberTypeFilters.length === 0 ||
        (item.member_type ? memberTypeFilters.includes(item.member_type) : false);

      const matchTeam =
        teamFilters.length === 0 || (item.team ? teamFilters.includes(item.team) : false);

      return matchSearch && matchSocio && matchMemberType && matchTeam;
    });
  }, [volunteers, search, socioFilter, memberTypeFilters, teamFilters]);

  const memberTypeOptions = useMemo(() => {
    const values = Array.from(
      new Set(volunteers.map((item) => item.member_type).filter(Boolean))
    ) as string[];
    return values.sort((a, b) => a.localeCompare(b));
  }, [volunteers]);

  const teamOptions = useMemo(() => {
    const values = Array.from(
      new Set(volunteers.map((item) => item.team).filter(Boolean))
    ) as string[];
    return values.sort((a, b) => a.localeCompare(b));
  }, [volunteers]);

  const toggleMemberType = (value: string) => {
    setMemberTypeFilters((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  const toggleTeam = (value: string) => {
    setTeamFilters((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  const effectiveSelectedVolunteerId = useMemo(() => {
    const exists = filteredVolunteers.some((item) => item.id === selectedVolunteerId);
    if (exists) return selectedVolunteerId;
    return filteredVolunteers[0]?.id ?? null;
  }, [filteredVolunteers, selectedVolunteerId]);

  const selectedVolunteer = useMemo(() => {
    return (
      filteredVolunteers.find((item) => item.id === effectiveSelectedVolunteerId) ??
      null
    );
  }, [filteredVolunteers, effectiveSelectedVolunteerId]);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsAuthLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setEmail("");
      setPassword("");
    }

    setIsAuthLoading(false);
  };

  const handleSignOut = async () => {
    setErrorMessage(null);
    await supabase.auth.signOut();
  };

  const openNewVolunteer = () => {
    setEditingVolunteerId(null);
    setVolunteerForm(emptyVolunteerForm());
    setIsEditorOpen(true);
  };

  const openEditVolunteer = () => {
    if (!selectedVolunteer) return;
    setEditingVolunteerId(selectedVolunteer.id);
    setVolunteerForm({
      first_name: selectedVolunteer.first_name ?? "",
      last_name: selectedVolunteer.last_name ?? "",
      tax_code: selectedVolunteer.tax_code ?? "",
      phone: selectedVolunteer.phone ?? "",
      email: selectedVolunteer.email ?? "",
      member_type: selectedVolunteer.member_type ?? "",
      qualification: selectedVolunteer.qualification ?? "",
      team: selectedVolunteer.team ?? "",
      entry_date: selectedVolunteer.entry_date ?? "",
      exit_date: selectedVolunteer.exit_date ?? "",
    });
    setIsEditorOpen(true);
  };

  const handleVolunteerFormChange = (
    field: keyof VolunteerFormValues,
    value: string
  ) => {
    setVolunteerForm((current) => ({ ...current, [field]: value }));
  };

  const handleVolunteerSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingVolunteer(true);
    setErrorMessage(null);

    const payload = {
      first_name: volunteerForm.first_name.trim() || null,
      last_name: volunteerForm.last_name.trim() || null,
      tax_code: volunteerForm.tax_code.trim() || null,
      phone: volunteerForm.phone.trim() || null,
      email: volunteerForm.email.trim() || null,
      member_type: volunteerForm.member_type.trim() || null,
      qualification: volunteerForm.qualification.trim() || null,
      team: volunteerForm.team.trim() || null,
      entry_date: volunteerForm.entry_date || null,
      exit_date: volunteerForm.exit_date || null,
    };

    if (!payload.first_name || !payload.last_name) {
      setErrorMessage("Nome e cognome sono obbligatori.");
      setIsSavingVolunteer(false);
      return;
    }

    const query = editingVolunteerId
      ? supabase.from("volunteers").update(payload).eq("id", editingVolunteerId)
      : supabase.from("volunteers").insert(payload).select("id").single();

    const { data, error } = await query;

    if (error) {
      setErrorMessage(error.message);
      setIsSavingVolunteer(false);
      return;
    }

    if (!editingVolunteerId && data && "id" in data) {
      setSelectedVolunteerId(data.id as string);
    }

    setIsEditorOpen(false);
    setEditingVolunteerId(null);
    setVolunteerForm(emptyVolunteerForm());
    await loadVolunteersForSession(session);
    setIsSavingVolunteer(false);
  };

  useEffect(() => {
    if (!isEditorOpen) return;
    editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [isEditorOpen]);

  if (isBootLoading) {
    return (
      <main className="min-h-screen p-6">
        <div className="app-card mx-auto max-w-6xl rounded-xl p-6">
          Caricamento applicazione...
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen p-6">
        <div className="app-card mx-auto w-full max-w-md rounded-xl p-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            NV ANSMI - Accesso
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Accedi con email e password per gestire l&apos;anagrafica volontari.
          </p>

          <form onSubmit={handleSignIn} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="nome@dominio.it"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </label>

            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isAuthLoading ? "Accesso in corso..." : "Accedi"}
            </button>
          </form>

          {errorMessage ? (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="app-card flex flex-wrap items-center justify-between gap-3 rounded-xl p-4">
          <div className="space-y-2">
            <div>
            <h1 className="text-xl font-semibold text-slate-900">
              NV ANSMI - Anagrafica Volontari
            </h1>
            <p className="text-sm text-slate-600">{session.user.email}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={uiPreset}
                onChange={(event) =>
                  setUiPreset(event.target.value as "chiara" | "istituzionale")
                }
                className="rounded-md border border-slate-300 px-2 py-1 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="chiara">STILE: CHIARA</option>
                <option value="istituzionale">STILE: ISTITUZIONALE</option>
              </select>

              <Link
                href="/export"
                className="inline-flex items-center rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800 hover:bg-amber-100"
              >
                EXPORT / REPORT
              </Link>

              <select
                value={socioFilter}
                onChange={(event) =>
                  setSocioFilter(
                    event.target.value as "tutti" | "attivi" | "non_attivi"
                  )
                }
                className="rounded-md border border-slate-300 px-2 py-1 text-sm font-bold text-slate-800 outline-none focus:border-blue-500"
              >
                <option value="attivi">SOCI ATTIVI</option>
                <option value="non_attivi">SOCI NON ATTIVI</option>
                <option value="tutti">TUTTI I SOCI</option>
              </select>

              <div className="rounded-md border border-indigo-300 bg-indigo-50 px-3 py-2">
                <p className="mb-1 text-xs font-bold tracking-wide text-indigo-700">
                  TIPO SOCIO (MULTI)
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {memberTypeOptions.map((value) => (
                    <label
                      key={value}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-900"
                    >
                      <input
                        type="checkbox"
                        checked={memberTypeFilters.includes(value)}
                        onChange={() => toggleMemberType(value)}
                        className="h-3.5 w-3.5 accent-indigo-600"
                      />
                      {value}
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2">
                <p className="mb-1 text-xs font-bold tracking-wide text-emerald-700">
                  SQUADRA (MULTI)
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {teamOptions.map((value) => (
                    <label
                      key={value}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-900"
                    >
                      <input
                        type="checkbox"
                        checked={teamFilters.includes(value)}
                        onChange={() => toggleTeam(value)}
                        className="h-3.5 w-3.5 accent-emerald-600"
                      />
                      {value}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-md border border-slate-300 bg-white/90 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Esci
          </button>
        </header>

        {errorMessage ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <article className="app-card rounded-xl p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
              <h2 className="text-lg font-semibold text-slate-900">Volontari</h2>
              <p className="text-sm text-slate-600">
                Totale: {filteredVolunteers.length}
              </p>
              </div>
              <button
                type="button"
                onClick={openNewVolunteer}
                className="rounded-md bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                + NUOVO
              </button>
            </div>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cerca per nome, qualifica, squadra"
              className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
              {isDataLoading ? (
                <p className="text-sm text-slate-600">Caricamento volontari...</p>
              ) : null}

              {!isDataLoading && filteredVolunteers.length === 0 ? (
                <p className="text-sm text-slate-600">Nessun volontario trovato.</p>
              ) : null}

              {filteredVolunteers.map((volunteer) => {
                const isActive = volunteer.id === effectiveSelectedVolunteerId;
                return (
                  <button
                    type="button"
                    key={volunteer.id}
                    onClick={() => setSelectedVolunteerId(volunteer.id)}
                    className={`w-full rounded-md border px-3 py-2 text-left transition ${
                      isActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white/75 hover:bg-slate-50"
                    }`}
                  >
                    <p className="font-semibold text-slate-900">
                      {volunteer.last_name} {volunteer.first_name}
                    </p>
                    <p className="text-sm text-slate-600">
                      {volunteer.qualification ?? "-"} | {volunteer.team ?? "-"}
                    </p>
                  </button>
                );
              })}
            </div>
          </article>

          <article className="app-card rounded-xl p-4">
            {!selectedVolunteer ? (
              <p className="text-sm text-slate-600">
                Seleziona un volontario per vedere il dettaglio.
              </p>
            ) : (
              <div className="space-y-5">
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">
                        {selectedVolunteer.last_name} {selectedVolunteer.first_name}
                      </h2>
                      <p className="text-sm text-slate-600">
                        Stato: {isVolunteerActive(selectedVolunteer) ? "attivo" : "non attivo"}{" "}
                        | Tipo socio: {selectedVolunteer.member_type ?? "-"} | Qualifica:{" "}
                        {selectedVolunteer.qualification ?? "-"} | Squadra:{" "}
                        {selectedVolunteer.team ?? "-"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openEditVolunteer}
                      className="rounded-md border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      MODIFICA VOLONTARIO
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    CF: {selectedVolunteer.tax_code ?? "-"} | Tel: {selectedVolunteer.phone ?? "-"}{" "}
                    | Email: {selectedVolunteer.email ?? "-"}
                  </p>
                </div>

                <section>
                  <h3 className="text-lg font-semibold text-slate-900">Cani</h3>
                  <div className="mt-2 space-y-2">
                    {(selectedVolunteer.dogs ?? []).length === 0 ? (
                      <p className="text-sm text-slate-600">
                        Nessun cane associato.
                      </p>
                    ) : (
                      (selectedVolunteer.dogs ?? []).map((dog) => (
                        <div
                          key={dog.id}
                          className="rounded-md border border-slate-200 bg-slate-50 p-3"
                        >
                          <p className="font-medium text-slate-900">
                            {dog.name ?? "SENZA NOME"}
                          </p>
                          <p className="text-sm text-slate-700">
                            Razza: {dog.breed ?? "-"} | Sesso: {dog.sex ?? "-"} |
                            Microchip: {dog.microchip ?? "-"}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            )}
          </article>
        </section>

        {isEditorOpen ? (
          <section ref={editorRef} className="app-card rounded-xl p-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {editingVolunteerId ? "Modifica volontario" : "Nuovo volontario"}
            </h3>
            <form onSubmit={handleVolunteerSave} className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Nome *</span>
                <input
                  type="text"
                  required
                  value={volunteerForm.first_name}
                  onChange={(event) =>
                    handleVolunteerFormChange("first_name", event.target.value)
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Cognome *</span>
                <input
                  type="text"
                  required
                  value={volunteerForm.last_name}
                  onChange={(event) =>
                    handleVolunteerFormChange("last_name", event.target.value)
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Codice fiscale</span>
                <input
                  type="text"
                  value={volunteerForm.tax_code}
                  onChange={(event) =>
                    handleVolunteerFormChange("tax_code", event.target.value)
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Telefono</span>
                <input
                  type="text"
                  value={volunteerForm.phone}
                  onChange={(event) => handleVolunteerFormChange("phone", event.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Email</span>
                <input
                  type="email"
                  value={volunteerForm.email}
                  onChange={(event) => handleVolunteerFormChange("email", event.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Tipo socio</span>
                <input
                  type="text"
                  value={volunteerForm.member_type}
                  onChange={(event) =>
                    handleVolunteerFormChange("member_type", event.target.value)
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Squadra</span>
                <input
                  type="text"
                  value={volunteerForm.team}
                  onChange={(event) => handleVolunteerFormChange("team", event.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Qualifica</span>
                <input
                  type="text"
                  value={volunteerForm.qualification}
                  onChange={(event) =>
                    handleVolunteerFormChange("qualification", event.target.value)
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Data entrata</span>
                <input
                  type="date"
                  value={volunteerForm.entry_date}
                  onChange={(event) =>
                    handleVolunteerFormChange("entry_date", event.target.value)
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Data uscita</span>
                <input
                  type="date"
                  value={volunteerForm.exit_date}
                  onChange={(event) => handleVolunteerFormChange("exit_date", event.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <div className="md:col-span-2 flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSavingVolunteer}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSavingVolunteer ? "Salvataggio..." : "Salva volontario"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
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
