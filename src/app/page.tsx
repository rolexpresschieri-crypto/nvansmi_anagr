"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
  qualification: string | null;
  team: string | null;
  member_type: string | null;
  entry_date: string | null;
  exit_date: string | null;
  dogs: Dog[] | null;
};

export default function Home() {
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
  const [memberTypeFilter, setMemberTypeFilter] = useState("TUTTI");
  const [teamFilter, setTeamFilter] = useState<"TUTTE" | "VALSUSA" | "VARESE">(
    "TUTTE"
  );
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string | null>(
    null
  );

  const isVolunteerActive = (volunteer: Volunteer) =>
    Boolean(volunteer.entry_date) && !Boolean(volunteer.exit_date);

  useEffect(() => {
    const boot = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSession(data.session);
      }

      setIsBootLoading(false);
    };

    boot();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadVolunteers = async () => {
      if (!session) {
        setVolunteers([]);
        setSelectedVolunteerId(null);
        return;
      }

      setIsDataLoading(true);
      setErrorMessage(null);

      const { data, error } = await supabase
        .from("volunteers")
        .select(
          "id, first_name, last_name, qualification, team, member_type, entry_date, exit_date, dogs(id, name, breed, sex, microchip)"
        )
        .order("last_name", { ascending: true });

      if (error) {
        setErrorMessage(error.message);
      } else {
        const rows = (data ?? []) as Volunteer[];
        setVolunteers(rows);

        if (rows.length > 0) {
          setSelectedVolunteerId((current) => current ?? rows[0].id);
        } else {
          setSelectedVolunteerId(null);
        }
      }

      setIsDataLoading(false);
    };

    loadVolunteers();
  }, [session]);

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
        memberTypeFilter === "TUTTI" || item.member_type === memberTypeFilter;

      const matchTeam = teamFilter === "TUTTE" || item.team === teamFilter;

      return matchSearch && matchSocio && matchMemberType && matchTeam;
    });
  }, [volunteers, search, socioFilter, memberTypeFilter, teamFilter]);

  const memberTypeOptions = useMemo(() => {
    const values = Array.from(
      new Set(volunteers.map((item) => item.member_type).filter(Boolean))
    ) as string[];
    return values.sort((a, b) => a.localeCompare(b));
  }, [volunteers]);

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

  if (isBootLoading) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow-sm">
          Caricamento applicazione...
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto w-full max-w-md rounded-xl bg-white p-6 shadow-sm">
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
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm">
          <div className="space-y-2">
            <div>
            <h1 className="text-xl font-semibold text-slate-900">
              NV ANSMI - Anagrafica Volontari
            </h1>
            <p className="text-sm text-slate-600">{session.user.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={socioFilter}
                onChange={(event) =>
                  setSocioFilter(
                    event.target.value as "tutti" | "attivi" | "non_attivi"
                  )
                }
                className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="attivi">SOCI ATTIVI</option>
                <option value="non_attivi">SOCI NON ATTIVI</option>
                <option value="tutti">TUTTI I SOCI</option>
              </select>

              <select
                value={memberTypeFilter}
                onChange={(event) => setMemberTypeFilter(event.target.value)}
                className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="TUTTI">TIPO SOCIO: TUTTI</option>
                {memberTypeOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>

              <select
                value={teamFilter}
                onChange={(event) =>
                  setTeamFilter(event.target.value as "TUTTE" | "VALSUSA" | "VARESE")
                }
                className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="TUTTE">SQUADRA: TUTTE</option>
                <option value="VALSUSA">SQUADRA: VALSUSA</option>
                <option value="VARESE">SQUADRA: VARESE</option>
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
          <article className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-slate-900">Volontari</h2>
              <p className="text-sm text-slate-600">
                Totale: {filteredVolunteers.length}
              </p>
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
                        : "border-slate-200 bg-white hover:bg-slate-50"
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

          <article className="rounded-xl bg-white p-4 shadow-sm">
            {!selectedVolunteer ? (
              <p className="text-sm text-slate-600">
                Seleziona un volontario per vedere il dettaglio.
              </p>
            ) : (
              <div className="space-y-5">
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
      </div>
    </main>
  );
}
