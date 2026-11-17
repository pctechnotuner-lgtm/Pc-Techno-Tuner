import React, { useMemo, useState } from 'react';
import { CheckSquare, Plus, CalendarDays, Clock3, CheckCircle2, Circle, RotateCcw } from 'lucide-react';

export interface WorkTask {
  id: string;
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'Closed';
  createdDate: string;
  completedAt?: string;
  updatedAt: string;
}

interface TaskViewProps {
  tasks: WorkTask[];
  onSaveTask: (task: WorkTask) => void;
}

const todayKey = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

export const TaskView: React.FC<TaskViewProps> = ({ tasks, onSaveTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<WorkTask['priority']>('Medium');
  const [tab, setTab] = useState<'today' | 'pending' | 'history'>('today');
  const [historyDate, setHistoryDate] = useState(todayKey());
  const today = todayKey();

  const visibleTasks = useMemo(() => {
    if (tab === 'pending') return tasks.filter(t => t.status === 'Pending');
    if (tab === 'history') return tasks.filter(t => t.createdDate === historyDate || (t.completedAt || '').slice(0, 10) === historyDate);
    // Today's view carries all pending tasks forward, but only today's closed tasks.
    return tasks.filter(t => t.status === 'Pending' || (t.createdDate === today && t.status === 'Closed'));
  }, [tasks, tab, historyDate, today]);

  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const todayClosed = tasks.filter(t => t.status === 'Closed' && (t.completedAt || '').slice(0, 10) === today).length;

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const now = new Date().toISOString();
    onSaveTask({ id: `task-${Date.now()}`, title: title.trim(), description: description.trim(), priority, status: 'Pending', createdDate: today, updatedAt: now });
    setTitle(''); setDescription(''); setPriority('Medium');
  };

  const updateStatus = (task: WorkTask, status: WorkTask['status']) => {
    const now = new Date().toISOString();
    onSaveTask({ ...task, status, completedAt: status === 'Closed' ? now : undefined, updatedAt: now });
  };

  return <div className="space-y-5 animate-fadeIn">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3"><div className="rounded-xl bg-blue-500/10 p-3 text-blue-300"><CheckSquare className="h-6 w-6"/></div><div><h1 className="text-2xl font-black text-white">Task Manager</h1><p className="text-sm text-slate-400">Daily work planner • PC TECHNO TUNER</p></div></div>
      <div className="flex gap-2"><span className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">{pendingCount} Pending</span><span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{todayClosed} Closed Today</span></div>
    </div>

    <form onSubmit={addTask} className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 space-y-3">
      <h2 className="font-bold text-white flex items-center gap-2"><Plus className="h-4 w-4 text-cyan-300"/> Add New Task</h2>
      <input value={title} onChange={e=>setTitle(e.target.value)} required placeholder="Task title (e.g. Call customer / CCTV visit)" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-cyan-500"/>
      <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Task details (optional)" rows={2} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-cyan-500"/>
      <div className="flex flex-wrap items-center gap-3"><select value={priority} onChange={e=>setPriority(e.target.value as WorkTask['priority'])} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"><option>Low</option><option>Medium</option><option>High</option></select><button type="submit" className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-500">Add Task</button></div>
    </form>

    <div className="flex flex-wrap items-center gap-2">
      {(['today','pending','history'] as const).map(key=><button key={key} onClick={()=>setTab(key)} className={`rounded-xl px-4 py-2.5 text-sm font-bold capitalize ${tab===key?'bg-blue-600 text-white':'border border-slate-700 bg-slate-900 text-slate-300'}`}>{key === 'today' ? "Today's Tasks" : key === 'pending' ? 'All Pending' : 'Date-wise History'}</button>)}
      {tab==='history' && <label className="ml-auto flex items-center gap-2 text-sm text-slate-300"><CalendarDays className="h-4 w-4"/><input type="date" value={historyDate} onChange={e=>setHistoryDate(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-white"/></label>}
    </div>

    <div className="space-y-3">
      {visibleTasks.length===0 ? <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-slate-400"><CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-400"/>{tab==='history'?'No tasks found for this date.':'No tasks here. Add a new task above.'}</div> : visibleTasks.slice().sort((a,b)=>Number(a.status==='Closed')-Number(b.status==='Closed') || b.updatedAt.localeCompare(a.updatedAt)).map(task=><article key={task.id} className={`rounded-2xl border p-4 ${task.status==='Closed'?'border-emerald-900/70 bg-emerald-950/20':'border-slate-700 bg-slate-900/80'}`}>
        <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className={`font-bold ${task.status==='Closed'?'text-slate-400 line-through':'text-white'}`}>{task.title}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${task.priority==='High'?'bg-rose-500/15 text-rose-300':task.priority==='Low'?'bg-slate-700 text-slate-300':'bg-amber-500/15 text-amber-300'}`}>{task.priority}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${task.status==='Closed'?'bg-emerald-500/15 text-emerald-300':'bg-orange-500/15 text-orange-300'}`}>{task.status}</span></div>{task.description && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{task.description}</p>}<p className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500"><span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3"/> Added: {task.createdDate}</span>{task.completedAt && <span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3"/> Closed: {new Date(task.completedAt).toLocaleString()}</span>}</p></div>
        <button onClick={()=>updateStatus(task,task.status==='Pending'?'Closed':'Pending')} className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold ${task.status==='Pending'?'bg-emerald-600 text-white hover:bg-emerald-500':'border border-amber-500/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20'}`}>{task.status==='Pending'?<><CheckCircle2 className="h-4 w-4"/> Close</>:<><RotateCcw className="h-4 w-4"/> Reopen</>}</button>
        </div>
      </article>)}
    </div>
    <p className="text-xs text-slate-500">Pending tasks automatically remain visible on following days. Closed tasks stay in date-wise history and do not appear in tomorrow's task list.</p>
  </div>;
};
