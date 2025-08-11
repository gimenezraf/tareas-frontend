export default function WorkflowSidebar({ onApplyTemplate }) {
  const templates = {
    ordinario: [
      { etapa: "Demanda" },
      { etapa: "Contestación de demanda" },
      { etapa: "Audiencia preliminar" },
    ],
    laboral: [
      { etapa: "Demanda" },
      { etapa: "Contestación de demanda" },
      { etapa: "Audiencia única" },
    ],
    monitorio: [
      { etapa: "Demanda" },
      { etapa: "Presentación de excepciones" },
    ],
    penal: [
      { etapa: "Audiencia de formalización" },
      { etapa: "Medidas cautelares" },
    ],
  };

  return (
    <aside className="w-72 bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
      <h4 className="font-semibold mb-2">Plantillas</h4>
      <div className="space-y-2">
        {Object.entries(templates).map(([k, v]) => (
          <button
            key={k}
            className="w-full text-left px-3 py-2 rounded-md border hover:bg-slate-50"
            onClick={() => onApplyTemplate(v)}
          >
            {k.toUpperCase()}
          </button>
        ))}
      </div>
    </aside>
  );
}