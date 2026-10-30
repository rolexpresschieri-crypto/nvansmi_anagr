"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import DogBrevettiEditor from "@/components/DogBrevettiEditor";
import DogDetailCard from "@/components/DogDetailCard";
import VolunteerExtendedFormFields from "@/components/VolunteerExtendedFormFields";
import VolunteerExtrasPanel from "@/components/VolunteerExtrasPanel";
import { logAppEvent } from "@/lib/auditLog";
import { supabase } from "@/lib/supabaseClient";
import {
  emptyVolunteerForm,
  formatOperationalStatus,
  formatQualification,
  isVolunteerActive,
  memberTypeSelectOptions,
  normalizeOperationalStatus,
  operationalStatusSelectOptions,
  qualificationSelectOptions,
  teamSelectOptions,
  volunteerFormFromRecord,
  volunteerPayloadFromForm,
  VOLUNTEER_SELECT_FIELDS,
  type VolunteerFormValues,
  type VolunteerRecord,
} from "@/lib/volunteerTypes";

type Volunteer = VolunteerRecord;

export default function Home() {
  const [uiPreset, setUiPreset] = useState<"chiara" | "istituzionale">("chiara");
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isBootLoading, setIsBootLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [search, setSearch] = useState("");
  const [socioFilter, setSocioFilter] = useState<"tutti" | "attivi" | "non_attivi">(
    "tutti"
  );
  const [memberTypeFilters, setMemberTypeFilters] = useState<string[]>([]);
  const [operationalStatusFilters, setOperationalStatusFilters] = useState<string[]>([
    ...operationalStatusSelectOptions,
  ]);
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
  const [editingDogId, setEditingDogId] = useState<string | null>(null);
  const [isAddingDog, setIsAddingDog] = useState(false);
  const editorRef = useRef<HTMLElement | null>(null);
  const memberTypeInitializedRef = useRef(false);
  const teamInitializedRef = useRef(false);

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
      .select(VOLUNTEER_SELECT_FIELDS)
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

  const loadUserRole = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setUserRole(null);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    setUserRole((data?.role as string | undefined) ?? null);
  }, []);

  useEffect(() => {
    const boot = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSession(data.session);
        loadPresetForUser(data.session?.user?.id);
        await Promise.all([
          loadVolunteersForSession(data.session),
          loadUserRole(data.session?.user?.id),
        ]);
      }

      setIsBootLoading(false);
    };

    boot();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        loadPresetForUser(currentSession?.user?.id);
        void loadVolunteersForSession(currentSession);
        void loadUserRole(currentSession?.user?.id);
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, [loadVolunteersForSession, loadUserRole]);

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

      const status = normalizeOperationalStatus(item.operational_status);
      const matchOperationalStatus =
        operationalStatusFilters.length === 0 ||
        operationalStatusFilters.includes(status);

      const matchTeam =
        teamFilters.length === 0 || (item.team ? teamFilters.includes(item.team) : false);

      return (
        matchSearch &&
        matchSocio &&
        matchMemberType &&
        matchOperationalStatus &&
        matchTeam
      );
    });
  }, [
    volunteers,
    search,
    socioFilter,
    memberTypeFilters,
    operationalStatusFilters,
    teamFilters,
  ]);

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

  const toggleOperationalStatus = (value: string) => {
    setOperationalStatusFilters((current) =>
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
      await logAppEvent("LOGIN", `Accesso di ${email.trim().toLowerCase()}`);
      setEmail("");
      setPassword("");
    }

    setIsAuthLoading(false);
  };

  const handleSignOut = async () => {
    setErrorMessage(null);
    await logAppEvent("LOGOUT", "Uscita dall'applicazione");
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
    setVolunteerForm(volunteerFormFromRecord(selectedVolunteer));
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

    const payload = volunteerPayloadFromForm(volunteerForm);

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

  useEffect(() => {
    setEditingDogId(null);
    setIsAddingDog(false);
  }, [selectedVolunteerId]);

  const handleDogSaved = async () => {
    setEditingDogId(null);
    setIsAddingDog(false);
    await loadVolunteersForSession(session);
  };

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
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                NV ANSMI - Accesso
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Accedi con email e password per gestire l&apos;anagrafica volontari.
              </p>
            </div>
            <Image
              src="/logo-nvansmi.png"
              alt="NV ANSMI"
              width={64}
              height={64}
              className="h-16 w-16 shrink-0 object-contain"
              priority
            />
          </div>

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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-sm outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-800"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                      <path d="M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 9.3 3.1 11 7-0.6 1.4-1.5 2.7-2.7 3.7" />
                      <path d="M6.1 6.1C4.2 7.4 2.7 9.1 1.9 11c1.7 3.9 6 7 10.1 7 1.4 0 2.8-0.3 4-0.8" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M1.9 12C3.6 8.1 7.9 5 12 5s8.4 3.1 10.1 7c-1.7 3.9-6 7-10.1 7S3.6 15.9 1.9 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
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
        <header className="app-card space-y-3 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                NV ANSMI - Anagrafica Volontari
              </h1>
              <p className="text-sm text-slate-600">{session.user.email}</p>
            </div>
            <Image
              src="/logo-nvansmi.png"
              alt="NV ANSMI"
              width={64}
              height={64}
              className="h-16 w-16 shrink-0 object-contain"
              priority
            />
          </div>

          <div className="flex flex-wrap items-end gap-3">
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

            {userRole === "admin" || userRole === "segreteria" ? (
              <Link
                href="/audit"
                className="inline-flex items-center rounded-md border border-slate-400 bg-slate-100 px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-200"
              >
                LOG ACCESSI
              </Link>
            ) : null}

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

            <div className="rounded-md border border-sky-300 bg-sky-50 px-3 py-2">
              <p className="mb-1 text-xs font-bold tracking-wide text-sky-700">
                STATO OPERATIVO (MULTI)
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {operationalStatusSelectOptions.map((value) => (
                  <label
                    key={value}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-sky-900"
                  >
                    <input
                      type="checkbox"
                      checked={operationalStatusFilters.includes(value)}
                      onChange={() => toggleOperationalStatus(value)}
                      className="h-3.5 w-3.5 accent-sky-600"
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

            <button
              type="button"
              onClick={handleSignOut}
              className="ml-auto rounded-md border border-red-700 bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700"
            >
              Esci
            </button>
          </div>
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
                      {formatQualification(volunteer.qualification)} | {volunteer.team ?? "-"}
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
                        | Tipo socio: {selectedVolunteer.member_type ?? "-"} | Stato:{" "}
                        {formatOperationalStatus(selectedVolunteer.operational_status)} | Qualifica:{" "}
                        {formatQualification(selectedVolunteer.qualification)} | Squadra:{" "}
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
                  <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                    <p>
                      <span className="font-semibold">Sede ANSMI:</span>{" "}
                      {selectedVolunteer.ansmi_office ?? "-"}
                    </p>
                    <p>
                      <span className="font-semibold">Sede NV ANSMI:</span>{" "}
                      {selectedVolunteer.nv_office ?? "-"}
                    </p>
                    <p>
                      <span className="font-semibold">Assicurazione PC:</span>{" "}
                      {selectedVolunteer.pc_insurance ?? "-"}
                    </p>
                    <p>
                      <span className="font-semibold">N° tessera ANSMI:</span>{" "}
                      {selectedVolunteer.ansmi_card_number ?? "-"}
                    </p>
                    <p>
                      <span className="font-semibold">N° tessera NV ANSMI:</span>{" "}
                      {selectedVolunteer.nv_card_number ?? "-"}
                    </p>
                    <p className="sm:col-span-2">
                      <span className="font-semibold">Residenza:</span>{" "}
                      {[
                        selectedVolunteer.residence_address,
                        selectedVolunteer.residence_zip,
                        selectedVolunteer.residence_city,
                        selectedVolunteer.residence_province,
                      ]
                        .filter(Boolean)
                        .join(" ") || "-"}
                    </p>
                    <p>
                      <span className="font-semibold">Luogo di nascita:</span>{" "}
                      {selectedVolunteer.birth_place ?? "-"}
                      {selectedVolunteer.birth_province
                        ? ` (${selectedVolunteer.birth_province})`
                        : ""}
                    </p>
                    <p>
                      <span className="font-semibold">Data di nascita:</span>{" "}
                      {selectedVolunteer.birth_date
                        ? new Date(selectedVolunteer.birth_date).toLocaleDateString("it-IT")
                        : "-"}
                    </p>
                    <p>
                      <span className="font-semibold">Data entrata:</span>{" "}
                      {selectedVolunteer.entry_date
                        ? new Date(selectedVolunteer.entry_date).toLocaleDateString("it-IT")
                        : "-"}
                    </p>
                    <p>
                      <span className="font-semibold">Data uscita:</span>{" "}
                      {selectedVolunteer.exit_date
                        ? new Date(selectedVolunteer.exit_date).toLocaleDateString("it-IT")
                        : "-"}
                    </p>
                  </div>
                </div>

                <section>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">Cani</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingDog(true);
                        setEditingDogId(null);
                      }}
                      className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                    >
                      + NUOVO CANE
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {isAddingDog ? (
                      <DogBrevettiEditor
                        dog={null}
                        volunteerId={selectedVolunteer.id}
                        onSaved={() => void handleDogSaved()}
                        onCancel={() => setIsAddingDog(false)}
                        onError={setErrorMessage}
                      />
                    ) : null}

                    {(selectedVolunteer.dogs ?? []).length === 0 && !isAddingDog ? (
                      <p className="text-sm text-slate-600">
                        Nessun cane associato. Usa <strong>+ NUOVO CANE</strong> per aggiungerne uno.
                      </p>
                    ) : null}

                    {(selectedVolunteer.dogs ?? []).map((dog) =>
                      editingDogId === dog.id ? (
                        <DogBrevettiEditor
                          key={dog.id}
                          dog={dog}
                          volunteerId={selectedVolunteer.id}
                          onSaved={() => void handleDogSaved()}
                          onCancel={() => setEditingDogId(null)}
                          onError={setErrorMessage}
                        />
                      ) : (
                        <DogDetailCard
                          key={dog.id}
                          dog={dog}
                          onEdit={() => {
                            setEditingDogId(dog.id);
                            setIsAddingDog(false);
                          }}
                        />
                      )
                    )}
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Visite, corsi e dotazioni
                  </h3>
                  <div className="mt-2">
                    <VolunteerExtrasPanel
                      key={selectedVolunteer.id}
                      volunteerId={selectedVolunteer.id}
                      onError={setErrorMessage}
                    />
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
                <select
                  value={volunteerForm.member_type}
                  onChange={(event) =>
                    handleVolunteerFormChange("member_type", event.target.value)
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Seleziona tipo socio</option>
                  {memberTypeSelectOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">
                  Stato operativo
                </span>
                <select
                  value={volunteerForm.operational_status}
                  onChange={(event) =>
                    handleVolunteerFormChange(
                      "operational_status",
                      event.target.value.toUpperCase()
                    )
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                  {operationalStatusSelectOptions.map((option) => (
                    <option key={option} value={option}>
                      {formatOperationalStatus(option)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Squadra</span>
                <select
                  value={volunteerForm.team}
                  onChange={(event) => handleVolunteerFormChange("team", event.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Seleziona squadra</option>
                  {teamSelectOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Qualifica</span>
                <select
                  value={volunteerForm.qualification}
                  onChange={(event) =>
                    handleVolunteerFormChange("qualification", event.target.value)
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Seleziona qualifica</option>
                  {qualificationSelectOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
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

              <VolunteerExtendedFormFields
                form={volunteerForm}
                onChange={handleVolunteerFormChange}
              />

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
