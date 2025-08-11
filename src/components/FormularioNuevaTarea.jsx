import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";

// Función para formatear fecha ISO (YYYY-MM-DD) a DD/MM/YYYY solo para presentación
function formatearFechaInput(fechaISO) {
  if (!fechaISO) return "";
  const [year, month, day] = fechaISO.split("-");
  return `${day}/${month}/${year}`;
}

export default function FormularioNuevaTarea({ onTareaCreada, modoEdicion, tareaEditando }) {
  const [formData, setFormData] = useState({
    cliente: "",
    tarea: "",
    asunto: "",
    tipo_tarea: "",
    fecha_registro: new Date().toISOString().split("T")[0],
    ultima_actividad: "",
    fecha_ultima_actividad: "",
    tarea_pendiente: "",
    fecha_limite: "",
    estado: "",
    es_judicial: false,
    estructura_procesal: "",
    rol_procesal: "",
    fecha_decreto: "",
  });

  useEffect(() => {
    if (modoEdicion && tareaEditando) {
      setFormData({
        cliente: tareaEditando.cliente || "",
        tarea: tareaEditando.tarea || "",
        asunto: tareaEditando.asunto || "",
        tipo_tarea: tareaEditando.tipo_tarea || "",
        fecha_registro: tareaEditando.fecha_registro ? tareaEditando.fecha_registro.split("T")[0] : new Date().toISOString().split("T")[0],
        ultima_actividad: tareaEditando.ultima_actividad || "",
        fecha_ultima_actividad: tareaEditando.fecha_ultima_actividad ? tareaEditando.fecha_ultima_actividad.split("T")[0] : "",
        tarea_pendiente: tareaEditando.tarea_pendiente || "",
        fecha_limite: tareaEditando.fecha_limite ? tareaEditando.fecha_limite.split("T")[0] : "",
        estado: tareaEditando.estado || "",
        es_judicial: tareaEditando.es_judicial || false,
        estructura_procesal: tareaEditando.estructura_procesal || "",
        rol_procesal: tareaEditando.rol_procesal || "",
        fecha_decreto: tareaEditando.fecha_decreto ? tareaEditando.fecha_decreto.split("T")[0] : "",
      });
    }
  }, [modoEdicion, tareaEditando]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (modoEdicion && tareaEditando && tareaEditando.id) {
        response = await fetch(`/api/tareas/${tareaEditando.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch("/api/tareas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      if (!response.ok) throw new Error("Error al crear la tarea");

      setFormData({
        cliente: "",
        tarea: "",
        asunto: "",
        tipo_tarea: "",
        fecha_registro: new Date().toISOString().split("T")[0],
        ultima_actividad: "",
        fecha_ultima_actividad: "",
        tarea_pendiente: "",
        fecha_limite: "",
        estado: "",
        es_judicial: false,
        estructura_procesal: "",
        rol_procesal: "",
        fecha_decreto: "",
      });

      if (onTareaCreada) onTareaCreada();
    } catch (error) {
      alert("No se pudo crear la tarea.");
      console.error(error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 shadow-xl rounded-2xl">
      <CardContent>
        <h2 className="text-2xl font-semibold text-indigo-700 mb-6">📋 Nueva Tarea</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cliente">Cliente *</Label>
            <Input name="cliente" value={formData.cliente} onChange={handleChange} required />
          </div>

          <div>
            <Label htmlFor="tarea">Título de la tarea *</Label>
            <Input name="tarea" value={formData.tarea} onChange={handleChange} required />
          </div>

          <div>
            <Label htmlFor="asunto">Asunto *</Label>
            <Textarea name="asunto" value={formData.asunto} onChange={handleChange} required />
          </div>

          <div>
            <Label htmlFor="tipo_tarea">Tipo de tarea</Label>
            <Input name="tipo_tarea" value={formData.tipo_tarea} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="fecha_registro">
              Fecha de inicio
              {formData.fecha_registro && (
                <span className="ml-2 text-xs text-gray-500">
                  ({formatearFechaInput(formData.fecha_registro)})
                </span>
              )}
            </Label>
            <Input type="date" name="fecha_registro" value={formData.fecha_registro} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="ultima_actividad">Última actividad realizada</Label>
            <Textarea name="ultima_actividad" value={formData.ultima_actividad} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="fecha_ultima_actividad">
              Fecha de última actividad
              {formData.fecha_ultima_actividad && (
                <span className="ml-2 text-xs text-gray-500">
                  ({formatearFechaInput(formData.fecha_ultima_actividad)})
                </span>
              )}
            </Label>
            <Input type="date" name="fecha_ultima_actividad" value={formData.fecha_ultima_actividad} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="tarea_pendiente">Tarea pendiente</Label>
            <Textarea name="tarea_pendiente" value={formData.tarea_pendiente} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="fecha_limite">
              Fecha Límite
              {formData.fecha_limite && (
                <span className="ml-2 text-xs text-gray-500">
                  ({formatearFechaInput(formData.fecha_limite)})
                </span>
              )}
            </Label>
            <Input type="date" name="fecha_limite" value={formData.fecha_limite} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="estado">Estado</Label>
            <Input name="estado" value={formData.estado} onChange={handleChange} />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="es_judicial"
              name="es_judicial"
              checked={formData.es_judicial}
              onCheckedChange={(checked) => setFormData({ ...formData, es_judicial: checked })}
            />
            <Label htmlFor="es_judicial">Es Judicial</Label>
          </div>

          {formData.es_judicial && (
            <div className="space-y-4 border p-4 rounded-xl bg-slate-50">
              <div>
                <Label htmlFor="estructura_procesal">Estructura Procesal</Label>
                <Input name="estructura_procesal" value={formData.estructura_procesal} onChange={handleChange} />
              </div>

              <div>
                <Label htmlFor="rol_procesal">Rol Procesal</Label>
                <Input name="rol_procesal" value={formData.rol_procesal} onChange={handleChange} />
              </div>

              <div>
                <Label htmlFor="fecha_decreto">
                  Fecha Decreto
                  {formData.fecha_decreto && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({formatearFechaInput(formData.fecha_decreto)})
                    </span>
                  )}
                </Label>
                <Input type="date" name="fecha_decreto" value={formData.fecha_decreto} onChange={handleChange} />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full">{modoEdicion ? "Actualizar tarea" : "Crear Tarea"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}