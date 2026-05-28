import Link from "next/link";

export default function ExportPage() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="app-card rounded-xl p-4">
          <h1 className="text-2xl font-semibold text-slate-900">Export e Report</h1>
          <p className="mt-1 text-sm text-slate-600">
            Pagina dedicata ai report. Qui aggiungeremo export CSV/PDF e report personalizzati.
          </p>
          <div className="mt-3">
            <Link
              href="/"
              className="inline-flex rounded-md border border-slate-300 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Torna all&apos;anagrafica
            </Link>
          </div>
        </header>

        <section className="app-card rounded-xl p-4">
          <h2 className="text-lg font-semibold text-slate-900">Roadmap report</h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-700">
            <li>Export elenco soci filtrato (attivi, squadra, tipo socio)</li>
            <li>Report scadenze visite mediche e corsi</li>
            <li>Report cinofilo (cani per squadra, brevetti, vaccinazioni)</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
