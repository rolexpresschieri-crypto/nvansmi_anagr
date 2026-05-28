"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { generateMedicalVisitsPdf } from "@/lib/generateMedicalVisitsPdf";
import { generateVolunteersPdf } from "@/lib/generateVolunteersPdf";
import { supabase } from "@/lib/supabaseClient";
import {
  isVolunteerActive,
  memberTypeSelectOptions,
  qualificationSelectOptions,
  teamSelectOptions,
  type VolunteerRecord,
  VOLUNTEER_EXPORT_SELECT_FIELDS,
} from "@/lib/volunteerTypes";

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export default function ExportReportsPanel() {
  const [session, setSession] = useState<Session | null>(null);
  const [isBootLoading, setIsBootLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingMedical, setIsGeneratingMedical] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [volunteers, setVolunteers] = useState<VolunteerRecord[]>([]);

  const [socioFilter, setSocioFilter] = useState<"tutti" | "attivi" | "non_attivi">("attivi");
  const [memberTypeFilters, setMemberTypeFilters] = useState<string[]>([
    ...memberTypeSelectOptions,
  ]);
  const [teamFilters, setTeamFilters] = useState<string[]>([...teamSelectOptions]);
  const [qualificationFilters, setQualificationFilters] = useState<string[]>([
    ...qualificationSelectOptions,
  ]);

  const [medicalMemberTypeFilters, setMedicalMemberTypeFilters] = useState<string[]>([
    ...memberTypeSelectOptions,
  ]);
  const [medicalTeamFilters, setMedicalTeamFilters] = useState<string[]>([
    ...teamSelectOptions,
  ]);

  const memberTypeInitializedRef = useRef(false);
  const teamInitializedRef = useRef(false);
  const qualificationInitializedRef = useRef(false);
  const medicalMemberTypeInitializedRef = useRef(false);
  const medicalTeamInitializedRef = useRef(false);

  const loadVolunteers = useCallback(async (currentSession: Session | null) => {
    if (!currentSession) {
      setVolunteers([]);
      memberTypeInitializedRef.current = false;
      teamInitializedRef.current = false;
      qualificationInitializedRef.current = false;
      medicalMemberTypeInitializedRef.current = false;
      medicalTeamInitializedRef.current = false;
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await supabase
      .from("volunteers")
      .select(VOLUNTEER_EXPORT_SELECT_FIELDS)
      .order("last_name", { ascending: true });

    if (error) {
      setErrorMessage(error.message);
      setVolunteers([]);
    } else {
      const rows = (data ?? []) as VolunteerRecord[];
      setVolunteers(rows);

      if (!memberTypeInitializedRef.current) {
        const fromData = Array.from(
          new Set(rows.map((item) => item.member_type).filter(Boolean))
        ) as string[];
        if (fromData.length > 0) {
          setMemberTypeFilters(fromData.sort((a, b) => a.localeCompare(b, "it")));
        }
        memberTypeInitializedRef.current = true;
      }

      if (!teamInitializedRef.current) {
        const fromData = Array.from(
          new Set(rows.map((item) => item.team).filter(Boolean))
        ) as string[];
        if (fromData.length > 0) {
          setTeamFilters(fromData.sort((a, b) => a.localeCompare(b, "it")));
        }
        teamInitializedRef.current = true;
      }

      if (!qualificationInitializedRef.current) {
        const fromData = Array.from(
          new Set(rows.map((item) => item.qualification).filter(Boolean))
        ) as string[];
        if (fromData.length > 0) {
          setQualificationFilters(fromData.sort((a, b) => a.localeCompare(b, "it")));
        }
        qualificationInitializedRef.current = true;
      }

      if (!medicalMemberTypeInitializedRef.current) {
        const fromData = Array.from(
          new Set(rows.map((item) => item.member_type).filter(Boolean))
        ) as string[];
        if (fromData.length > 0) {
          setMedicalMemberTypeFilters(fromData.sort((a, b) => a.localeCompare(b, "it")));
        }
        medicalMemberTypeInitializedRef.current = true;
      }

      if (!medicalTeamInitializedRef.current) {
        const fromData = Array.from(
          new Set(rows.map((item) => item.team).filter(Boolean))
        ) as string[];
        if (fromData.length > 0) {
          setMedicalTeamFilters(fromData.sort((a, b) => a.localeCompare(b, "it")));
        }
        medicalTeamInitializedRef.current = true;
      }
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const boot = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) setErrorMessage(error.message);
      setSession(data.session);
      await loadVolunteers(data.session);
      setIsBootLoading(false);
    };

    boot();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      void loadVolunteers(currentSession);
    });

    return () => authListener.subscription.unsubscribe();
  }, [loadVolunteers]);

  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((item) => {
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

      const matchQualification =
        qualificationFilters.length === 0 ||
        (item.qualification ? qualificationFilters.includes(item.qualification) : false);

      return matchSocio && matchMemberType && matchTeam && matchQualification;
    });
  }, [volunteers, socioFilter, memberTypeFilters, teamFilters, qualificationFilters]);

  const filteredMedicalVolunteers = useMemo(() => {
    return volunteers.filter((item) => {
      if (!isVolunteerActive(item)) return false;

      const matchMemberType =
        medicalMemberTypeFilters.length === 0 ||
        (item.member_type ? medicalMemberTypeFilters.includes(item.member_type) : false);

      const matchTeam =
        medicalTeamFilters.length === 0 ||
        (item.team ? medicalTeamFilters.includes(item.team) : false);

      return matchMemberType && matchTeam;
    });
  }, [volunteers, medicalMemberTypeFilters, medicalTeamFilters]);

  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    if (socioFilter === "attivi") parts.push("Soci attivi");
    else if (socioFilter === "non_attivi") parts.push("Soci non attivi");
    else parts.push("Tutti i soci");
    if (memberTypeFilters.length > 0) {
      parts.push(`Tipo socio: ${memberTypeFilters.join(", ")}`);
    }
    if (teamFilters.length > 0) parts.push(`Squadra: ${teamFilters.join(", ")}`);
    if (qualificationFilters.length > 0) {
      parts.push(`Qualifica: ${qualificationFilters.join(", ")}`);
    }
    return parts.join(" | ");
  }, [socioFilter, memberTypeFilters, teamFilters, qualificationFilters]);

  const medicalFilterSummary = useMemo(() => {
    const parts: string[] = ["Soci attivi"];
    if (medicalMemberTypeFilters.length > 0) {
      parts.push(`Tipo socio: ${medicalMemberTypeFilters.join(", ")}`);
    }
    if (medicalTeamFilters.length > 0) {
      parts.push(`Squadra: ${medicalTeamFilters.join(", ")}`);
    }
    return parts.join(" | ");
  }, [medicalMemberTypeFilters, medicalTeamFilters]);

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      await generateVolunteersPdf(filteredVolunteers, filterSummary);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Errore generazione PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const scrollToReport = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleGenerateMedicalPdf = async () => {
    setIsGeneratingMedical(true);
    setErrorMessage(null);
    try {
      await generateMedicalVisitsPdf(filteredMedicalVolunteers, medicalFilterSummary);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Errore generazione PDF");
    } finally {
      setIsGeneratingMedical(false);
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
        <div className="app-card mx-auto max-w-6xl rounded-xl p-6 space-y-3">
          <p className="text-slate-700">Accedi dall&apos;anagrafica per usare i report PDF.</p>
          <Link
            href="/"
            className="inline-flex rounded-md border border-slate-300 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Vai al login
          </Link>
        </div>
      </main>
    );
  }

  const checkboxGroup = (
    title: string,
    options: string[],
    selected: string[],
    onToggle: (value: string) => void,
    onSelectAll: () => void,
    onClearAll: () => void
  ) => (
    <div className="rounded-md border border-slate-200 bg-white/80 p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-600">{title}</p>
        <div className="flex gap-2 text-xs">
          <button type="button" onClick={onSelectAll} className="text-blue-700 hover:underline">
            Tutti
          </button>
          <button type="button" onClick={onClearAll} className="text-slate-600 hover:underline">
            Nessuno
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs"
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onToggle(option)}
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="app-card rounded-xl p-4">
          <h1 className="text-2xl font-semibold text-slate-900">Export e Report PDF</h1>
          <p className="mt-1 text-sm text-slate-600">
            Report in formato PDF con logo NV ANSMI in alto a destra. Ordinamento per cognome e
            nome.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/"
              className="inline-flex rounded-md border border-slate-300 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Torna all&apos;anagrafica
            </Link>
          </div>

          <nav
            aria-label="Menu report"
            className="mt-4 rounded-lg border border-slate-200 bg-slate-50/90 p-2"
          >
            <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              Menu report
            </p>
            <ul className="flex flex-col gap-1 sm:flex-row sm:flex-wrap">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToReport("report-elenco-volontari")}
                  className="w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-blue-800 hover:bg-blue-50 sm:w-auto"
                >
                  1. Elenco volontari (PDF)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToReport("report-situazione-visite-mediche")}
                  className="w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-blue-800 hover:bg-blue-50 sm:w-auto"
                >
                  2. Situazione visite mediche
                </button>
              </li>
            </ul>
          </nav>
        </header>

        {errorMessage ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <section
          id="report-elenco-volontari"
          className="app-card scroll-mt-4 rounded-xl p-4 space-y-4"
        >
          <h2 className="text-lg font-semibold text-slate-900">1. Elenco volontari (PDF)</h2>
          <p className="text-sm text-slate-600">
            Colonne: data entrata/uscita, sedi, squadra, tipo socio, qualifica, anagrafica,
            tessere, residenza, contatti, nascita, data odierna e ultima visita medica.
          </p>

          <div className="flex flex-wrap gap-2">
            {(["attivi", "non_attivi", "tutti"] as const).map((value) => (
              <label
                key={value}
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <input
                  type="radio"
                  name="socioFilter"
                  checked={socioFilter === value}
                  onChange={() => setSocioFilter(value)}
                />
                {value === "attivi"
                  ? "Attivi"
                  : value === "non_attivi"
                    ? "Non attivi"
                    : "Tutti"}
              </label>
            ))}
          </div>

          {checkboxGroup(
            "Tipo socio",
            memberTypeSelectOptions,
            memberTypeFilters,
            (v) => setMemberTypeFilters((c) => toggleInList(c, v)),
            () => setMemberTypeFilters([...memberTypeSelectOptions]),
            () => setMemberTypeFilters([])
          )}

          {checkboxGroup(
            "Squadra",
            teamSelectOptions,
            teamFilters,
            (v) => setTeamFilters((c) => toggleInList(c, v)),
            () => setTeamFilters([...teamSelectOptions]),
            () => setTeamFilters([])
          )}

          {checkboxGroup(
            "Qualifica",
            qualificationSelectOptions,
            qualificationFilters,
            (v) => setQualificationFilters((c) => toggleInList(c, v)),
            () => setQualificationFilters([...qualificationSelectOptions]),
            () => setQualificationFilters([])
          )}

          <p className="text-sm text-slate-700">
            {isLoading
              ? "Caricamento volontari..."
              : `${filteredVolunteers.length} volontari selezionati su ${volunteers.length}`}
          </p>

          <button
            type="button"
            disabled={isGenerating || isLoading || filteredVolunteers.length === 0}
            onClick={() => void handleGeneratePdf()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? "Generazione PDF..." : "Genera PDF elenco volontari"}
          </button>
        </section>

        <section
          id="report-situazione-visite-mediche"
          className="app-card scroll-mt-4 rounded-xl p-4 space-y-4"
        >
          <h2 className="text-lg font-semibold text-slate-900">2. Situazione visite mediche</h2>
          <p className="text-sm text-slate-600">
            Solo soci attivi. Colonne: squadra, cognome, nome, data ultima visita medica, data
            scadenza, giorni di ritardo sulla scadenza (solo se visita scaduta).
          </p>

          {checkboxGroup(
            "Tipo socio",
            memberTypeSelectOptions,
            medicalMemberTypeFilters,
            (v) => setMedicalMemberTypeFilters((c) => toggleInList(c, v)),
            () => setMedicalMemberTypeFilters([...memberTypeSelectOptions]),
            () => setMedicalMemberTypeFilters([])
          )}

          {checkboxGroup(
            "Squadra",
            teamSelectOptions,
            medicalTeamFilters,
            (v) => setMedicalTeamFilters((c) => toggleInList(c, v)),
            () => setMedicalTeamFilters([...teamSelectOptions]),
            () => setMedicalTeamFilters([])
          )}

          <p className="text-sm text-slate-700">
            {isLoading
              ? "Caricamento volontari..."
              : `${filteredMedicalVolunteers.length} soci attivi selezionati`}
          </p>

          <button
            type="button"
            disabled={
              isGeneratingMedical || isLoading || filteredMedicalVolunteers.length === 0
            }
            onClick={() => void handleGenerateMedicalPdf()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGeneratingMedical
              ? "Generazione PDF..."
              : "Genera PDF situazione visite mediche"}
          </button>
        </section>

        <section className="app-card rounded-xl p-4">
          <h2 className="text-lg font-semibold text-slate-900">Altri report</h2>
          <p className="mt-1 text-sm text-slate-600">Prossimi report PDF: corsi, cinofilo.</p>
        </section>
      </div>
    </main>
  );
}
