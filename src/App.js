import React, { useEffect, useState } from "react";
import './App.css';
import FormularioNuevaTarea from "./components/FormularioNuevaTarea";
import TablaTareas from "./components/TablaTareas";
import { Routes, Route } from "react-router-dom";
import Workflow from "./pages/Workflow";
const API_URL = "https://tareas-api-c5x4.onrender.com";

function App() {
  const [tareas, setTareas] = useState([]);
  const [fechaHistorial, setFechaHistorial] = useState({});
  const [etapaProcesal, setEtapaProcesal] = useState({});
  const [fechaLimiteEtapa, setFechaLimiteEtapa] = useState({});
  const [formData, setFormData] = useState({
    cliente: "",
    asunto: "",
    tarea_pendiente: "",
    tipo: "judicial",
    estructura_procesal: "",
    etapa_procesal_inicial: "",
    rol_procesal: "",
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

  // Función para recargar tareas desde la API y actualizar el estado
  const obtenerTareas = async () => {
    try {
      const res = await fetch(`${API_URL}/tareas`);
      const data = await res.json();
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
      console.log("Tareas cargadas:", tareasOrdenadas);
    } catch (err) {
      console.error("Error al recargar tareas:", err);
    }
  };

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


  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros({
      ...filtros,
      [name]: value,
    });
  };


  return (
    <Routes>
      <Route
        path="/"
        element={
          <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
            <h1>ORGANIZADOR DE TAREAS</h1>
            {mostrarFormulario && (
              <FormularioNuevaTarea
                onTareaCreada={obtenerTareas}
                modoEdicion={modoEdicion}
                tareaEditando={tareaEditando}
              />
            )}
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
                  cursor: "pointer",
                }}
              >
                {ordenDescendente ? "⬇️ Descendente" : "⬆️ Ascendente"}
              </button>
            </div>

            <TablaTareas onEditarTarea={(tarea) => {
              setTareaEditando(tarea);
              setModoEdicion(true);
              setMostrarFormulario(true);
            }} />
          </div>
        }
      />
      <Route path="/workflows/:tareaId" element={<Workflow />} />
    </Routes>
  );
}

export default App;