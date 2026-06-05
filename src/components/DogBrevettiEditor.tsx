"use client";

import { FormEvent, useState } from "react";
import {
  dogFormFromRecord,
  dogPayloadFromForm,
  emptyDogForm,
  type DogFormValues,
  type DogRecord,
} from "@/lib/dogTypes";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  dog: DogRecord | null;
  volunteerId: string;
  onSaved: () => void;
  onCancel: () => void;
  onError: (message: string | null) => void;
};

const fieldClass =
  "w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm uppercase outline-none focus:border-blue-500";

const dateClass =
  "w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-blue-500";

function SectionTitle({ children }: { children: string }) {
  return (
    <p className="md:col-span-2 text-xs font-bold uppercase tracking-wide text-slate-500">
      {children}
    </p>
  );
}

function BoolSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-700">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={dateClass}>
        <option value="">—</option>
        <option value="true">SÌ</option>
        <option value="false">NO</option>
      </select>
    </label>
  );
}

export default function DogBrevettiEditor({
  dog,
  volunteerId,
  onSaved,
  onCancel,
  onError,
}: Props) {
  const [form, setForm] = useState<DogFormValues>(
    dog ? dogFormFromRecord(dog) : emptyDogForm()
  );
  const [isSaving, setIsSaving] = useState(false);

  const setField = (field: keyof DogFormValues, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    onError(null);

    const payload = dogPayloadFromForm(form);
    if (!payload.name) {
      onError("Il nome del cane è obbligatorio.");
      setIsSaving(false);
      return;
    }

    const { error } = dog
      ? await supabase.from("dogs").update(payload).eq("id", dog.id)
      : await supabase.from("dogs").insert({ ...payload, volunteer_id: volunteerId });

    if (error) {
      onError(error.message);
      setIsSaving(false);
      return;
    }

    onSaved();
    setIsSaving(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md border border-blue-200 bg-blue-50/40 p-3 space-y-2"
    >
      <p className="text-sm font-semibold text-slate-900">
        {dog ? "Modifica cane e brevetti" : "Nuovo cane"}
      </p>

      <div className="grid gap-2 md:grid-cols-2">
        <SectionTitle>Anagrafica cane</SectionTitle>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">Nome *</span>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setField("name", e.target.value.toUpperCase())}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">Razza</span>
          <input
            type="text"
            value={form.breed}
            onChange={(e) => setField("breed", e.target.value.toUpperCase())}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">Sesso</span>
          <select
            value={form.sex}
            onChange={(e) => setField("sex", e.target.value)}
            className={dateClass}
          >
            <option value="">—</option>
            <option value="M">M</option>
            <option value="F">F</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">Microchip</span>
          <input
            type="text"
            value={form.microchip}
            onChange={(e) => setField("microchip", e.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">LOI</span>
          <input
            type="text"
            value={form.loi_code}
            onChange={(e) => setField("loi_code", e.target.value.toUpperCase())}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">Pedigree</span>
          <input
            type="text"
            value={form.pedigree_name}
            onChange={(e) => setField("pedigree_name", e.target.value.toUpperCase())}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">Data nascita</span>
          <input
            type="date"
            value={form.birth_date}
            onChange={(e) => setField("birth_date", e.target.value)}
            className={dateClass}
          />
        </label>

        <SectionTitle>Brevetti ENCI</SectionTitle>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">N° libretto</span>
          <input
            type="text"
            value={form.enci_booklet_number}
            onChange={(e) => setField("enci_booklet_number", e.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">
            Data esame propedeutico
          </span>
          <input
            type="date"
            value={form.enci_propedeutic_exam_date}
            onChange={(e) => setField("enci_propedeutic_exam_date", e.target.value)}
            className={dateClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">
            N° brevetto superficie
          </span>
          <input
            type="text"
            value={form.enci_sup_license}
            onChange={(e) => setField("enci_sup_license", e.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">
            Data brevetto superficie
          </span>
          <input
            type="date"
            value={form.enci_sup_exam_date}
            onChange={(e) => setField("enci_sup_exam_date", e.target.value)}
            className={dateClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">
            N° brevetto macerie
          </span>
          <input
            type="text"
            value={form.enci_mac_license}
            onChange={(e) => setField("enci_mac_license", e.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">
            Data brevetto macerie
          </span>
          <input
            type="date"
            value={form.enci_mac_exam_date}
            onChange={(e) => setField("enci_mac_exam_date", e.target.value)}
            className={dateClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">
            Protocollo addestratore
          </span>
          <input
            type="text"
            value={form.enci_trainer_protocol}
            onChange={(e) => setField("enci_trainer_protocol", e.target.value.toUpperCase())}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">
            Data brevetto addestratore
          </span>
          <input
            type="date"
            value={form.enci_trainer_license_date}
            onChange={(e) => setField("enci_trainer_license_date", e.target.value)}
            className={dateClass}
          />
        </label>
        <BoolSelect
          label="Corso S2"
          value={form.enci_s2_completed}
          onChange={(v) => setField("enci_s2_completed", v)}
        />
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">Data corso S2</span>
          <input
            type="date"
            value={form.enci_s2_date}
            onChange={(e) => setField("enci_s2_date", e.target.value)}
            className={dateClass}
          />
        </label>

        <SectionTitle>Brevetti ANPAS</SectionTitle>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">
            N° esame superficie
          </span>
          <input
            type="text"
            value={form.anpas_sup_exam_number}
            onChange={(e) => setField("anpas_sup_exam_number", e.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">
            Data esame superficie
          </span>
          <input
            type="date"
            value={form.anpas_sup_exam_date}
            onChange={(e) => setField("anpas_sup_exam_date", e.target.value)}
            className={dateClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">
            Ultimo rinnovo superficie
          </span>
          <input
            type="date"
            value={form.anpas_sup_last_renewal_date}
            onChange={(e) => setField("anpas_sup_last_renewal_date", e.target.value)}
            className={dateClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">N° esame macerie</span>
          <input
            type="text"
            value={form.anpas_mac_exam_number}
            onChange={(e) => setField("anpas_mac_exam_number", e.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">
            Data esame macerie
          </span>
          <input
            type="date"
            value={form.anpas_mac_exam_date}
            onChange={(e) => setField("anpas_mac_exam_date", e.target.value)}
            className={dateClass}
          />
        </label>
        <BoolSelect
          label="Addestratore ANPAS"
          value={form.anpas_trainer}
          onChange={(v) => setField("anpas_trainer", v)}
        />
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">
            Protocollo addestratore
          </span>
          <input
            type="text"
            value={form.anpas_trainer_protocol}
            onChange={(e) => setField("anpas_trainer_protocol", e.target.value.toUpperCase())}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">
            Data brevetto addestratore
          </span>
          <input
            type="date"
            value={form.anpas_trainer_license_date}
            onChange={(e) => setField("anpas_trainer_license_date", e.target.value)}
            className={dateClass}
          />
        </label>

        <SectionTitle>Sanità</SectionTitle>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">
            Certificato medico
          </span>
          <input
            type="text"
            value={form.medical_certificate}
            onChange={(e) => setField("medical_certificate", e.target.value.toUpperCase())}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">Vaccinazioni</span>
          <input
            type="text"
            value={form.vaccinations}
            onChange={(e) => setField("vaccinations", e.target.value.toUpperCase())}
            className={fieldClass}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-70"
        >
          {isSaving ? "Salvataggio..." : "Salva cane"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Annulla
        </button>
      </div>
    </form>
  );
}
