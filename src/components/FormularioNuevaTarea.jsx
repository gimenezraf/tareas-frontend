import { useState } from "react";

export default function FormularioNuevaTarea({ onTareaCreada }) {
  const [tipoTarea, setTipoTarea] = useState("");
  const [tipoProceso, setTipoProceso] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [cliente, setCliente] = useState("");
  const [asunto, setAsunto] = useState("");
  const [sede, setSede] = useState("");
  const [rol, setRol] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [visible, setVisible] = useState(false);
  // Nuevos estados
  const [tareaPendiente, setTareaPendiente] = useState("");
  const [ultimaActividad, setUltimaActividad] = useState("");
  const [fechaUltimaActividad, setFechaUltimaActividad] = useState("");
  const [fechaNotificacion, setFechaNotificacion] = useState("");
  const [hayPlazoCopias, setHayPlazoCopias] = useState(false);
  const [fechaLimiteCopias, setFechaLimiteCopias] = useState("");
  const [diasParaRetirarCopias, setDiasParaRetirarCopias] = useState(0);
  const [estado, setEstado] = useState("pendiente");
  const [etapaInicial, setEtapaInicial] = useState("");

  const calcularDiferenciaDias = () => {
    if (!fechaLimite) return "";
    const hoy = new Date();
    const fecha = new Date(fechaLimite);
    const diferencia = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
    return diferencia > 0
      ? `Faltan ${diferencia} días`
      : `Vencida hace ${Math.abs(diferencia)} días`;
  };

  const handleGuardar = async () => {
    const nuevaTarea = {
      cliente,
      asunto,
      tipo: tipoTarea,
      descripcion: tareaPendiente,
      estructura_procesal: tipoProceso,
      rol_procesal: rol,
      sede_judicial: sede,
      etapa_inicial: etapaInicial,
      fecha_inicio: new Date().toISOString().split("T")[0],
      ultima_actividad: ultimaActividad,
      fecha_ultima_actividad: fechaUltimaActividad || null,
      fecha_notificacion: fechaNotificacion || null,
      dias_para_retirar_copias: hayPlazoCopias ? Number(diasParaRetirarCopias) : 0,
      fecha_limite_retirar_copias: hayPlazoCopias ? fechaLimiteCopias || null : null,
      fecha_limite_acto: fechaLimite || null,
      estado,
      vencida: false
    };

    try {
      const res = await fetch("https://tareas-api-c5x4.onrender.com/tareas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaTarea),
      });

      if (res.ok) {
        setMensaje("✅ Tarea guardada correctamente");
        setVisible(true);
        setTimeout(() => {
          setVisible(false);
          setTimeout(() => setMensaje(""), 500);
        }, 3000);
        setCliente("");
        setAsunto("");
        setTipoTarea("");
        setTipoProceso("");
        setSede("");
        setRol("");
        setFechaLimite("");
        setTareaPendiente("");
        setUltimaActividad("");
        setFechaUltimaActividad("");
        setFechaNotificacion("");
        setHayPlazoCopias(false);
        setFechaLimiteCopias("");
        setDiasParaRetirarCopias(0);
        setEstado("pendiente");
        setEtapaInicial("");
        if (onTareaCreada) onTareaCreada();
      } else {
        setMensaje("❌ Error al guardar la tarea");
        setVisible(true);
        setTimeout(() => {
          setVisible(false);
          setTimeout(() => setMensaje(""), 500);
        }, 3000);
      }
    } catch (err) {
      setMensaje("❌ Error de conexión con el servidor");
      setVisible(true);
      setTimeout(() => {
        setVisible(false);
        setTimeout(() => setMensaje(""), 500);
      }, 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-6">Nueva Tarea</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <label className="block mb-1 font-medium">Cliente</label>
          <input type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Ej: Juan Pérez" className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block mb-1 font-medium">Asunto</label>
          <input type="text" value={asunto} onChange={(e) => setAsunto(e.target.value)} placeholder="Ej: Juicio ordinario" className="w-full border rounded px-3 py-2" />
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1 font-medium">Tarea pendiente</label>
          <input type="text" value={tareaPendiente} onChange={(e) => setTareaPendiente(e.target.value)} placeholder="Ej: Redactar demanda" className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block mb-1 font-medium">Tipo de tarea</label>
          <select value={tipoTarea} onChange={(e) => setTipoTarea(e.target.value)} className="w-full border rounded px-3 py-2">
            <option value="">Seleccionar</option>
            <option value="judicial">Judicial</option>
            <option value="no_judicial">No Judicial</option>
          </select>
        </div>

        {tipoTarea === "judicial" && (
          <>
            <div>
              <label className="block mb-1 font-medium">Tipo de proceso judicial</label>
              <select value={tipoProceso} onChange={(e) => setTipoProceso(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="">Seleccionar</option>
                <option value="ordinario">Ordinario</option>
                <option value="laboral">Laboral</option>
                <option value="monitorio">Monitorio</option>
                <option value="penal">Penal</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Etapa procesal inicial</label>
              <input type="text" value={etapaInicial} onChange={(e) => setEtapaInicial(e.target.value)} placeholder="Ej: Demanda" className="w-full border rounded px-3 py-2" />
            </div>
          </>
        )}

        <div>
          <label className="block mb-1 font-medium">Fecha de inicio</label>
          <input type="date" value={new Date().toISOString().split("T")[0]} disabled className="w-full border rounded px-3 py-2 bg-gray-100" />
        </div>

        <div>
          <label className="block mb-1 font-medium">Última actividad realizada</label>
          <input type="text" value={ultimaActividad} onChange={(e) => setUltimaActividad(e.target.value)} placeholder="Ej: Entrega de demanda" className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block mb-1 font-medium">Fecha de última actividad</label>
          <input type="date" value={fechaUltimaActividad} onChange={(e) => setFechaUltimaActividad(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>

        {rol === "demandado" && (
          <div>
            <label className="block mb-1 font-medium">Fecha de notificación</label>
            <input type="date" value={fechaNotificacion} onChange={(e) => setFechaNotificacion(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
        )}

        <div className="md:col-span-2">
          <label className="inline-flex items-center space-x-2 font-medium">
            <input type="checkbox" checked={hayPlazoCopias} onChange={(e) => setHayPlazoCopias(e.target.checked)} />
            <span>¿Hay plazo para copias?</span>
          </label>
        </div>

        {hayPlazoCopias && (
          <>
            <div>
              <label className="block mb-1 font-medium">Fecha límite para copias</label>
              <input type="date" value={fechaLimiteCopias} onChange={(e) => setFechaLimiteCopias(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>

            <div>
              <label className="block mb-1 font-medium">Días para retirar copias</label>
              <input type="number" value={diasParaRetirarCopias} onChange={(e) => setDiasParaRetirarCopias(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
          </>
        )}

        <div>
          <label className="block mb-1 font-medium">Fecha límite acto</label>
          <input type="date" value={fechaLimite} onChange={(e) => setFechaLimite(e.target.value)} className="w-full border rounded px-3 py-2" />
          <p className="text-sm text-gray-500 mt-1">{calcularDiferenciaDias()}</p>
        </div>

        <div>
          <label className="block mb-1 font-medium">Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)} className="w-full border rounded px-3 py-2">
            <option value="pendiente">Pendiente</option>
            <option value="completado">Completado</option>
          </select>
        </div>

        {tipoTarea === "judicial" && (
          <>
            <div>
              <label className="block mb-1 font-medium">Sede Judicial</label>
              <input type="text" value={sede} onChange={(e) => setSede(e.target.value)} placeholder="Ej: Juzgado de Maldonado" className="w-full border rounded px-3 py-2" />
            </div>

            <div>
              <label className="block mb-1 font-medium">Rol procesal</label>
              <select value={rol} onChange={(e) => setRol(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="">Seleccionar</option>
                <option value="actor">Parte actora</option>
                <option value="demandado">Parte demandada</option>
              </select>
            </div>
          </>
        )}

        <div className="md:col-span-2 text-center mt-6">
          <button onClick={handleGuardar} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">Guardar tarea</button>
        </div>
      </div>

      {mensaje && (
        <p className={`mt-4 text-center font-medium ${mensaje.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
          {mensaje}
        </p>
      )}
    </div>
  );
}