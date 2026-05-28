"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  formatItDate,
  getMedicalExpiryStatus,
  medicalExpiryFromCheckDate,
} from "@/lib/medicalExpiry";
import { COURSE_DEFINITIONS, EQUIPMENT_DEFINITIONS } from "@/lib/volunteerCatalog";

type DetailTab = "visite" | "corsi" | "dotazioni";

type MedicalCheck = {
  id: string;
  check_date: string;
  expiry_date: string | null;
  notes: string | null;
};

type CourseCatalogRow = {
  id: string;
  code: string;
  name: string;
};

type VolunteerCourseRow = {
  id: string;
  course_id: string;
  completion_date: string | null;
  passed: boolean | null;
};

type EquipmentRow = {
  id: string;
  item_code: string;
  size_value: string | null;
};

type VolunteerExtrasPanelProps = {
  volunteerId: string;
  onError: (message: string | null) => void;
};

export default function VolunteerExtrasPanel({
  volunteerId,
  onError,
}: VolunteerExtrasPanelProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>("corsi");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [catalog, setCatalog] = useState<CourseCatalogRow[]>([]);
  const [medicalChecks, setMedicalChecks] = useState<MedicalCheck[]>([]);
  const [volunteerCourses, setVolunteerCourses] = useState<VolunteerCourseRow[]>(
    []
  );
  const [equipment, setEquipment] = useState<EquipmentRow[]>([]);

  const [newMedicalDate, setNewMedicalDate] = useState("");
  const [courseDates, setCourseDates] = useState<Record<string, string>>({});
  const [equipmentSizes, setEquipmentSizes] = useState<Record<string, string>>({});

  const catalogByCode = useMemo(() => {
    const map = new Map<string, CourseCatalogRow>();
    for (const row of catalog) map.set(row.code, row);
    return map;
  }, [catalog]);

  async function loadData() {
    setIsLoading(true);
    onError(null);

    const [catalogRes, medicalRes, coursesRes, equipmentRes] = await Promise.all([
      supabase.from("course_catalog").select("id, code, name").order("name"),
      supabase
        .from("medical_checks")
        .select("id, check_date, expiry_date, notes")
        .eq("volunteer_id", volunteerId)
        .order("check_date", { ascending: false }),
      supabase
        .from("volunteer_courses")
        .select("id, course_id, completion_date, passed")
        .eq("volunteer_id", volunteerId),
      supabase
        .from("equipment_issues")
        .select("id, item_code, size_value")
        .eq("volunteer_id", volunteerId),
    ]);

    if (catalogRes.error) {
      onError(catalogRes.error.message);
      setIsLoading(false);
      return;
    }
    if (medicalRes.error) {
      onError(medicalRes.error.message);
      setIsLoading(false);
      return;
    }
    if (coursesRes.error) {
      onError(coursesRes.error.message);
      setIsLoading(false);
      return;
    }
    if (equipmentRes.error) {
      onError(equipmentRes.error.message);
      setIsLoading(false);
      return;
    }

    const catalogRows = (catalogRes.data ?? []) as CourseCatalogRow[];
    const courseRows = (coursesRes.data ?? []) as VolunteerCourseRow[];
    const equipmentRows = (equipmentRes.data ?? []) as EquipmentRow[];

    setCatalog(catalogRows);
    setMedicalChecks((medicalRes.data ?? []) as MedicalCheck[]);
    setVolunteerCourses(courseRows);
    setEquipment(equipmentRows);

    const dates: Record<string, string> = {};
    for (const def of COURSE_DEFINITIONS) {
      const cat = catalogRows.find((c) => c.code === def.code);
      if (!cat) continue;
      const vc = courseRows.find((r) => r.course_id === cat.id);
      if (vc?.completion_date) dates[def.code] = vc.completion_date;
    }
    setCourseDates(dates);

    const sizes: Record<string, string> = {};
    for (const def of EQUIPMENT_DEFINITIONS) {
      const row = equipmentRows.find((e) => e.item_code === def.code);
      if (row?.size_value) sizes[def.code] = row.size_value;
    }
    setEquipmentSizes(sizes);

    setIsLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volunteerId]);

  const handleAddMedical = async (event: FormEvent) => {
    event.preventDefault();
    if (!newMedicalDate) return;
    setIsSaving(true);
    onError(null);

    const expiryDate = medicalExpiryFromCheckDate(newMedicalDate);
    const { error } = await supabase.from("medical_checks").insert({
      volunteer_id: volunteerId,
      check_date: newMedicalDate,
      expiry_date: expiryDate,
    });

    if (error) onError(error.message);
    else {
      setNewMedicalDate("");
      await loadData();
    }
    setIsSaving(false);
  };

  const handleDeleteMedical = async (id: string) => {
    setIsSaving(true);
    onError(null);
    const { error } = await supabase.from("medical_checks").delete().eq("id", id);
    if (error) onError(error.message);
    else await loadData();
    setIsSaving(false);
  };

  const handleSaveCourses = async () => {
    setIsSaving(true);
    onError(null);

    for (const def of COURSE_DEFINITIONS) {
      const cat = catalogByCode.get(def.code);
      if (!cat) continue;

      const dateValue = courseDates[def.code]?.trim() ?? "";
      const existing = volunteerCourses.find((vc) => vc.course_id === cat.id);

      if (!dateValue) {
        if (existing) {
          const { error } = await supabase
            .from("volunteer_courses")
            .delete()
            .eq("id", existing.id);
          if (error) {
            onError(error.message);
            setIsSaving(false);
            return;
          }
        }
        continue;
      }

      const payload = {
        volunteer_id: volunteerId,
        course_id: cat.id,
        completion_date: dateValue,
        passed: true,
      };

      const { error } = existing
        ? await supabase
            .from("volunteer_courses")
            .update({
              completion_date: dateValue,
              passed: true,
            })
            .eq("id", existing.id)
        : await supabase.from("volunteer_courses").insert(payload);

      if (error) {
        onError(error.message);
        setIsSaving(false);
        return;
      }
    }

    await loadData();
    setIsSaving(false);
  };

  const handleSaveEquipment = async () => {
    setIsSaving(true);
    onError(null);

    for (const def of EQUIPMENT_DEFINITIONS) {
      const size = equipmentSizes[def.code]?.trim().toUpperCase() ?? "";
      const existing = equipment.find((e) => e.item_code === def.code);

      if (!size) {
        if (existing) {
          const { error } = await supabase
            .from("equipment_issues")
            .delete()
            .eq("id", existing.id);
          if (error) {
            onError(error.message);
            setIsSaving(false);
            return;
          }
        }
        continue;
      }

      const payload = {
        volunteer_id: volunteerId,
        item_code: def.code,
        size_value: size,
        quantity: 1,
      };

      const { error } = existing
        ? await supabase
            .from("equipment_issues")
            .update({ size_value: size, quantity: 1 })
            .eq("id", existing.id)
        : await supabase.from("equipment_issues").insert(payload);

      if (error) {
        onError(error.message);
        setIsSaving(false);
        return;
      }
    }

    await loadData();
    setIsSaving(false);
  };

  const tabClass = (tab: DetailTab) =>
    `rounded-md px-3 py-1.5 text-sm font-bold transition ${
      activeTab === tab
        ? "bg-blue-600 text-white"
        : "bg-white/80 text-slate-700 hover:bg-slate-100"
    }`;

  if (isLoading) {
    return <p className="text-sm text-slate-600">Caricamento visite, corsi e dotazioni...</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={tabClass("visite")} onClick={() => setActiveTab("visite")}>
          VISITE MEDICHE
        </button>
        <button type="button" className={tabClass("corsi")} onClick={() => setActiveTab("corsi")}>
          CORSI (DATA)
        </button>
        <button
          type="button"
          className={tabClass("dotazioni")}
          onClick={() => setActiveTab("dotazioni")}
        >
          DOTAZIONI
        </button>
      </div>

      {activeTab === "visite" ? (
        <div className="space-y-3">
          <form onSubmit={handleAddMedical} className="flex flex-wrap items-end gap-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-700">
                Data visita medica
              </span>
              <input
                type="date"
                value={newMedicalDate}
                onChange={(e) => setNewMedicalDate(e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            {newMedicalDate ? (
              <p className="pb-2 text-xs font-semibold text-emerald-800">
                Scadenza automatica (+12 mesi):{" "}
                <span
                  className={
                    ["warning", "expired"].includes(
                      getMedicalExpiryStatus(medicalExpiryFromCheckDate(newMedicalDate))
                    )
                      ? "font-bold text-red-700"
                      : ""
                  }
                >
                  {formatItDate(medicalExpiryFromCheckDate(newMedicalDate))}
                </span>
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-70"
            >
              Aggiungi
            </button>
          </form>
          <p className="text-xs text-slate-600">
            Scadenza automatica: <strong>giorno visita + 12 mesi</strong>. La data scadenza diventa{" "}
            <strong className="text-red-700">rossa</strong> negli ultimi{" "}
            <strong>15 giorni</strong> prima della scadenza (e resta rossa se scaduta).
          </p>
          <ul className="space-y-2">
            {medicalChecks.length === 0 ? (
              <li className="text-sm text-slate-600">Nessuna visita registrata.</li>
            ) : (
              medicalChecks.map((check) => {
                const expiry =
                  check.expiry_date ?? medicalExpiryFromCheckDate(check.check_date);
                const status = getMedicalExpiryStatus(expiry);
                const expiryIsRed = status === "warning" || status === "expired";
                return (
                <li
                  key={check.id}
                  className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
                    status === "expired"
                      ? "border-red-400 bg-red-50"
                      : status === "warning"
                        ? "border-red-200 bg-red-50/60"
                        : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <span>
                    Visita: <strong>{formatItDate(check.check_date)}</strong>
                    {" | "}
                    Scadenza:{" "}
                    <strong
                      className={expiryIsRed ? "text-red-700" : "text-slate-900"}
                    >
                      {formatItDate(expiry)}
                    </strong>
                    {status === "expired" ? (
                      <span className="ml-2 font-bold text-red-700">SCADUTA</span>
                    ) : status === "warning" ? (
                      <span className="ml-2 font-bold text-red-700">
                        IN SCADENZA (≤15 GG)
                      </span>
                    ) : (
                      <span className="ml-2 font-semibold text-emerald-700">VALIDA</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteMedical(check.id)}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Elimina
                  </button>
                </li>
              );
              })
            )}
          </ul>
        </div>
      ) : null}

      {activeTab === "corsi" ? (
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            Inserisci la <strong>data di completamento</strong> per ogni corso. Lascia vuoto se non
            svolto.
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {COURSE_DEFINITIONS.map((def) => {
              const cat = catalogByCode.get(def.code);
              if (!cat) {
                return (
                  <p key={def.code} className="text-xs text-amber-700">
                    {def.name}: esegui <code>seed_course_catalog.sql</code> su Supabase
                  </p>
                );
              }
              return (
                <label key={def.code} className="block rounded-md border border-slate-200 bg-slate-50 p-2">
                  <span className="mb-1 block text-xs font-bold text-slate-800">{def.name}</span>
                  <input
                    type="date"
                    value={courseDates[def.code] ?? ""}
                    onChange={(e) =>
                      setCourseDates((current) => ({
                        ...current,
                        [def.code]: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  />
                </label>
              );
            })}
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveCourses}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {isSaving ? "Salvataggio..." : "Salva corsi"}
          </button>
        </div>
      ) : null}

      {activeTab === "dotazioni" ? (
        <div className="space-y-3">
          <div className="grid gap-2 md:grid-cols-2">
            {EQUIPMENT_DEFINITIONS.map((def) => (
              <label key={def.code} className="block rounded-md border border-slate-200 bg-slate-50 p-2">
                <span className="mb-1 block text-xs font-bold text-slate-800">{def.label}</span>
                <input
                  type="text"
                  placeholder="Taglia (es. M, L, XL, SI)"
                  value={equipmentSizes[def.code] ?? ""}
                  onChange={(e) =>
                    setEquipmentSizes((current) => ({
                      ...current,
                      [def.code]: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm uppercase"
                />
              </label>
            ))}
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveEquipment}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {isSaving ? "Salvataggio..." : "Salva dotazioni"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
