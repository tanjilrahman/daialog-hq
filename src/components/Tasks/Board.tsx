import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Task } from '@/lib/types';
import { useUser } from '@/pages/_app';

/**
 * A simple Kanban board with columns for To Do, In Progress and Done.  Users can
 * add tasks and click to move them between statuses.  The board stores tasks
 * in the `tasks` table.
 */
export default function Board() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const fetchTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: true });
    if (!error && data) setTasks(data as Task[]);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('tasks').insert({ title, description, assignee: user?.id ?? null });
    if (!error) {
      setTitle('');
      setDescription('');
      await fetchTasks();
    }
    setLoading(false);
  };

  const updateStatus = async (task: Task, nextStatus: Task['status']) => {
    await supabase.from('tasks').update({ status: nextStatus }).eq('id', task.id);
    await fetchTasks();
  };

  const columns: { key: Task['status']; title: string; color: string }[] = [
    { key: 'todo', title: 'To Do', color: '#e5e7eb' },
    { key: 'in_progress', title: 'In Progress', color: '#a78bfa' },
    { key: 'done', title: 'Done', color: '#34d399' },
  ];

  return (
    <div className="space-y-4">
      <form onSubmit={addTask} className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          required
          className="flex-1 px-3 py-2 text-darkBlue rounded"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="flex-1 px-3 py-2 text-darkBlue rounded"
        />
        <button type="submit" disabled={loading} className="bg-lightBlue text-darkBlue px-4 py-2 rounded shadow">
          {loading ? 'Adding…' : 'Add Task'}
        </button>
      </form>
      <div className="grid md:grid-cols-3 gap-4">
        {columns.map((col) => (
          <div key={col.key} className="bg-darkBlue border border-lightBlue rounded p-2">
            <h3 className="font-semibold text-lightBlue mb-2">{col.title}</h3>
            <div className="space-y-2">
              {tasks.filter((t) => t.status === col.key).map((task) => (
                <div key={task.id} className="bg-darkBlue border border-lightBlue p-2 rounded shadow">
                  <h4 className="font-semibold text-lightBlue">{task.title}</h4>
                  {task.description && <p className="text-gray-300 text-sm">{task.description}</p>}
                  <p className="text-xs text-gray-400">Due: {task.due_date || '—'}</p>
                  <div className="flex gap-2 mt-2">
                    {col.key !== 'todo' && (
                      <button onClick={() => updateStatus(task, 'todo')} className="text-xs text-lightBlue hover:underline">
                        To Do
                      </button>
                    )}
                    {col.key !== 'in_progress' && (
                      <button onClick={() => updateStatus(task, 'in_progress')} className="text-xs text-lightBlue hover:underline">
                        In Progress
                      </button>
                    )}
                    {col.key !== 'done' && (
                      <button onClick={() => updateStatus(task, 'done')} className="text-xs text-lightBlue hover:underline">
                        Done
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}