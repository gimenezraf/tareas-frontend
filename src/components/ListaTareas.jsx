import { useEffect, useState } from "react";

export default function ListaTareas() {
  const [tareas, setTareas] = useState([]);

  useEffect(() => {
    fetch("/api/tareas")
      .then((res) => res.json())
      .then((data) => setTareas(data))
      .catch((err) => console.error("Error al cargar tareas:", err));
  }, []);

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto" }}>
      <h2>📋 Tareas registradas</h2>
      {tareas.length === 0 ? (
        <p>No hay tareas guardadas.</p>
      ) : (
        <ul>
          {tareas.map((tarea) => (
            <li key={tarea.id} style={{ marginBottom: "10px" }}>
              <strong>{tarea.asunto}</strong> — {tarea.cliente} —{" "}
              {tarea.tipo_tarea} {tarea.tipo_proceso && `(${tarea.tipo_proceso})`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}