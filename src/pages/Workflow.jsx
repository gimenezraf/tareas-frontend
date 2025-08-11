import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import WorkflowTopbar from "../components/workflow/WorkflowTopbar";
import WorkflowSidebar from "../components/workflow/WorkflowSidebar";
import WorkflowCanvas from "../components/workflow/WorkflowCanvas";
import WorkflowInspector from "../components/workflow/WorkflowInspector";

export default function Workflow() {
  const { tareaId } = useParams();
  const [tarea, setTarea] = useState(null);
  const [pasos, setPasos] = useState([]);      
  const [seleccionado, setSeleccionado] = useState(null);

  const cargar = useCallback(async () => {
    try {
      // Traer todas las tareas y seleccionar la actual
      const tareasRes = await fetch('/api/tareas');
      if (!tareasRes.ok) throw new Error(`GET /api/tareas ${tareasRes.status}`);
      const lista = await tareasRes.json();
      const t = Array.isArray(lista)
        ? lista.find(x => String(x.id) === String(tareaId))
        : null;
      setTarea(t || null);

      // Traer historial de la tarea
      const histRes = await fetch(`/api/tareas/${tareaId}/historial`);
      const h = histRes.ok ? await histRes.json() : [];
      const ordenados = Array.isArray(h)
        ? h.sort((a, b) => new Date(a.fecha_registro) - new Date(b.fecha_registro))
        : [];
      setPasos(ordenados);
      if (ordenados[0]) setSeleccionado(ordenados[0]);
    } catch (err) {
      console.error('Error cargando workflow:', err);
      setPasos([]);
      setSeleccionado(null);
    }
  }, [tareaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const actualizarPaso = async (id, data) => {
    try {
      const resp = await fetch(`/api/historial/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!resp.ok) {
        alert('La edición de pasos aún no está disponible en el backend.');
        return;
      }
      await cargar();
    } catch (e) {
      console.error('Error actualizando paso:', e);
      alert('No se pudo actualizar el paso.');
    }
  };

  const crearPaso = async (data) => {
    await fetch(`/api/tareas/${tareaId}/historial`, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(data),
    });
    await cargar();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <WorkflowTopbar
        tarea={tarea}
        onNewStep={() => crearPaso({
          descripcion:"Nueva etapa",
          fecha_registro: new Date().toISOString().slice(0,10),
        })}
      />
      <div className="flex flex-1 gap-4 p-4">
        <WorkflowSidebar
          onApplyTemplate={async (plantilla) => {
            for (const p of plantilla) {
              await crearPaso({ descripcion: p.etapa, fecha_registro: new Date().toISOString().slice(0,10) });
            }
          }}
        />
        <WorkflowCanvas pasos={pasos} seleccionado={seleccionado} onSelect={setSeleccionado} />
        <WorkflowInspector paso={seleccionado} onChange={(patch)=> actualizarPaso(seleccionado.id, patch)} />
      </div>
    </div>
  );
}