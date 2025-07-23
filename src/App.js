import React, { useEffect, useState } from "react";

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

  // Cargar tareas desde el backend
  useEffect(() => {
    fetch(`${API_URL}/tareas`)
      .then((res) => res.json())
      .then(setTareas)
      .catch((err) => console.error("Error al cargar tareas:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convertir números
    const dataToSend = {
      ...formData,
      dias_para_retirar_copias: formData.dias_para_retirar_copias
        ? parseInt(formData.dias_para_retirar_copias)
        : null,
    };

    const res = await fetch(`${API_URL}/tareas/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    });

    if (res.ok) {
      const nuevaTarea = await res.json();
      setTareas([...tareas, nuevaTarea]);
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
    } else {
      alert("Error al crear tarea");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Tareas Judiciales y No Judiciales</h1>

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
        <button type="submit">Crear tarea</button>
      </form>

      <h2>Listado</h2>
      <ul>
        {tareas.map((t) => (
          <li key={t.id}>
            <strong>{t.cliente}</strong> - {t.asunto} ({t.tipo}) — {t.estado}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;