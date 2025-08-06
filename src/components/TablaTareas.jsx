import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

function formatearFecha(fecha) {
  if (!fecha) return "-";
  const d = new Date(fecha);
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const anio = d.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

function DiasBadge({ dias }) {
  if (dias === null || dias === undefined) return "-";
  let style = "bg-emerald-100 text-emerald-700";
  if (dias < 0) style = "bg-red-100 text-red-700";
  else if (dias <= 7) style = "bg-yellow-100 text-yellow-700";

  const label = dias < 0 ? `${Math.abs(dias)} días vencido` : dias === 0 ? "Hoy" : `${dias} días`;
  return <Badge className={style}>{label}</Badge>;
}

function JudicialBadge({ es_judicial }) {
  return (
    <Badge className={es_judicial ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}>
      {es_judicial ? "Judicial" : "No Judicial"}
    </Badge>
  );
}

export default function TablaTareas({ onEditarTarea }) {
  const [tareas, setTareas] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [historiales, setHistoriales] = useState({});
  const [newEntry, setNewEntry] = useState("");

  const [eventoEditandoId, setEventoEditandoId] = useState(null);
  const [formularioEdicionEvento, setFormularioEdicionEvento] = useState({
    descripcion: "",
    fecha_registro: "",
    requiere_retiro_copias: false,
  });

  useEffect(() => {
    fetch("/api/tareas")
      .then((res) => res.json())
      .then(setTareas);
  }, []);

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    const res = await fetch(`/api/tareas/${id}/historial`);
    const data = await res.json();
    setHistoriales((prev) => ({ ...prev, [id]: data }));
    setExpandedId(id);
  };

  const handleAddHistorial = async (tareaId) => {
    if (!newEntry.trim()) return;
    await fetch(`/api/tareas/${tareaId}/historial`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        descripcion: newEntry,
        fecha_registro: new Date().toISOString().split("T")[0],
      }),
    });
    setNewEntry("");
    toggleExpand(tareaId); // vuelve a cargar
  };

  const guardarEdicionEvento = async (eventoId) => {
    try {
      await fetch(`/api/historial/${eventoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formularioEdicionEvento),
      });
      setEventoEditandoId(null);
      setFormularioEdicionEvento({ descripcion: "", fecha_registro: "", requiere_retiro_copias: false });
      // recargar historial
      toggleExpand(expandedId);
    } catch (error) {
      console.error("Error al guardar evento:", error);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {tareas.map((tarea) => (
        <Card key={tarea.id} className="p-4 rounded-xl shadow-sm border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                {formatearFecha(tarea.fecha_registro)}
              </p>
              <h3 className="text-lg font-semibold">{tarea.cliente}</h3>
              <p>{tarea.tarea}</p>
              {tarea.es_judicial && (
                <div className="text-sm text-gray-600 mt-1">
                  {tarea.juzgado && <p><strong>Juzgado:</strong> {tarea.juzgado}</p>}
                  {tarea.iue && <p><strong>IUE:</strong> {tarea.iue}</p>}
                  {tarea.tipo_proceso === "penal" && tarea.nunc && (
                    <p><strong>NUNC:</strong> {tarea.nunc}</p>
                  )}
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <DiasBadge dias={tarea.dias_restantes} />
                <JudicialBadge es_judicial={tarea.es_judicial} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => toggleExpand(tarea.id)}>
                {expandedId === tarea.id ? "Ocultar historial" : "Ver historial"}
              </Button>
              <Button variant="secondary" onClick={() => onEditarTarea(tarea)}>Editar</Button>
            </div>
          </div>

          {expandedId === tarea.id && (
            <div className="mt-4 border-t pt-4 space-y-2">
              <h4 className="font-medium">Historial</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {(historiales[tarea.id] || []).map((h, i) => (
                  <li key={i}>
                    {eventoEditandoId === h.id ? (
                      <div className="space-y-2">
                        <Input
                          value={formularioEdicionEvento.descripcion}
                          onChange={(e) =>
                            setFormularioEdicionEvento({ ...formularioEdicionEvento, descripcion: e.target.value })
                          }
                        />
                        <Input
                          type="date"
                          value={formularioEdicionEvento.fecha_registro}
                          onChange={(e) =>
                            setFormularioEdicionEvento({ ...formularioEdicionEvento, fecha_registro: e.target.value })
                          }
                        />
                        <label className="text-sm flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formularioEdicionEvento.requiere_retiro_copias}
                            onChange={(e) =>
                              setFormularioEdicionEvento({
                                ...formularioEdicionEvento,
                                requiere_retiro_copias: e.target.checked,
                              })
                            }
                          />
                          Requiere retiro de copias
                        </label>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => guardarEdicionEvento(h.id)}>Guardar</Button>
                          <Button variant="outline" size="sm" onClick={() => setEventoEditandoId(null)}>Cancelar</Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <strong>{formatearFecha(h.fecha_registro)}:</strong> {h.descripcion}
                        {h.requiere_retiro_copias && (
                          <span className="ml-2 text-xs text-gray-400">🗂 Requiere retiro de copias</span>
                        )}
                        <Button variant="link" size="sm" onClick={() => {
                          setEventoEditandoId(h.id);
                          setFormularioEdicionEvento({
                            descripcion: h.descripcion,
                            fecha_registro: h.fecha_registro,
                            requiere_retiro_copias: h.requiere_retiro_copias || false,
                          });
                        }}>
                          Editar
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
                {historiales[tarea.id]?.length === 0 && <li className="italic">Sin entradas.</li>}
              </ul>
              <div className="flex gap-2 pt-2">
                <Input
                  placeholder="Nueva entrada..."
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                />
                <Button onClick={() => handleAddHistorial(tarea.id)}>Agregar</Button>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}