export default function WorkflowTopbar({ tarea, onNewStep }) {
  return (
    <header className="w-full bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500">Asunto</div>
          <div className="text-lg font-semibold">{tarea?.asunto || "Sin asunto"}</div>
          <div className="text-xs text-slate-500">{tarea?.cliente || ""}</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded-md border">Compartir</button>
          <button className="px-3 py-2 rounded-md border">Exportar</button>
          <button className="px-3 py-2 rounded-md bg-indigo-600 text-white" onClick={onNewStep}>
            Nuevo paso
          </button>
        </div>
      </div>
    </header>
  );
}