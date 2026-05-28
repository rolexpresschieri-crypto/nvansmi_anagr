import type { VolunteerFormValues } from "@/lib/volunteerTypes";
import { ansmiOfficeOptions, nvOfficeOptions } from "@/lib/volunteerTypes";

type Props = {
  form: VolunteerFormValues;
  onChange: (field: keyof VolunteerFormValues, value: string) => void;
};

const fieldClass =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500";

export default function VolunteerExtendedFormFields({ form, onChange }: Props) {
  return (
    <>
      <p className="md:col-span-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        Sedi e tessere
      </p>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate-700">Sede ANSMI</span>
        <select
          value={form.ansmi_office}
          onChange={(e) => onChange("ansmi_office", e.target.value)}
          className={fieldClass}
        >
          <option value="">—</option>
          {ansmiOfficeOptions.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate-700">Sede NV ANSMI</span>
        <select
          value={form.nv_office}
          onChange={(e) => onChange("nv_office", e.target.value)}
          className={fieldClass}
        >
          <option value="">—</option>
          {nvOfficeOptions.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate-700">Assicurazione PC</span>
        <input
          type="text"
          value={form.pc_insurance}
          onChange={(e) => onChange("pc_insurance", e.target.value)}
          className={fieldClass}
          placeholder="es. X"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate-700">N° tessera ANSMI</span>
        <input
          type="text"
          value={form.ansmi_card_number}
          onChange={(e) => onChange("ansmi_card_number", e.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate-700">N° tessera NV ANSMI</span>
        <input
          type="text"
          value={form.nv_card_number}
          onChange={(e) => onChange("nv_card_number", e.target.value)}
          className={fieldClass}
        />
      </label>

      <p className="md:col-span-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        Residenza
      </p>
      <label className="block md:col-span-2">
        <span className="mb-1 block text-xs font-semibold text-slate-700">Indirizzo</span>
        <input
          type="text"
          value={form.residence_address}
          onChange={(e) => onChange("residence_address", e.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate-700">CAP</span>
        <input
          type="text"
          value={form.residence_zip}
          onChange={(e) => onChange("residence_zip", e.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate-700">Città</span>
        <input
          type="text"
          value={form.residence_city}
          onChange={(e) => onChange("residence_city", e.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate-700">Provincia</span>
        <input
          type="text"
          value={form.residence_province}
          onChange={(e) => onChange("residence_province", e.target.value)}
          className={fieldClass}
          maxLength={2}
        />
      </label>

      <p className="md:col-span-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        Nascita
      </p>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate-700">Luogo di nascita</span>
        <input
          type="text"
          value={form.birth_place}
          onChange={(e) => onChange("birth_place", e.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate-700">Prov. nascita</span>
        <input
          type="text"
          value={form.birth_province}
          onChange={(e) => onChange("birth_province", e.target.value)}
          className={fieldClass}
          maxLength={2}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate-700">Data di nascita</span>
        <input
          type="date"
          value={form.birth_date}
          onChange={(e) => onChange("birth_date", e.target.value)}
          className={fieldClass}
        />
      </label>
    </>
  );
}
