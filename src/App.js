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
      res = await fetch(`${API_URL}/tareas/${tareaEditando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
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
      alert("Error al crear o actualizar la tarea");
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

  const tareasFiltradas = tareas.filter((t) => {
    const coincideCliente =
      filtros.cliente === "" ||
      t.cliente.toLowerCase().includes(filtros.cliente.toLowerCase());

    const coincideTipo = filtros.tipo === "" || t.tipo === filtros.tipo;
    const coincideEstado = filtros.estado === "" || t.estado === filtros.estado;

    return coincideCliente && coincideTipo && coincideEstado;
  });

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Organizador de tareas</h1>
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
        <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
          <input name="cliente" value={formData.cliente} onChange={handleChange} placeholder="Cliente" required />
          <input name="asunto" value={formData.asunto} onChange={handleChange} placeholder="Asunto" required />
          <select name="tipo" value={formData.tipo} onChange={handleChange}>
            <option value="judicial">Judicial</option>
            <option value="no_judicial">No judicial</option>
          </select>
          <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} required />
          <input name="ultima_actividad" value={formData.ultima_actividad} onChange={handleChange} placeholder="Última actividad" />
          <input type="date" name="fecha_ultima_actividad" value={formData.fecha_ultima_actividad} onChange={handleChange} />
          <input type="date" name="fecha_notificacion" value={formData.fecha_notificacion} onChange={handleChange} />
          <input type="number" name="dias_para_retirar_copias" value={formData.dias_para_retirar_copias} onChange={handleChange} placeholder="Días para retirar copias" />
          <input type="date" name="fecha_limite_retirar_copias" value={formData.fecha_limite_retirar_copias} onChange={handleChange} />
          <input type="date" name="fecha_limite_acto" value={formData.fecha_limite_acto} onChange={handleChange} />
          <select name="estado" value={formData.estado} onChange={handleChange}>
            <option value="pendiente">Pendiente</option>
            <option value="en curso">En curso</option>
            <option value="finalizada">Finalizada</option>
          </select>
          <label>
            Vencida
            <input type="checkbox" name="vencida" checked={formData.vencida} onChange={handleChange} />
          </label>
          <button type="submit">{modoEdicion ? "Guardar cambios" : "Crear tarea"}</button>
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
        </div>
      ))}
    </div>
  );
}

export default App;