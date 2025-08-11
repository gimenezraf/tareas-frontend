import StepCard from "./StepCard";

export default function WorkflowCanvas({ pasos, seleccionado, onSelect }) {
  return (
    <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-slate-800 font-semibold">Etapas</h3>
      </div>
      <div className="space-y-3">
        {pasos.map((p) => (
          <StepCard
            key={p.id}
            paso={p}
            active={seleccionado?.id === p.id}
            onClick={() => onSelect(p)}
          />
        ))}
      </div>
    </div>
  );
}