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
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h2>Nueva Tarea</h2>

      <label>Cliente</label>
      <input type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Ej: Juan Pérez" />

      <label>Asunto</label>
      <input type="text" value={asunto} onChange={(e) => setAsunto(e.target.value)} placeholder="Ej: Juicio ordinario" />

      <label>Tipo de tarea</label>
      <select value={tipoTarea} onChange={(e) => setTipoTarea(e.target.value)}>
        <option value="">Seleccionar</option>
        <option value="judicial">Judicial</option>
        <option value="no_judicial">No Judicial</option>
      </select>

      {/* Campos adicionales debajo de Asunto */}
      <label>Tarea pendiente</label>
      <input type="text" value={tareaPendiente} onChange={(e) => setTareaPendiente(e.target.value)} placeholder="Ej: Redactar demanda" />

      <label>Última actividad realizada</label>
      <input type="text" value={ultimaActividad} onChange={(e) => setUltimaActividad(e.target.value)} placeholder="Ej: Entrega de demanda" />

      <label>Fecha de última actividad</label>
      <input type="date" value={fechaUltimaActividad} onChange={(e) => setFechaUltimaActividad(e.target.value)} />

      <label>Fecha de notificación</label>
      <input type="date" value={fechaNotificacion} onChange={(e) => setFechaNotificacion(e.target.value)} />

      <label>
        <input type="checkbox" checked={hayPlazoCopias} onChange={(e) => setHayPlazoCopias(e.target.checked)} />
        ¿Hay plazo para copias?
      </label>

      {hayPlazoCopias && (
        <>
          <label>Fecha límite para copias</label>
          <input type="date" value={fechaLimiteCopias} onChange={(e) => setFechaLimiteCopias(e.target.value)} />

          <label>Días para retirar copias</label>
          <input type="number" value={diasParaRetirarCopias} onChange={(e) => setDiasParaRetirarCopias(e.target.value)} />
        </>
      )}

      <label>Estado</label>
      <select value={estado} onChange={(e) => setEstado(e.target.value)}>
        <option value="pendiente">Pendiente</option>
        <option value="completado">Completado</option>
      </select>

      {tipoTarea === "judicial" && (
        <>
          <label>Tipo de proceso</label>
          <select value={tipoProceso} onChange={(e) => setTipoProceso(e.target.value)}>
            <option value="">Seleccionar</option>
            <option value="ordinario">Ordinario</option>
            <option value="laboral">Laboral</option>
            <option value="monitorio">Monitorio</option>
            <option value="penal">Penal</option>
          </select>

          <label>Sede Judicial</label>
          <input type="text" value={sede} onChange={(e) => setSede(e.target.value)} placeholder="Ej: Juzgado de Maldonado" />

          <label>Rol procesal</label>
          <select value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="">Seleccionar</option>
            <option value="actor">Parte actora</option>
            <option value="demandado">Parte demandada</option>
          </select>

          {/* Etapa procesal inicial */}
          <label>Etapa procesal inicial</label>
          <input type="text" value={etapaInicial} onChange={(e) => setEtapaInicial(e.target.value)} placeholder="Ej: Demanda" />
        </>
      )}

      <label>Fecha límite</label>
      <input
        type="date"
        value={fechaLimite}
        onChange={(e) => setFechaLimite(e.target.value)}
      />
      <p>{calcularDiferenciaDias()}</p>

      <button onClick={handleGuardar} style={{ marginTop: "20px" }}>Guardar tarea</button>

      {mensaje && (
        <p
          style={{
            marginTop: "10px",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.5s ease-in-out",
          }}
        >
          {mensaje}
        </p>
      )}
    </div>
  );
}