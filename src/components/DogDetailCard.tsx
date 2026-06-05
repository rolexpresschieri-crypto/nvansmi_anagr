import type { DogRecord } from "@/lib/dogTypes";
import { formatDogBool, formatDogDate } from "@/lib/dogTypes";

type FieldItem = { label: string; value: string };

function collectFields(items: FieldItem[]): FieldItem[] {
  return items.filter((item) => item.value.trim().length > 0);
}

function FieldGrid({ title, fields }: { title: string; fields: FieldItem[] }) {
  const visible = collectFields(fields);
  if (visible.length === 0) return null;

  return (
    <div className="mt-3">
      <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-600">{title}</p>
      <div className="grid gap-1.5 text-sm text-slate-700 sm:grid-cols-2">
        {visible.map((field) => (
          <p key={field.label}>
            <span className="font-semibold">{field.label}:</span> {field.value}
          </p>
        ))}
      </div>
    </div>
  );
}

type Props = {
  dog: DogRecord;
  onEdit?: () => void;
};

export default function DogDetailCard({ dog, onEdit }: Props) {
  const hasBrevetti =
    collectFields([
      { label: "Libretto ENCI", value: dog.enci_booklet_number ?? "" },
      { label: "Brevetto ENCI superficie", value: dog.enci_sup_license ?? "" },
      { label: "Brevetto ENCI macerie", value: dog.enci_mac_license ?? "" },
      { label: "Esame ANPAS superficie", value: dog.anpas_sup_exam_number ?? "" },
      { label: "Esame ANPAS macerie", value: dog.anpas_mac_exam_number ?? "" },
    ]).length > 0;

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-medium text-slate-900">{dog.name ?? "SENZA NOME"}</p>
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="rounded-md border border-blue-300 bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800 hover:bg-blue-100"
          >
            MODIFICA BREVETTI
          </button>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-slate-700">
        Razza: {dog.breed ?? "-"} | Sesso: {dog.sex ?? "-"} | Microchip:{" "}
        {dog.microchip ?? "-"}
      </p>

      <FieldGrid
        title="Anagrafica"
        fields={[
          { label: "LOI", value: dog.loi_code ?? "" },
          { label: "Pedigree", value: dog.pedigree_name ?? "" },
          { label: "Data nascita", value: formatDogDate(dog.birth_date) },
        ]}
      />

      <FieldGrid
        title="Brevetti ENCI"
        fields={[
          { label: "N° libretto", value: dog.enci_booklet_number ?? "" },
          {
            label: "Esame propedeutico",
            value: formatDogDate(dog.enci_propedeutic_exam_date),
          },
          { label: "N° brevetto superficie", value: dog.enci_sup_license ?? "" },
          {
            label: "Data brevetto superficie",
            value: formatDogDate(dog.enci_sup_exam_date),
          },
          { label: "N° brevetto macerie", value: dog.enci_mac_license ?? "" },
          {
            label: "Data brevetto macerie",
            value: formatDogDate(dog.enci_mac_exam_date),
          },
          { label: "Protocollo addestratore", value: dog.enci_trainer_protocol ?? "" },
          {
            label: "Data brevetto addestratore",
            value: formatDogDate(dog.enci_trainer_license_date),
          },
          { label: "Corso S2", value: formatDogBool(dog.enci_s2_completed) },
          { label: "Data corso S2", value: formatDogDate(dog.enci_s2_date) },
        ]}
      />

      <FieldGrid
        title="Brevetti ANPAS"
        fields={[
          { label: "N° esame superficie", value: dog.anpas_sup_exam_number ?? "" },
          {
            label: "Data esame superficie",
            value: formatDogDate(dog.anpas_sup_exam_date),
          },
          {
            label: "Ultimo rinnovo superficie",
            value: formatDogDate(dog.anpas_sup_last_renewal_date),
          },
          { label: "N° esame macerie", value: dog.anpas_mac_exam_number ?? "" },
          {
            label: "Data esame macerie",
            value: formatDogDate(dog.anpas_mac_exam_date),
          },
          { label: "Addestratore ANPAS", value: formatDogBool(dog.anpas_trainer) },
          { label: "Protocollo addestratore", value: dog.anpas_trainer_protocol ?? "" },
          {
            label: "Data brevetto addestratore",
            value: formatDogDate(dog.anpas_trainer_license_date),
          },
        ]}
      />

      <FieldGrid
        title="Sanità"
        fields={[
          { label: "Certificato medico", value: dog.medical_certificate ?? "" },
          { label: "Vaccinazioni", value: dog.vaccinations ?? "" },
        ]}
      />

      {!hasBrevetti && onEdit ? (
        <p className="mt-3 text-xs text-slate-600">
          Nessun brevetto registrato. Usa <strong>MODIFICA BREVETTI</strong> per inserire numeri e
          date.
        </p>
      ) : null}
    </div>
  );
}
