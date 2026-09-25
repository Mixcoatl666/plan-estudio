"use client";

import { useEffect, useMemo, useState, type DragEvent, type FormEvent } from "react";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, GripVertical, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { flushSync } from "react-dom";

type Color = "blue" | "purple" | "orange" | "green";
type Task = { id: string; title: string; date: string | null; time: string; color: Color; completed: boolean };
type Draft = Pick<Task, "title" | "date" | "time" | "color">;
type ModelContext = { registerTool: (tool: { name: string; title: string; description: string; inputSchema: object; annotations: { readOnlyHint: boolean; untrustedContentHint: boolean }; execute: (input: unknown) => unknown }, options: { signal: AbortSignal }) => void | Promise<void> };
const KEY = "plan-estudio-v1";
const colors: { id: Color; label: string }[] = [{ id: "blue", label: "Azul" }, { id: "purple", label: "Morado" }, { id: "orange", label: "Naranja" }, { id: "green", label: "Verde" }];
const weekdays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
function dateKey(date: Date) { return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-"); }
function dateFromKey(key: string) { const [y, m, d] = key.split("-").map(Number); return new Date(y, m - 1, d); }
function shiftedDate(days: number) { const date = new Date(); date.setDate(date.getDate() + days); return dateKey(date); }
function examples(): Task[] { return [
  { id: "example-1", title: "Repasar álgebra", date: shiftedDate(0), time: "09:00", color: "blue", completed: false },
  { id: "example-2", title: "Leer capítulo 4", date: shiftedDate(1), time: "16:30", color: "purple", completed: false },
  { id: "example-3", title: "Preparar examen de historia", date: shiftedDate(3), time: "11:00", color: "orange", completed: false },
  { id: "example-4", title: "Practicar vocabulario", date: null, time: "18:00", color: "green", completed: false },
  { id: "example-5", title: "Ejercicios de física", date: null, time: "", color: "blue", completed: false },
]; }
function emptyDraft(date: string | null = null): Draft { return { title: "", date, time: "", color: "blue" }; }

function TaskCard({ task, compact, edit, toggle }: { task: Task; compact?: boolean; edit: () => void; toggle: () => void }) {
  function drag(event: DragEvent<HTMLElement>) { event.dataTransfer.setData("text/plain", task.id); event.dataTransfer.effectAllowed = "move"; }
  return <article draggable onDragStart={drag} className={["task-card", "task-" + task.color, compact ? "compact" : "", task.completed ? "completed" : ""].join(" ")}>
    <Checkbox checked={task.completed} onCheckedChange={toggle} aria-label={"Marcar " + task.title + (task.completed ? " como pendiente" : " como completada")} className="task-checkbox" />
    <button type="button" className="task-content" onClick={edit}><span className="task-title">{task.title}</span>{task.time && <span className="task-time"><Clock3 size={12} />{task.time}</span>}</button>
    {!compact && <GripVertical size={16} className="task-grip" aria-hidden="true" />}
  </article>;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(examples);
  const [loaded, setLoaded] = useState(false);
  const [month, setMonth] = useState(() => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1); });
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const today = dateKey(new Date());
  useEffect(() => {
    try { const saved = localStorage.getItem(KEY); if (saved) { const value = JSON.parse(saved); if (Array.isArray(value)) setTasks(value.filter((t) => typeof t?.id === "string" && typeof t?.title === "string")); } } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch {} }, [tasks, loaded]);
  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(context.registerTool({
        name: "create_study_task",
        title: "Crear tarea de estudio",
        description: "Crea una tarea en el calendario o en la lista sin fecha.",
        inputSchema: { type: "object", properties: { title: { type: "string" }, date: { type: ["string", "null"], description: "Fecha AAAA-MM-DD o null" }, time: { type: "string", description: "Hora HH:MM o cadena vacía" }, color: { type: "string", enum: ["blue", "purple", "orange", "green"] } }, required: ["title", "date", "time", "color"], additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input) {
          if (!input || typeof input !== "object") throw new Error("Datos de tarea inválidos");
          const value = input as Partial<Draft>;
          if (typeof value.title !== "string" || !value.title.trim() || value.title.length > 100 || !(value.date === null || (typeof value.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.date))) || typeof value.time !== "string" || (value.time !== "" && !/^([01]\d|2[0-3]):[0-5]\d$/.test(value.time)) || !colors.some(c => c.id === value.color)) throw new Error("Título, fecha, hora o color inválidos");
          const task: Task = { id: crypto.randomUUID(), title: value.title.trim(), date: value.date, time: value.time, color: value.color as Color, completed: false };
          flushSync(() => setTasks(current => [...current, task]));
          return { id: task.id, title: task.title, date: task.date, time: task.time, color: task.color };
        }
      }, { signal: lifecycle.signal })).catch(() => {});
    } catch {}
    return () => lifecycle.abort();
  }, []);
  const days = useMemo(() => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (start.getDay() + 6) % 7;
    start.setDate(1 - offset);
    const count = Math.ceil((offset + new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()) / 7) * 7;
    return Array.from({ length: count }, (_, i) => { const day = new Date(start); day.setDate(start.getDate() + i); return day; });
  }, [month]);
  const ordered = useMemo(() => [...tasks].sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99") || a.title.localeCompare(b.title, "es")), [tasks]);
  const inbox = ordered.filter(t => !t.date);
  const remaining = tasks.filter(t => !t.completed).length;
  const done = tasks.length - remaining;
  function newTask(date: string | null = null) { setEditing(null); setDraft(emptyDraft(date)); setDialog(true); }
  function editTask(task: Task) { setEditing(task.id); setDraft({ title: task.title, date: task.date, time: task.time, color: task.color }); setDialog(true); }
  function toggleTask(id: string) { setTasks(current => current.map(t => t.id === id ? { ...t, completed: !t.completed } : t)); }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const title = draft.title.trim(); if (!title) return;
    if (editing) setTasks(current => current.map(t => t.id === editing ? { ...t, ...draft, title } : t));
    else setTasks(current => [...current, { ...draft, title, id: crypto.randomUUID(), completed: false }]);
    setDialog(false);
  }
  function drop(event: DragEvent<HTMLElement>, date: string | null) {
    event.preventDefault(); setDropTarget(null);
    const id = event.dataTransfer.getData("text/plain");
    setTasks(current => current.map(t => t.id === id ? { ...t, date } : t));
  }
  function moveMonth(value: number) { setMonth(new Date(month.getFullYear(), month.getMonth() + value, 1)); }
  return <main className="app">
    <header className="topbar"><div className="brand"><div className="brand-mark"><CalendarDays size={21} /></div>Plan de estudio</div><div className="top-actions"><span className="saved"><Check size={14} /> Guardado en este navegador</span><Button onClick={() => newTask()} className="primary-button"><Plus size={17} /> Nueva tarea</Button></div></header>
    <div className="workspace">
      <aside className="sidebar">
        <div className="intro"><span className="eyebrow">TU ESPACIO</span><h1>Organiza tu estudio</h1><p>Planea tus tareas y sigue tu progreso.</p></div>
        <div className="stats"><div><span>Por hacer</span><strong>{remaining}</strong></div><div><span>Completadas</span><strong>{done}</strong></div></div>
        <div className="section-heading"><div><h2>Sin fecha</h2><span className="count">{inbox.length}</span></div><button type="button" onClick={() => newTask()} aria-label="Crear tarea sin fecha"><Plus size={19} /></button></div>
        <p className="hint">Arrastra una tarea al calendario o asígnale un día al editarla.</p>
        <div className={dropTarget === "inbox" ? "inbox drop-active" : "inbox"} onDragOver={e => { e.preventDefault(); setDropTarget("inbox"); }} onDragLeave={() => setDropTarget(null)} onDrop={e => drop(e, null)}>
          {inbox.length ? inbox.map(t => <TaskCard key={t.id} task={t} edit={() => editTask(t)} toggle={() => toggleTask(t.id)} />) : <div className="inbox-empty">Todas tus tareas tienen fecha.</div>}
        </div>
        <div className="tip"><span>✦</span><p>Haz clic en cualquier día para crear una tarea directamente allí.</p></div>
      </aside>
      <section className="calendar" aria-label="Calendario de estudio">
        <div className="calendar-head"><div><span className="eyebrow">CALENDARIO</span><h2>{new Intl.DateTimeFormat("es", { month: "long", year: "numeric" }).format(month).replace(/^./, letter => letter.toUpperCase())}</h2></div><div className="calendar-controls"><button type="button" className="today-button" onClick={() => { const now = new Date(); setMonth(new Date(now.getFullYear(), now.getMonth(), 1)); }}>Hoy</button><div className="arrows"><button type="button" aria-label="Mes anterior" onClick={() => moveMonth(-1)}><ChevronLeft size={19} /></button><button type="button" aria-label="Mes siguiente" onClick={() => moveMonth(1)}><ChevronRight size={19} /></button></div></div></div>
        <div className="weekdays">{weekdays.map(day => <span key={day}>{day}</span>)}</div>
        <div className="calendar-grid">{days.map(day => {
          const key = dateKey(day); const dayTasks = ordered.filter(t => t.date === key);
          return <div key={key} className={["day", day.getMonth() !== month.getMonth() ? "outside" : "", dropTarget === key ? "drop-active" : ""].join(" ")} onDragOver={e => { e.preventDefault(); setDropTarget(key); }} onDragLeave={() => setDropTarget(null)} onDrop={e => drop(e, key)}>
            <button type="button" className={key === today ? "day-number today" : "day-number"} onClick={() => newTask(key)} aria-label={"Crear tarea el " + new Intl.DateTimeFormat("es", { day: "numeric", month: "long" }).format(dateFromKey(key))}>{day.getDate()}</button>
            <div className="day-tasks">{dayTasks.map(t => <TaskCard key={t.id} task={t} compact edit={() => editTask(t)} toggle={() => toggleTask(t.id)} />)}</div>
            <button type="button" className="day-add" onClick={() => newTask(key)} aria-label={"Añadir tarea el " + key}><Plus size={15} /></button>
          </div>;
        })}</div>
        <div className="calendar-foot"><span><i className="dot blue-dot" /> Tarea</span><span><i className="dot gray-dot" /> Completada</span><span className="foot-help">Arrastra las tareas para cambiarles el día</span></div>
      </section>
    </div>
    <Dialog open={dialog} onOpenChange={setDialog}><DialogContent className="task-dialog" showCloseButton={false}><DialogHeader><div className="dialog-top"><div><span className="eyebrow">PLANIFICACIÓN</span><DialogTitle>{editing ? "Editar tarea" : "Nueva tarea"}</DialogTitle></div><button type="button" onClick={() => setDialog(false)} aria-label="Cerrar"><X size={19} /></button></div><DialogDescription>Organiza cuándo trabajarás en esta tarea.</DialogDescription></DialogHeader>
      <form className="task-form" onSubmit={save}><label htmlFor="title">Nombre de la tarea</label><Input id="title" autoFocus required maxLength={100} placeholder="Ej. Estudiar para el examen" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} />
        <div className="form-row"><div><label htmlFor="date">Día</label><Input id="date" type="date" value={draft.date || ""} onChange={e => setDraft({ ...draft, date: e.target.value || null })} /></div><div><label htmlFor="time">Hora</label><Input id="time" type="time" value={draft.time} onChange={e => setDraft({ ...draft, time: e.target.value })} /></div></div>
        <fieldset><legend>Color</legend><div className="colors">{colors.map(color => <button key={color.id} type="button" className={["color", "color-" + color.id, draft.color === color.id ? "selected" : ""].join(" ")} aria-label={color.label} aria-pressed={draft.color === color.id} onClick={() => setDraft({ ...draft, color: color.id })}>{draft.color === color.id && <Check size={16} />}</button>)}</div></fieldset>
        <div className="form-actions">{editing && <button type="button" className="delete" onClick={() => { setTasks(current => current.filter(t => t.id !== editing)); setDialog(false); }}><Trash2 size={16} /> Eliminar</button>}<Button type="submit" className="primary-button">{editing ? "Guardar cambios" : "Crear tarea"}</Button></div>
      </form>
    </DialogContent></Dialog>
  </main>;
}
