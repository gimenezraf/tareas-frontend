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
      fecha_inicio: new Date().toISOString().split("T")[0],
      ultima_actividad: "",
      fecha_ultima_actividad: null,
      fecha_notificacion: null,
      dias_para_retirar_copias: 0,
      fecha_limite_retirar_copias: null,
      fecha_limite_acto: fechaLimite || null,
      estado: "pendiente",
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