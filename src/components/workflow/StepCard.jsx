export default function StepCard({ paso, active, onClick }) {
  const f = (d) => {
    if (!d) return "-";
    const x = new Date(d);
    return `${String(x.getDate()).padStart(2, "0")}/${String(x.getMonth() + 1).padStart(2, "0")}/${x.getFullYear()}`;
  };
  const vencido = paso.fecha_limite && new Date(paso.fecha_limite) < new Date();

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-xl p-4 shadow-sm border ${
        active ? "border-indigo-500" : "border-slate-200"
      } hover:shadow-md transition`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold">{paso.descripcion}</div>
          <div className="text-xs text-slate-500 mt-1">Fecha: {f(paso.fecha)}</div>
          {paso.requiere_retiro_copias && (
            <div className="text-xs mt-1">🗂 Requiere retiro de copias</div>
          )}
        </div>
        {paso.fecha_limite && (
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              vencido ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
            }`}
          >
            Límite: {f(paso.fecha_limite)}
          </span>
        )}
      </div>
    </button>
  );
}