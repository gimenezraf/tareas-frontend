import React, { useEffect, useState } from "react";
import './App.css';
const API_URL = "https://tareas-api-c5x4.onrender.com";

function App() {
  const [tareas, setTareas] = useState([]);
  const [formData, setFormData] = useState({
    cliente: "",
    asunto: "",
    tipo: "judicial",
    fecha_inicio: "",
    ultima_actividad: "",
    fecha_ultima_actividad: "",
    fecha_notificacion: "",
    dias_para_retirar_copias: "",
    fecha_limite_retirar_copias: "",
    fecha_limite_acto: "",
    estado: "pendiente",
    vencida: false,
  });
  const [filtros, setFiltros] = useState({ cliente: "", tipo: "", estado: "" });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [tareaEditando, setTareaEditando] = useState(null);
  const [orden, setOrden] = useState("fecha_limite_acto");
  const [ordenDescendente, setOrdenDescendente] = useState(false);
  const [historialVisible, setHistorialVisible] = useState({});
  const [nuevoHistorial, setNuevoHistorial] = useState({});

  useEffect(() => {
    fetch(`${API_URL}/tareas`)
      .then((res) => res.json())
      .then((data) => {
        const hoy = new Date();
        const tareasConVencimiento = data.map((t) => {
          const fechaLimite = new Date(t.fecha_limite_acto);
          return {
            ...t,
            vencida: fechaLimite < hoy.setHours(0, 0, 0, 0),
          };
        });
        const tareasOrdenadas = tareasConVencimiento.sort(
          (a, b) => new Date(a.fecha_limite_acto) - new Date(b.fecha_limite_acto)
        );
        setTareas(tareasOrdenadas);
      })
      .catch((err) => console.error("Error al cargar tareas:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleHistorialChange = (tareaId, value) => {
    setNuevoHistorial({ ...nuevoHistorial, [tareaId]: value });
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros({
      ...filtros,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {
      ...formData,
      dias_para_retirar_copias: formData.dias_para_retirar_copias
        ? parseInt(formData.dias_para_retirar_copias)
        : null,
    };

    let res;
    if (modoEdicion && tareaEditando) {
      const dataToSendWithoutId = { ...dataToSend };
      delete dataToSendWithoutId.id;

      console.log("Editando tarea con ID:", tareaEditando.id);
      res = await fetch(`${API_URL}/tareas/${tareaEditando.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSendWithoutId),
    });
    } else {
      res = await fetch(`${API_URL}/tareas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
    }

    if (res.ok) {
      const nuevaTarea = await res.json();

      if (modoEdicion) {
        setTareas(tareas.map((t) => (t.id === tareaEditando.id ? nuevaTarea : t)));
        setModoEdicion(false);
        setTareaEditando(null);
      } else {
        setTareas([...tareas, nuevaTarea]);
      }

      setFormData({
        cliente: "",
        asunto: "",
        tipo: "judicial",
        fecha_inicio: "",
        ultima_actividad: "",
        fecha_ultima_actividad: "",
        fecha_notificacion: "",
        dias_para_retirar_copias: "",
        fecha_limite_retirar_copias: "",
        fecha_limite_acto: "",
        estado: "pendiente",
        vencida: false,
      });
      setMostrarFormulario(false);
    } else {
      const errorText = await res.text();
      alert("Error al crear o actualizar la tarea:\n" + errorText);
      console.error("Error detallado:", errorText);
    }
  };

  const handleEliminar = async (id) => {
    const confirmar = window.confirm("¿Estás seguro de que querés eliminar esta tarea?");
    if (!confirmar) return;

    try {
      const res = await fetch(`${API_URL}/tareas/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTareas(tareas.filter((t) => t.id !== id));
      } else {
        alert("Error al eliminar la tarea");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const toggleHistorial = async (tareaId) => {
    if (historialVisible[tareaId]) {
      // Si ya está visible, lo ocultamos
      setHistorialVisible((prev) => {
        const copia = { ...prev };
        delete copia[tareaId];
        return copia;
      });
    } else {
      try {
        const res = await fetch(`${API_URL}/tareas/${tareaId}/historial`);
        if (!res.ok) throw new Error("Error al obtener el historial");
        const historial = await res.json();
        setHistorialVisible((prev) => ({
          ...prev,
          [tareaId]: historial,
        }));
    }  catch (err) {
        console.error("Error al cargar historial:", err);
        alert("No se pudo cargar el historial.");
      }
    }
  };

  const iniciarEdicion = (tarea) => {
    setModoEdicion(true);
    setTareaEditando(tarea);
    setMostrarFormulario(true);
    setFormData({
      ...tarea,
      dias_para_retirar_copias: tarea.dias_para_retirar_copias || "",
    });
  };

  const esProximaAVencer = (fechaLimite) => {
    if (!fechaLimite) return false;
    const hoy = new Date();
    const fecha = new Date(fechaLimite);
    const diferencia = (fecha - hoy) / (1000 * 60 * 60 * 24);
    return diferencia <= 2 && diferencia >= 0;
  };

  const tareasFiltradas = tareas
  .filter((t) => {
    const coincideCliente =
      filtros.cliente === "" ||
      t.cliente.toLowerCase().includes(filtros.cliente.toLowerCase());

    const coincideTipo = filtros.tipo === "" || t.tipo === filtros.tipo;
    const coincideEstado = filtros.estado === "" || t.estado === filtros.estado;

    return coincideCliente && coincideTipo && coincideEstado;
  })
  .sort((a, b) => {
    let campoA = a[orden];
    let campoB = b[orden];

    // Si el campo es una fecha, convertir a Date
    if (orden.includes("fecha") && campoA && campoB) {
      campoA = new Date(campoA);
      campoB = new Date(campoB);
    } else {
      campoA = campoA?.toString().toLowerCase() || "";
      campoB = campoB?.toString().toLowerCase() || "";
    }

    if (campoA < campoB) return ordenDescendente ? 1 : -1;
    if (campoA > campoB) return ordenDescendente ? -1 : 1;
    return 0;
  });

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>ORGANIZADOR DE TAREAS</h1>
      <button
        onClick={() => {
          setMostrarFormulario(!mostrarFormulario);
          setModoEdicion(false);
          setFormData({
            cliente: "",
            asunto: "",
            tipo: "judicial",
            fecha_inicio: "",
            ultima_actividad: "",
            fecha_ultima_actividad: "",
            fecha_notificacion: "",
            dias_para_retirar_copias: "",
            fecha_limite_retirar_copias: "",
            fecha_limite_acto: "",
            estado: "pendiente",
            vencida: false,
          });
        }}
        style={{
          marginBottom: "1rem",
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          borderRadius: "5px",
          backgroundColor: "#1976d2",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        {mostrarFormulario ? "Cancelar" : "➕ Agregar tarea"}
      </button>

      {mostrarFormulario && (
  <form onSubmit={handleSubmit} style={{ marginBottom: "2rem", background: "#f9f9f9", padding: "1rem", borderRadius: "10px" }}>
    <h3>{modoEdicion ? "Editar Tarea" : "Agregar Nueva Tarea"}</h3>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
      <div>
        <label>Cliente:</label>
        <input name="cliente" value={formData.cliente} onChange={handleChange} required />
      </div>
      <div>
        <label>Asunto:</label>
        <input name="asunto" value={formData.asunto} onChange={handleChange} required />
      </div>

      <div>
        <label>Tipo de tarea:</label>
        <select name="tipo" value={formData.tipo} onChange={handleChange}>
          <option value="judicial">Judicial</option>
          <option value="no_judicial">No judicial</option>
        </select>
      </div>

      <div>
        <label>Fecha de inicio:</label>
        <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} />
      </div>

      <div>
        <label>Última actividad realizada:</label>
        <input name="ultima_actividad" value={formData.ultima_actividad} onChange={handleChange} />
      </div>
      <div>
        <label>Fecha de última actividad:</label>
        <input type="date" name="fecha_ultima_actividad" value={formData.fecha_ultima_actividad} onChange={handleChange} />
      </div>

      {formData.tipo === "judicial" && (
        <>
          <div>
            <label>Fecha de notificación judicial:</label>
            <input type="date" name="fecha_notificacion" value={formData.fecha_notificacion} onChange={handleChange} />
          </div>
          <div>
            <label>Días para retirar copias:</label>
            <input type="number" name="dias_para_retirar_copias" value={formData.dias_para_retirar_copias} onChange={handleChange} />
          </div>
          <div>
            <label>Fecha límite para retirar copias:</label>
            <input type="date" name="fecha_limite_retirar_copias" value={formData.fecha_limite_retirar_copias} onChange={handleChange} />
          </div>
          <div>
            <label>Fecha límite para el acto procesal:</label>
            <input type="date" name="fecha_limite_acto" value={formData.fecha_limite_acto} onChange={handleChange} />
          </div>
        </>
      )}

      <div>
        <label>Estado:</label>
        <select name="estado" value={formData.estado} onChange={handleChange}>
          <option value="pendiente">Pendiente</option>
          <option value="en curso">En curso</option>
          <option value="finalizada">Finalizada</option>
        </select>
      </div>
    </div>

    <button type="submit" style={{ marginTop: "1rem", padding: "0.5rem 1rem", backgroundColor: "#1976d2", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
      {modoEdicion ? "Guardar cambios" : "Agregar tarea"}
    </button>
  </form>
)}

      <div style={{ marginBottom: "2rem", display: "flex", gap: "1rem", alignItems: "center" }}>
        <input name="cliente" value={filtros.cliente} onChange={handleFiltroChange} placeholder="Filtrar por cliente" />
        <select name="tipo" value={filtros.tipo} onChange={handleFiltroChange}>
          <option value="">Todos los tipos</option>
          <option value="judicial">Judicial</option>
          <option value="no_judicial">No judicial</option>
        </select>
        <select name="estado" value={filtros.estado} onChange={handleFiltroChange}>
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en curso">En curso</option>
          <option value="finalizada">Finalizada</option>
        </select>
      </div>

      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem", alignItems: "center" }}>
        <label>Ordenar por:</label>
        <select value={orden} onChange={(e) => setOrden(e.target.value)}>
          <option value="fecha_limite_acto">Fecha límite</option>
          <option value="cliente">Cliente</option>
          <option value="estado">Estado</option>
        </select>
          <button
            onClick={() => setOrdenDescendente(!ordenDescendente)}
            style={{
            padding: "0.4rem 0.8rem",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
    }}
  >
        {ordenDescendente ? "⬇️ Descendente" : "⬆️ Ascendente"}
          </button>
      </div>

      <h2 style={{ textAlign: "center" }}>Listado de tareas</h2>

      {tareasFiltradas.map((t) => (
        <div
          key={t.id}
          className="tarea"
          style={{
            backgroundColor: t.vencida ? "#ffeaea" : "white",
            border: t.vencida ? "2px solid #e53935" : "1px solid #ddd",
            padding: "1rem",
            marginBottom: "1rem",
            borderRadius: "8px",
          }}
        >
          <h3>{t.cliente} — {t.asunto}</h3>
          <small style={{ color: "#888" }}>ID: {t.id}</small>

          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span style={{
              backgroundColor: t.tipo === "judicial" ? "#1976d2" : "#43a047",
              color: "white",
              padding: "0.25rem 0.5rem",
              borderRadius: "5px",
              fontSize: "0.8rem"
            }}>
              {t.tipo === "judicial" ? "Judicial" : "No Judicial"}
            </span>
            {t.vencida ? (
              <span style={{ backgroundColor: "#e53935", color: "white", padding: "0.25rem 0.5rem", borderRadius: "5px", fontSize: "0.8rem" }}>
                ⚠️ Vencida
              </span>
            ) : esProximaAVencer(t.fecha_limite_acto) ? (
              <span style={{ backgroundColor: "#fff176", color: "#000", padding: "0.25rem 0.5rem", borderRadius: "5px", fontSize: "0.8rem" }}>
                ⏳ Próxima a vencer
              </span>
            ) : (
              <span style={{ backgroundColor: "#fdd835", color: "#000", padding: "0.25rem 0.5rem", borderRadius: "5px", fontSize: "0.8rem" }}>
                {t.estado}
              </span>
            )}
          </div>

          <span><strong>Última actividad:</strong> {t.ultima_actividad} ({t.fecha_ultima_actividad})</span><br />
          <span><strong>Fecha límite acto:</strong> {t.fecha_limite_acto}</span><br />

          <button
            onClick={() => handleEliminar(t.id)}
            style={{
              marginTop: "0.5rem",
              padding: "0.25rem 0.5rem",
              backgroundColor: "#e53935",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            🗑 Eliminar
          </button>

          <button
            onClick={() => iniciarEdicion(t)}
            style={{
              marginTop: "0.5rem",
              marginLeft: "0.5rem",
              padding: "0.25rem 0.5rem",
              backgroundColor: "#ffa000",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            ✏️ Editar
          </button>

          <button
            onClick={() => toggleHistorial(t.id)}
            style={{
              marginTop: "0.5rem",
              marginLeft: "0.5rem",
              padding: "0.25rem 0.5rem",
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            {historialesVisibles[t.id] ? "🔽 Ocultar historial" : "📜 Ver historial"}
          </button>

            {historialesVisibles[t.id] && (
          <div
            style={{
              marginTop: "0.5rem",
              paddingLeft: "1rem",
              borderLeft: "2px solid #1976d2",
            }}
          >
          <h4>Historial:</h4>
            {Array.isArray(historialesVisibles[t.id]) && historialesVisibles[t.id].length === 0 ? (
              <p style={{ fontStyle: "italic" }}>No hay eventos registrados.</p>
            ) : (
              <div>
                <ul>
                  {historialesVisibles[t.id]?.map((h) => (
                    <li key={h.id}>
                      <strong>{new Date(h.fecha).toLocaleDateString()}</strong>: {h.descripcion}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: "1rem" }}>
                  <textarea
                    rows="2"
                    placeholder="Agregar nuevo evento..."
                    value={nuevoHistorial[t.id] || ""}
                    onChange={(e) => handleHistorialChange(t.id, e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      fontSize: "0.9rem",
                    }}
                  />
                  <button
                    onClick={() => agregarHistorial(t.id)}
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.3rem 0.7rem",
                      backgroundColor: "#43a047",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                    }}
                  >
                    ➕ Agregar evento
                  </button>
                </div>
              </div>
            )}
  </div>
)}
        </div>
      ))}
    </div>
  );
}

export default App;