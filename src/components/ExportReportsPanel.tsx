"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  type CourseCompletionMap,
  type CourseMatrixColumn,
  generateCoursesMatrixPdf,
} from "@/lib/generateCoursesMatrixPdf";
import {
  type EquipmentSizeMap,
  generateEquipmentMatrixPdf,
} from "@/lib/generateEquipmentMatrixPdf";
import { logAppEvent } from "@/lib/auditLog";
import { generateMedicalVisitsPdf } from "@/lib/generateMedicalVisitsPdf";
import { generateVolunteersPdf } from "@/lib/generateVolunteersPdf";
import { supabase } from "@/lib/supabaseClient";
import {
  courseShortLabel,
  isPredefinedCourseCode,
  predefinedCourseOrder,
} from "@/lib/volunteerCatalog";
import {
  isVolunteerActive,
  memberTypeSelectOptions,
  normalizeOperationalStatus,
  normalizeQualification,
  operationalStatusSelectOptions,
  qualificationFilterOptions,
  teamSelectOptions,
  type VolunteerRecord,
  VOLUNTEER_EXPORT_SELECT_FIELDS,
} from "@/lib/volunteerTypes";

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

type CourseCatalogRow = { id: string; code: string; name: string };
type VolunteerCourseRow = {
  volunteer_id: string;
  course_id: string;
  completion_date: string | null;
  passed: boolean | null;
};
type EquipmentIssueRow = {
  volunteer_id: string;
  item_code: string;
  size_value: string | null;
};

export default function ExportReportsPanel() {
  const [session, setSession] = useState<Session | null>(null);
  const [isBootLoading, setIsBootLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingMedical, setIsGeneratingMedical] = useState(false);
  const [isGeneratingCourses, setIsGeneratingCourses] = useState(false);
  const [isGeneratingEquipment, setIsGeneratingEquipment] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [volunteers, setVolunteers] = useState<VolunteerRecord[]>([]);
  const [courseCatalog, setCourseCatalog] = useState<CourseCatalogRow[]>([]);
  const [volunteerCourses, setVolunteerCourses] = useState<VolunteerCourseRow[]>([]);
  const [equipmentIssues, setEquipmentIssues] = useState<EquipmentIssueRow[]>([]);

  const [socioFilter, setSocioFilter] = useState<"tutti" | "attivi" | "non_attivi">("attivi");
  const [memberTypeFilters, setMemberTypeFilters] = useState<string[]>([
    ...memberTypeSelectOptions,
  ]);
  const [operationalStatusFilters, setOperationalStatusFilters] = useState<string[]>([
    ...operationalStatusSelectOptions,
  ]);
  const [teamFilters, setTeamFilters] = useState<string[]>([...teamSelectOptions]);
  const [qualificationFilters, setQualificationFilters] = useState<string[]>([
    ...qualificationFilterOptions,
  ]);

  const [medicalMemberTypeFilters, setMedicalMemberTypeFilters] = useState<string[]>([
    ...memberTypeSelectOptions,
  ]);
  const [medicalTeamFilters, setMedicalTeamFilters] = useState<string[]>([
    ...teamSelectOptions,
  ]);

  const [coursesSocioFilter, setCoursesSocioFilter] = useState<
    "tutti" | "attivi" | "non_attivi"
  >("attivi");
  const [coursesMemberTypeFilters, setCoursesMemberTypeFilters] = useState<string[]>([
    ...memberTypeSelectOptions,
  ]);
  const [coursesTeamFilters, setCoursesTeamFilters] = useState<string[]>([
    ...teamSelectOptions,
  ]);
  const [excludedCourseCodes, setExcludedCourseCodes] = useState<string[]>([]);
  const [hideEmptyCourses, setHideEmptyCourses] = useState(true);

  const [equipmentSocioFilter, setEquipmentSocioFilter] = useState<
    "tutti" | "attivi" | "non_attivi"
  >("attivi");
  const [equipmentMemberTypeFilters, setEquipmentMemberTypeFilters] = useState<string[]>([
    ...memberTypeSelectOptions,
  ]);
  const [equipmentTeamFilters, setEquipmentTeamFilters] = useState<string[]>([
    ...teamSelectOptions,
  ]);

  const memberTypeInitializedRef = useRef(false);
  const teamInitializedRef = useRef(false);
  const qualificationInitializedRef = useRef(false);
  const medicalMemberTypeInitializedRef = useRef(false);
  const medicalTeamInitializedRef = useRef(false);
  const coursesMemberTypeInitializedRef = useRef(false);
  const coursesTeamInitializedRef = useRef(false);
  const equipmentMemberTypeInitializedRef = useRef(false);
  const equipmentTeamInitializedRef = useRef(false);

  const loadVolunteers = useCallback(async (currentSession: Session | null) => {
    if (!currentSession) {
      setVolunteers([]);
      memberTypeInitializedRef.current = false;
      teamInitializedRef.current = false;
      qualificationInitializedRef.current = false;
      medicalMemberTypeInitializedRef.current = false;
      medicalTeamInitializedRef.current = false;
      coursesMemberTypeInitializedRef.current = false;
      coursesTeamInitializedRef.current = false;
      equipmentMemberTypeInitializedRef.current = false;
      equipmentTeamInitializedRef.current = false;
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await supabase
      .from("volunteers")
      .select(VOLUNTEER_EXPORT_SELECT_FIELDS)
      .order("entry_date", { ascending: true, nullsFirst: false })
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
          new Set(
            rows
              .map((item) => normalizeQualification(item.qualification))
              .filter(Boolean)
          )
        ).sort((a, b) => a.localeCompare(b, "it"));
        if (fromData.length > 0) {
          setQualificationFilters(fromData);
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

      if (!coursesMemberTypeInitializedRef.current) {
        const fromData = Array.from(
          new Set(rows.map((item) => item.member_type).filter(Boolean))
        ) as string[];
        if (fromData.length > 0) {
          setCoursesMemberTypeFilters(fromData.sort((a, b) => a.localeCompare(b, "it")));
        }
        coursesMemberTypeInitializedRef.current = true;
      }

      if (!coursesTeamInitializedRef.current) {
        const fromData = Array.from(
          new Set(rows.map((item) => item.team).filter(Boolean))
        ) as string[];
        if (fromData.length > 0) {
          setCoursesTeamFilters(fromData.sort((a, b) => a.localeCompare(b, "it")));
        }
        coursesTeamInitializedRef.current = true;
      }

      if (!equipmentMemberTypeInitializedRef.current) {
        const fromData = Array.from(
          new Set(rows.map((item) => item.member_type).filter(Boolean))
        ) as string[];
        if (fromData.length > 0) {
          setEquipmentMemberTypeFilters(fromData.sort((a, b) => a.localeCompare(b, "it")));
        }
        equipmentMemberTypeInitializedRef.current = true;
      }

      if (!equipmentTeamInitializedRef.current) {
        const fromData = Array.from(
          new Set(rows.map((item) => item.team).filter(Boolean))
        ) as string[];
        if (fromData.length > 0) {
          setEquipmentTeamFilters(fromData.sort((a, b) => a.localeCompare(b, "it")));
        }
        equipmentTeamInitializedRef.current = true;
      }
    }

    setIsLoading(false);
  }, []);

  const loadExtrasData = useCallback(async (currentSession: Session | null) => {
    if (!currentSession) {
      setCourseCatalog([]);
      setVolunteerCourses([]);
      setEquipmentIssues([]);
      return;
    }

    const [catalogRes, coursesRes, equipmentRes] = await Promise.all([
      supabase.from("course_catalog").select("id, code, name"),
      supabase
        .from("volunteer_courses")
        .select("volunteer_id, course_id, completion_date, passed"),
      supabase.from("equipment_issues").select("volunteer_id, item_code, size_value"),
    ]);

    if (catalogRes.error || coursesRes.error || equipmentRes.error) {
      setErrorMessage(
        catalogRes.error?.message ??
          coursesRes.error?.message ??
          equipmentRes.error?.message ??
          null
      );
      setCourseCatalog([]);
      setVolunteerCourses([]);
      setEquipmentIssues([]);
      return;
    }

    setCourseCatalog((catalogRes.data ?? []) as CourseCatalogRow[]);
    setVolunteerCourses((coursesRes.data ?? []) as VolunteerCourseRow[]);
    setEquipmentIssues((equipmentRes.data ?? []) as EquipmentIssueRow[]);
  }, []);

  useEffect(() => {
    const boot = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) setErrorMessage(error.message);
      setSession(data.session);
      await Promise.all([loadVolunteers(data.session), loadExtrasData(data.session)]);
      setIsBootLoading(false);
    };

    boot();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      void loadVolunteers(currentSession);
      void loadExtrasData(currentSession);
    });

    return () => authListener.subscription.unsubscribe();
  }, [loadVolunteers, loadExtrasData]);

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

      const status = normalizeOperationalStatus(item.operational_status);
      const matchOperationalStatus =
        operationalStatusFilters.length === 0 ||
        operationalStatusFilters.includes(status);

      const matchTeam =
        teamFilters.length === 0 || (item.team ? teamFilters.includes(item.team) : false);

      const qual = normalizeQualification(item.qualification);
      const matchQualification =
        qualificationFilters.length === 0 ||
        (qual ? qualificationFilters.includes(qual) : false);

      return (
        matchSocio &&
        matchMemberType &&
        matchOperationalStatus &&
        matchTeam &&
        matchQualification
      );
    });
  }, [
    volunteers,
    socioFilter,
    memberTypeFilters,
    operationalStatusFilters,
    teamFilters,
    qualificationFilters,
  ]);

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

  const filteredCoursesVolunteers = useMemo(() => {
    return volunteers.filter((item) => {
      const active = isVolunteerActive(item);
      const matchSocio =
        coursesSocioFilter === "tutti" ||
        (coursesSocioFilter === "attivi" && active) ||
        (coursesSocioFilter === "non_attivi" && !active);

      const matchMemberType =
        coursesMemberTypeFilters.length === 0 ||
        (item.member_type ? coursesMemberTypeFilters.includes(item.member_type) : false);

      const matchTeam =
        coursesTeamFilters.length === 0 ||
        (item.team ? coursesTeamFilters.includes(item.team) : false);

      return matchSocio && matchMemberType && matchTeam;
    });
  }, [volunteers, coursesSocioFilter, coursesMemberTypeFilters, coursesTeamFilters]);

  /** Corsi in catalogo, prima i predefiniti nell'ordine standard, poi i manuali. */
  const catalogCourses = useMemo<CourseMatrixColumn[]>(() => {
    return [...courseCatalog]
      .sort((a, b) => {
        const orderA = isPredefinedCourseCode(a.code)
          ? predefinedCourseOrder(a.code)
          : Number.MAX_SAFE_INTEGER;
        const orderB = isPredefinedCourseCode(b.code)
          ? predefinedCourseOrder(b.code)
          : Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) return orderA - orderB;
        return a.name.localeCompare(b.name, "it");
      })
      .map((row) => ({
        code: row.code,
        name: row.name,
        short: courseShortLabel(row.code, row.name),
      }));
  }, [courseCatalog]);

  const courseCompletions = useMemo<CourseCompletionMap>(() => {
    const codeById = new Map(courseCatalog.map((row) => [row.id, row.code]));
    const map: CourseCompletionMap = {};
    for (const row of volunteerCourses) {
      const code = codeById.get(row.course_id);
      if (!code) continue;
      const value = row.completion_date ?? (row.passed ? "SI" : "");
      if (!value) continue;
      if (!map[row.volunteer_id]) map[row.volunteer_id] = {};
      map[row.volunteer_id][code] = value;
    }
    return map;
  }, [courseCatalog, volunteerCourses]);

  const coursesForReport = useMemo(() => {
    const selectedIds = new Set(filteredCoursesVolunteers.map((item) => item.id));
    return catalogCourses.filter((course) => {
      if (excludedCourseCodes.includes(course.code)) return false;
      if (!hideEmptyCourses) return true;
      return Array.from(selectedIds).some((id) => Boolean(courseCompletions[id]?.[course.code]));
    });
  }, [
    catalogCourses,
    excludedCourseCodes,
    hideEmptyCourses,
    filteredCoursesVolunteers,
    courseCompletions,
  ]);

  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    if (socioFilter === "attivi") parts.push("Soci attivi");
    else if (socioFilter === "non_attivi") parts.push("Soci non attivi");
    else parts.push("Tutti i soci");
    if (memberTypeFilters.length > 0) {
      parts.push(`Tipo socio: ${memberTypeFilters.join(", ")}`);
    }
    if (operationalStatusFilters.length > 0) {
      parts.push(`Stato operativo: ${operationalStatusFilters.join(", ")}`);
    }
    if (teamFilters.length > 0) parts.push(`Squadra: ${teamFilters.join(", ")}`);
    if (qualificationFilters.length > 0) {
      parts.push(`Qualifica: ${qualificationFilters.join(", ")}`);
    }
    return parts.join(" | ");
  }, [
    socioFilter,
    memberTypeFilters,
    operationalStatusFilters,
    teamFilters,
    qualificationFilters,
  ]);

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

  const coursesFilterSummary = useMemo(() => {
    const parts: string[] = [];
    if (coursesSocioFilter === "attivi") parts.push("Soci attivi");
    else if (coursesSocioFilter === "non_attivi") parts.push("Soci non attivi");
    else parts.push("Tutti i soci");
    if (coursesMemberTypeFilters.length > 0) {
      parts.push(`Tipo socio: ${coursesMemberTypeFilters.join(", ")}`);
    }
    if (coursesTeamFilters.length > 0) {
      parts.push(`Squadra: ${coursesTeamFilters.join(", ")}`);
    }
    parts.push(`Corsi in colonna: ${coursesForReport.length}`);
    return parts.join(" | ");
  }, [
    coursesSocioFilter,
    coursesMemberTypeFilters,
    coursesTeamFilters,
    coursesForReport.length,
  ]);

  const filteredEquipmentVolunteers = useMemo(() => {
    return volunteers.filter((item) => {
      const active = isVolunteerActive(item);
      const matchSocio =
        equipmentSocioFilter === "tutti" ||
        (equipmentSocioFilter === "attivi" && active) ||
        (equipmentSocioFilter === "non_attivi" && !active);

      const matchMemberType =
        equipmentMemberTypeFilters.length === 0 ||
        (item.member_type ? equipmentMemberTypeFilters.includes(item.member_type) : false);

      const matchTeam =
        equipmentTeamFilters.length === 0 ||
        (item.team ? equipmentTeamFilters.includes(item.team) : false);

      return matchSocio && matchMemberType && matchTeam;
    });
  }, [volunteers, equipmentSocioFilter, equipmentMemberTypeFilters, equipmentTeamFilters]);

  const equipmentSizes = useMemo<EquipmentSizeMap>(() => {
    const map: EquipmentSizeMap = {};
    for (const row of equipmentIssues) {
      const size = row.size_value?.trim() ?? "";
      if (!size) continue;
      if (!map[row.volunteer_id]) map[row.volunteer_id] = {};
      map[row.volunteer_id][row.item_code] = size;
    }
    return map;
  }, [equipmentIssues]);

  const equipmentFilterSummary = useMemo(() => {
    const parts: string[] = [];
    if (equipmentSocioFilter === "attivi") parts.push("Soci attivi");
    else if (equipmentSocioFilter === "non_attivi") parts.push("Soci non attivi");
    else parts.push("Tutti i soci");
    if (equipmentMemberTypeFilters.length > 0) {
      parts.push(`Tipo socio: ${equipmentMemberTypeFilters.join(", ")}`);
    }
    if (equipmentTeamFilters.length > 0) {
      parts.push(`Squadra: ${equipmentTeamFilters.join(", ")}`);
    }
    return parts.join(" | ");
  }, [equipmentSocioFilter, equipmentMemberTypeFilters, equipmentTeamFilters]);

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      await generateVolunteersPdf(filteredVolunteers, filterSummary);
      await logAppEvent(
        "EXPORT",
        `PDF elenco volontari (${filteredVolunteers.length})`,
        { tableName: "volunteers", newData: { filterSummary } }
      );
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
      await logAppEvent(
        "EXPORT",
        `PDF visite mediche (${filteredMedicalVolunteers.length})`,
        { tableName: "medical_checks", newData: { filterSummary: medicalFilterSummary } }
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Errore generazione PDF");
    } finally {
      setIsGeneratingMedical(false);
    }
  };

  const handleGenerateCoursesPdf = async () => {
    setIsGeneratingCourses(true);
    setErrorMessage(null);
    try {
      await generateCoursesMatrixPdf(
        filteredCoursesVolunteers,
        coursesForReport,
        courseCompletions,
        coursesFilterSummary
      );
      await logAppEvent(
        "EXPORT",
        `PDF corsi volontari (${filteredCoursesVolunteers.length})`,
        { tableName: "volunteer_courses", newData: { filterSummary: coursesFilterSummary } }
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Errore generazione PDF");
    } finally {
      setIsGeneratingCourses(false);
    }
  };

  const handleGenerateEquipmentPdf = async () => {
    setIsGeneratingEquipment(true);
    setErrorMessage(null);
    try {
      await generateEquipmentMatrixPdf(
        filteredEquipmentVolunteers,
        equipmentSizes,
        equipmentFilterSummary
      );
      await logAppEvent(
        "EXPORT",
        `PDF dotazioni (${filteredEquipmentVolunteers.length})`,
        { tableName: "equipment_issues", newData: { filterSummary: equipmentFilterSummary } }
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Errore generazione PDF");
    } finally {
      setIsGeneratingEquipment(false);
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
    onClearAll: () => void,
    formatLabel: (value: string) => string = (value) => value
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
              checked={selected.some(
                (item) => normalizeQualification(item) === normalizeQualification(option)
              )}
              onChange={() => onToggle(option)}
            />
            {formatLabel(option)}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="app-card rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Export e Report PDF</h1>
              <p className="mt-1 text-sm text-slate-600">
                Report in formato PDF con logo NV ANSMI in alto a destra. Ordinamento per cognome e
                nome.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href="/"
                  className="inline-flex rounded-md border border-amber-400 bg-amber-300 px-3 py-2 text-sm font-bold text-amber-950 hover:bg-amber-400"
                >
                  Torna all&apos;anagrafica
                </Link>
              </div>
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
              <li>
                <button
                  type="button"
                  onClick={() => scrollToReport("report-corsi-volontari")}
                  className="w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-blue-800 hover:bg-blue-50 sm:w-auto"
                >
                  3. Corsi per volontario (orizzontale)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToReport("report-dotazioni")}
                  className="w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-blue-800 hover:bg-blue-50 sm:w-auto"
                >
                  4. Dotazioni per volontario
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
            Ordinato per data di entrata, dalla più vecchia alla più nuova. A parità di data
            per cognome e nome. Colonne: data entrata/uscita, sedi, squadra, tipo socio,
            qualifica, anagrafica, tessere, residenza, contatti, nascita e ultima visita medica.
            Formato orizzontale, font adattato automaticamente alla larghezza del foglio.
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
            "Stato operativo",
            [...operationalStatusSelectOptions],
            operationalStatusFilters,
            (v) => setOperationalStatusFilters((c) => toggleInList(c, v)),
            () => setOperationalStatusFilters([...operationalStatusSelectOptions]),
            () => setOperationalStatusFilters([])
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
            qualificationFilterOptions,
            qualificationFilters,
            (v) =>
              setQualificationFilters((c) => toggleInList(c, normalizeQualification(v))),
            () => setQualificationFilters([...qualificationFilterOptions]),
            () => setQualificationFilters([]),
            (v) => normalizeQualification(v) || v
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
            {isGenerating ? "Generazione PDF..." : "Genera PDF per data di entrata"}
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

        <section
          id="report-corsi-volontari"
          className="app-card scroll-mt-4 rounded-xl p-4 space-y-4"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            3. Corsi per volontario (orizzontale)
          </h2>
          <p className="text-sm text-slate-600">
            PDF orizzontale: a sinistra solo cognome + nome, in alto i corsi, all&apos;incrocio
            data (gg/mm/aa), testo (es. SI) oppure vuoto. I nomi corso sono abbreviati e a capo.
          </p>

          <div className="flex flex-wrap gap-2">
            {(["attivi", "non_attivi", "tutti"] as const).map((value) => (
              <label
                key={value}
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <input
                  type="radio"
                  name="coursesSocioFilter"
                  checked={coursesSocioFilter === value}
                  onChange={() => setCoursesSocioFilter(value)}
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
            coursesMemberTypeFilters,
            (v) => setCoursesMemberTypeFilters((c) => toggleInList(c, v)),
            () => setCoursesMemberTypeFilters([...memberTypeSelectOptions]),
            () => setCoursesMemberTypeFilters([])
          )}

          {checkboxGroup(
            "Squadra",
            teamSelectOptions,
            coursesTeamFilters,
            (v) => setCoursesTeamFilters((c) => toggleInList(c, v)),
            () => setCoursesTeamFilters([...teamSelectOptions]),
            () => setCoursesTeamFilters([])
          )}

          <div className="rounded-md border border-slate-200 bg-white/80 p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Corsi in colonna
              </p>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setExcludedCourseCodes([])}
                  className="text-blue-700 hover:underline"
                >
                  Tutti
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setExcludedCourseCodes(catalogCourses.map((course) => course.code))
                  }
                  className="text-slate-600 hover:underline"
                >
                  Nessuno
                </button>
              </div>
            </div>
            {catalogCourses.length === 0 ? (
              <p className="text-sm text-slate-600">
                Nessun corso in catalogo: esegui <code>seed_course_catalog.sql</code> su Supabase.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {catalogCourses.map((course) => (
                  <label
                    key={course.code}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={!excludedCourseCodes.includes(course.code)}
                      onChange={() =>
                        setExcludedCourseCodes((current) => toggleInList(current, course.code))
                      }
                    />
                    {course.name}
                  </label>
                ))}
              </div>
            )}
            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={hideEmptyCourses}
                onChange={(e) => setHideEmptyCourses(e.target.checked)}
              />
              Escludi i corsi senza alcuna data tra i volontari selezionati
            </label>
          </div>

          <p className="text-sm text-slate-700">
            {isLoading
              ? "Caricamento volontari e corsi..."
              : `${filteredCoursesVolunteers.length} volontari e ${coursesForReport.length} corsi in colonna`}
          </p>

          <button
            type="button"
            disabled={
              isGeneratingCourses ||
              isLoading ||
              filteredCoursesVolunteers.length === 0 ||
              coursesForReport.length === 0
            }
            onClick={() => void handleGenerateCoursesPdf()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGeneratingCourses ? "Generazione PDF..." : "Genera PDF corsi per volontario"}
          </button>
        </section>

        <section
          id="report-dotazioni"
          className="app-card scroll-mt-4 rounded-xl p-4 space-y-4"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            4. Dotazioni per volontario
          </h2>
          <p className="text-sm text-slate-600">
            PDF orizzontale: a sinistra cognome + nome, in alto le voci di dotazione, all&apos;incrocio
            la taglia/testo oppure vuoto se non assegnata.
          </p>

          <div className="flex flex-wrap gap-2">
            {(["attivi", "non_attivi", "tutti"] as const).map((value) => (
              <label
                key={value}
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <input
                  type="radio"
                  name="equipmentSocioFilter"
                  checked={equipmentSocioFilter === value}
                  onChange={() => setEquipmentSocioFilter(value)}
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
            equipmentMemberTypeFilters,
            (v) => setEquipmentMemberTypeFilters((c) => toggleInList(c, v)),
            () => setEquipmentMemberTypeFilters([...memberTypeSelectOptions]),
            () => setEquipmentMemberTypeFilters([])
          )}

          {checkboxGroup(
            "Squadra",
            teamSelectOptions,
            equipmentTeamFilters,
            (v) => setEquipmentTeamFilters((c) => toggleInList(c, v)),
            () => setEquipmentTeamFilters([...teamSelectOptions]),
            () => setEquipmentTeamFilters([])
          )}

          <p className="text-sm text-slate-700">
            {isLoading
              ? "Caricamento volontari e dotazioni..."
              : `${filteredEquipmentVolunteers.length} volontari selezionati`}
          </p>

          <button
            type="button"
            disabled={
              isGeneratingEquipment ||
              isLoading ||
              filteredEquipmentVolunteers.length === 0
            }
            onClick={() => void handleGenerateEquipmentPdf()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGeneratingEquipment
              ? "Generazione PDF..."
              : "Genera PDF dotazioni per volontario"}
          </button>
        </section>

        <section className="app-card rounded-xl p-4">
          <h2 className="text-lg font-semibold text-slate-900">Altri report</h2>
          <p className="mt-1 text-sm text-slate-600">Prossimo report PDF: cinofilo.</p>
        </section>
      </div>
    </main>
  );
}
