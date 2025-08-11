import { useEffect, useState } from "react";

export default function WorkflowInspector({ paso, onChange }) {
  const [draft, setDraft] = useState(null);

useEffect(() => {
  setDraft(paso || null);
}, [paso]);

  if (!draft) return <aside className="w-80" />;

  const fISO = (s) => (s ? s.slice(0, 10) : "");

  return (
    <aside className="w-80 bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
      <h4 className="font-semibold mb-3">Propiedades</h4>

      <label className="text-xs text-slate-600">Descripción</label>
      <input
        className="w-full border rounded-md px-3 py-2 mb-3"
        value={draft.descripcion || ""}
        onChange={(e) => setDraft({ ...draft, descripcion: e.target.value })}
      />

      <label className="text-xs text-slate-600">Fecha del evento</label>
      <input
        type="date"
        className="w-full border rounded-md px-3 py-2 mb-3"
        value={fISO(draft.fecha)}
        onChange={(e) => setDraft({ ...draft, fecha: e.target.value })}
      />

      <label className="text-xs text-slate-600">Fecha límite</label>
      <input
        type="date"
        className="w-full border rounded-md px-3 py-2 mb-3"
        value={fISO(draft.fecha_limite)}
        onChange={(e) => setDraft({ ...draft, fecha_limite: e.target.value })}
      />

      <label className="inline-flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={!!draft.requiere_retiro_copias}
          onChange={(e) =>
            setDraft({ ...draft, requiere_retiro_copias: e.target.checked })
          }
        />
        <span className="text-sm">Requiere retiro de copias</span>
      </label>

      <div className="flex gap-2">
        <button
          className="px-3 py-2 rounded-md bg-indigo-600 text-white"
          onClick={() =>
            onChange({
              descripcion: draft.descripcion,
              fecha: draft.fecha,
              fecha_limite: draft.fecha_limite,
              requiere_retiro_copias: !!draft.requiere_retiro_copias,
            })
          }
        >
          Guardar
        </button>
        <button
          className="px-3 py-2 rounded-md border"
          onClick={() => setDraft(paso)}
        >
          Cancelar
        </button>
      </div>
    </aside>
  );
}